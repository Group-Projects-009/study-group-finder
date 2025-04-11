import mongoose from 'mongoose';

interface INotification {
  userId: mongoose.Types.ObjectId;
  type: string;
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new mongoose.Schema<INotification>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: ['group_invite', 'group_join', 'group_leave', 'new_message', 'study_reminder'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema); 