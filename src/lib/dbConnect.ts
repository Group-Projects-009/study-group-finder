import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

/**
 * Global variable to maintain the MongoDB connection
 */
let isConnected = false;

/**
 * Connect to MongoDB database
 */
async function dbConnect() {
  // Return if already connected
  if (isConnected) {
    return;
  }

  if (!MONGODB_URI) {
    console.warn('No MongoDB URI provided. Using mock data instead.');
    return;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI);
    
    isConnected = !!db.connections[0].readyState;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default dbConnect;
