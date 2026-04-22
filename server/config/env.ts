import dotenv from 'dotenv'

// load it 
dotenv.config();

export const env = {
    dbUrl: process.env.mongo_url as string,
    emailUser: process.env.email_user as string,
    emailPass: process.env.email_pass as string,
    emailSecure: process.env.email_secure as string,
    emailservice: process.env.email_service as string,
    emailPort: process.env.email_port as string

}

// let us validat for missing env variables
if (!env.dbUrl || !env.emailUser || !env.emailPass || !env.emailSecure) {
    console.error("Missing environment variables. Please check your .env file.");
    process.exit(1);
}