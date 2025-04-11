import mongoose from 'mongoose';

interface IStudyGroup {
  name: string;
  subject: string;
  description: string;
  location: string;
  meetingTimes: string[];
  maxMembers: number;
  creator: mongoose.Types.ObjectId | Record<string, any>;
  members: mongoose.Types.ObjectId[] | Record<string, any>[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const studyGroupSchema = new mongoose.Schema<IStudyGroup>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a group name'],
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Please provide a subject'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    location: {
      type: String,
      required: [true, 'Please provide a location'],
    },
    meetingTimes: {
      type: [String],
      default: [],
    },
    maxMembers: {
      type: Number,
      default: 10,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a creator'],
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.StudyGroup || mongoose.model<IStudyGroup>('StudyGroup', studyGroupSchema); 