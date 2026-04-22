import { Request, Response } from "express";
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    msg: "Too many requests, try again later"
  },

  handler: (req: Request, res: Response) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip}`);

    return res.status(429).json({
      msg: "Too many requests, try again later"
    });
  }
});

export default limiter;