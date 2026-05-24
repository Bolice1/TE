import type { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import Coach from '../models/coach.model.js';
import TeacherSession from '../models/session.model.js';
import Notification from '../models/notification.model.js';
import { buildTeacherCachePrefix, deleteCachedByPrefix } from '../utils/cache.js';
import { writeAuditLog } from '../services/audit.service.js';
import { sendCoachOnboardingEmail } from '../utils/coach-onboarding.email.js';
import { deliverEmail } from '../utils/email.js';

const SALT_ROUNDS = 10;

const sanitizeCoach = (c: any) => ({
  id: c.id,
  name: c.name,
  email: c.email,
  coachingName: c.coachingName,
  address: c.address,
  phoneNumber: c.phoneNumber,
  role: c.role,
  isActive: c.isActive,
  createdAt: c.createdAt,
});

export const createCoach = async (req: Request, res: Response) => {
  try {
    const { name, email, coachingName, address, phoneNumber } = req.body;
    if (!name || !email || !coachingName || !address) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const existing = await Coach.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Coach with this email already exists.' });

    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashed = await bcrypt.hash(tempPassword, SALT_ROUNDS);

    const coach = await Coach.create({
      name,
      email,
      coachingName,
      address,
      phoneNumber,
      password: hashed,
      role: 'COACH',
      isActive: true,
      mustChangePassword: true,
    });

    // Send onboarding email (best effort)
    try {
      const emailResult = await sendCoachOnboardingEmail(email, tempPassword);
      if (!emailResult.delivered) {
        console.warn('Onboarding email not delivered:', emailResult.error);
      }
    } catch (err) {
      console.warn('Failed to send onboarding email:', err instanceof Error ? err.message : err);
    }

    await writeAuditLog({ req, action: 'admin_create_coach', entityType: 'coach', entityId: coach.id, status: 'success' }).catch(() => undefined);

    return res.status(201).json({ message: 'Coach created.', coach: sanitizeCoach(coach) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create coach.', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const listCoaches = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [total, coaches] = await Promise.all([
      Coach.countDocuments({ isDeleted: false }),
      Coach.find({ isDeleted: false }).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-password'),
    ]);

    return res.status(200).json({ total, page, limit, data: coaches.map(sanitizeCoach) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list coaches.', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getCoachDetails = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const coach = await Coach.findById(id).select('-password');
    if (!coach || coach.isDeleted) return res.status(404).json({ message: 'Coach not found.' });
    return res.status(200).json({ coach: sanitizeCoach(coach) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch coach.', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const deactivateCoach = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const coach = await Coach.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: { isActive: false } }, { new: true }).select('-password');
    if (!coach) return res.status(404).json({ message: 'Coach not found.' });

    // revoke sessions
    await TeacherSession.updateMany({ teacher: coach._id }, { $set: { revokedAt: new Date() } }).catch(() => undefined);

    await deleteCachedByPrefix(buildTeacherCachePrefix(id, '')).catch(() => undefined);

    return res.status(200).json({ message: 'Coach deactivated.', coach: sanitizeCoach(coach) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to deactivate coach.', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const reactivateCoach = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const coach = await Coach.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: { isActive: true } }, { new: true }).select('-password');
    if (!coach) return res.status(404).json({ message: 'Coach not found.' });
    return res.status(200).json({ message: 'Coach reactivated.', coach: sanitizeCoach(coach) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to reactivate coach.', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const sendNotification = async (req: Request, res: Response) => {
  try {
    const { recipientIds, title, message, broadcast } = req.body;
    if (!title || !message) return res.status(400).json({ message: 'Title and message are required.' });

    let recipients: any[] = [];

    if (broadcast) {
      recipients = await Coach.find({ isDeleted: false }).select('_id email');
    } else if (Array.isArray(recipientIds) && recipientIds.length) {
      recipients = await Coach.find({ _id: { $in: recipientIds }, isDeleted: false }).select('_id email');
    } else {
      return res.status(400).json({ message: 'No recipients specified.' });
    }

    const notifications = recipients.map((r) => ({ recipient: r._id, title, message }));
    await Notification.insertMany(notifications);

    // send emails (best-effort, non-blocking per recipient)
    for (const r of recipients) {
      (async () => {
        try {
          await deliverEmail({
            to: r.email,
            subject: title,
            html: `<p>${message}</p>`,
          });
        } catch (err) {
          console.warn('Failed to send notification email to', r.email, err instanceof Error ? err.message : err);
        }
      })();
    }

    await writeAuditLog({ req, action: 'admin_send_notification', entityType: 'notification', status: 'success' }).catch(() => undefined);

    return res.status(200).json({ message: 'Notifications created and emails enqueued.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send notification.', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const totalCoaches = await Coach.countDocuments({ isDeleted: false });
    // TODO: aggregate students, courses, usage
    return res.status(200).json({ totalCoaches, totalStudents: 0 });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch dashboard stats.', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
