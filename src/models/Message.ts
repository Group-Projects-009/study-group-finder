import mongoose from 'mongoose';

interface IMessage {
  studyGroup: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId | Record<string, any>;
  content: string;
  fileUrl?: string;
  fileType?: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new mongoose.Schema<IMessage>(
  {
    studyGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudyGroup',
      required: [true, 'Study group is required'],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    fileUrl: {
      type: String,
    },
    fileType: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Message || mongoose.model<IMessage>('Message', messageSchema); 