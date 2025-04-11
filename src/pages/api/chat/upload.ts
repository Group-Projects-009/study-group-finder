import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false,
  },
};

const allowedFileTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const maxFileSize = 10 * 1024 * 1024; // 10MB

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const form = formidable({
      maxFileSize,
      uploadDir,
      keepExtensions: true,
    });

    console.log('Processing file upload');
    
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Error parsing form:', err);
          reject(err);
        }
        resolve([fields, files]);
      });
    });

    console.log('Files received:', Object.keys(files));
    
    const file = files.file?.[0] as formidable.File;
    if (!file) {
      console.error('No file found in the request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('File details:', {
      originalFilename: file.originalFilename,
      size: file.size,
      mimetype: file.mimetype,
      filepath: file.filepath
    });

    // Validate file type
    if (!allowedFileTypes.includes(file.mimetype || '')) {
      console.error('Invalid file type:', file.mimetype);
      fs.unlinkSync(file.filepath);
      return res.status(400).json({ message: 'File type not allowed' });
    }

    // Generate unique filename
    const fileExtension = path.extname(file.originalFilename || '');
    const newFilename = `${uuidv4()}${fileExtension}`;
    const newPath = path.join(uploadDir, newFilename);

    // Rename file
    fs.renameSync(file.filepath, newPath);
    console.log('File saved to:', newPath);

    // Return file URL with absolute path for browser access
    const fileUrl = `/uploads/${newFilename}`;
    console.log('File URL:', fileUrl);
    
    return res.status(200).json({ url: fileUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ message: 'Error uploading file', error: (error as Error).message });
  }
} 