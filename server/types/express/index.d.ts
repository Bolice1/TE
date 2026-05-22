import 'express';

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      email: string;
      role: 'teacher';
      name: string;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
