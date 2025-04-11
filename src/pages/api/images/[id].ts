import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid image ID' });
  }

  let client: MongoClient | null = null;

  try {
    // Connect to MongoDB
    client = await MongoClient.connect(process.env.MONGODB_URI as string);
    const db = client.db();
    const bucket = new GridFSBucket(db, {
      bucketName: 'profile_images'
    });

    // Find the file metadata
    const files = await bucket.find({ _id: new ObjectId(id) }).toArray();
    
    if (!files.length) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const file = files[0];

    // Set appropriate headers
    res.setHeader('Content-Type', file.contentType || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    // Create download stream
    const downloadStream = bucket.openDownloadStream(new ObjectId(id));

    // Pipe the file chunks to the response
    downloadStream.pipe(res);

    // Handle errors
    downloadStream.on('error', () => {
      res.status(404).json({ message: 'Error retrieving image' });
    });

    // Clean up when done
    downloadStream.on('end', () => {
      if (client) {
        client.close();
      }
    });
  } catch (error) {
    if (client) {
      await client.close();
    }
    console.error('Error serving image:', error);
    res.status(500).json({ message: 'Error serving image' });
  }
} 