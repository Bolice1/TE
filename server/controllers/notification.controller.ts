import type { Request, Response } from 'express';
import Notification from '../models/notification.model.js';
import { buildTeacherCachePrefix } from '../utils/cache.js';

export const listNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Authentication required.' });

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      Notification.countDocuments({ recipient: userId }),
      Notification.find({ recipient: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ]);

    return res.status(200).json({ total, page, limit, data: items });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list notifications.', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const markRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Authentication required.' });

    const id = req.params.id;
    const n = await Notification.findOneAndUpdate({ _id: id, recipient: userId }, { $set: { isRead: true } }, { new: true });
    if (!n) return res.status(404).json({ message: 'Notification not found.' });
    return res.status(200).json({ message: 'Marked read.', notification: n });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to mark read.', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const markAllRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Authentication required.' });

    await Notification.updateMany({ recipient: userId, isRead: false }, { $set: { isRead: true } });
    return res.status(200).json({ message: 'All notifications marked read.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to mark all read.', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
