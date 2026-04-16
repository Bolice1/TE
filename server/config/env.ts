import dotenv from 'dotenv';

dotenv.config();

// we are going to load .env values here 

export const env = {
    mongo_url: process.env.MONGO_URL,
    email_user: process.env.EMAIL_USER,
    email_pass: process.env.EMAIL_PASS,
    email_service: process.env.EMAIL_SERVICE,
    jwt_secret: process.env.JWT_SECRET,
    jwt_expires_in: process.env.JWT_EXPIRES_IN
    
}