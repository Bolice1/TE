import mongoose from 'mongoose';

export interface INotification {
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  title: string;
  message: string;
  isRead: boolean;
  createdAt?: Date;
}

const notificationSchema = new mongoose.Schema<INotification>(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'Coach', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'Coach' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

notificationSchema.index({ recipient: 1, isRead: 1 });

const Notification = mongoose.model<INotification>('Notification', notificationSchema);
export default Notification;
