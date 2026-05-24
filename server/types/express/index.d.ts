import 'express';

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      email: string;
      role: 'SUPER_ADMIN' | 'COACH';
      name: string;
      coachingName: string;
      sessionId: string;
      isActive?: boolean;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
