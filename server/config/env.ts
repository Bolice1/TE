import dotenv from 'dotenv';

dotenv.config();

// we are going to load .env values here 

const env = {
    mongo_url: ProcessingInstruction.env.MONGO_URL,
    
}