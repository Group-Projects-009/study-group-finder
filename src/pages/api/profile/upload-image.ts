import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import formidable from 'formidable';
import { MongoClient, GridFSBucket } from 'mongodb';
import fs from 'fs';
import { Readable } from 'stream';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Parse form data
    const form = formidable({});
    const [fields, files] = await form.parse(req);
    const file = files.image?.[0];

    if (!file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Connect to MongoDB
    const client = await MongoClient.connect(process.env.MONGODB_URI as string);
    const db = client.db();
    const bucket = new GridFSBucket(db, {
      bucketName: 'profile_images'
    });

    // Create a unique filename using user ID and timestamp
    const timestamp = Date.now();
    const filename = `${session.user.id}_${timestamp}`;

    // Create read stream from file
    const readStream = fs.createReadStream(file.filepath);

    // Upload file to GridFS
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: file.mimetype || 'image/jpeg',
      metadata: {
        userId: session.user.id,
        originalName: file.originalFilename,
        uploadDate: new Date(),
      }
    });

    // Pipe the file to GridFS
    await new Promise((resolve, reject) => {
      readStream.pipe(uploadStream)
        .on('error', (error) => {
          fs.unlink(file.filepath, () => {});
          reject(error);
        })
        .on('finish', () => {
          fs.unlink(file.filepath, () => {});
          resolve(uploadStream.id);
        });
    });

    // Generate URL for the uploaded file
    const imageUrl = `/api/images/${uploadStream.id}`;

    // Close MongoDB connection
    await client.close();

    // Return the image URL
    return res.status(200).json({
      imageUrl,
      fileId: uploadStream.id.toString()
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ message: 'Failed to upload image' });
  }
} 