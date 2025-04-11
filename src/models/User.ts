import mongoose from 'mongoose';

interface IUser {
  name: string;
  email: string;
  password?: string;
  image?: string;
  bio?: string;
  location?: string;
  education?: string;
  major?: string;
  interests?: string[];
  availability?: string[];
  joinedGroups?: mongoose.Types.ObjectId[];
  createdGroups?: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
    },
    image: {
      type: String,
      default: null,
    },
    bio: String,
    location: String,
    education: String,
    major: String,
    interests: [String],
    availability: [String],
    joinedGroups: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudyGroup',
      default: [],
    }],
    createdGroups: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudyGroup',
      default: [],
    }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema); 