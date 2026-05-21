import dotenv from 'dotenv'
import type { Date } from 'mongoose'

dotenv.config()
export const envConfiguration = {

    email_user: process.env.email_user as string,
    email_pass: process.env.email_pass as string,
    jwt_token: process.env.jwt_token as string,
    refresh_token: process.env.refresh_token as string,
    db: process.env.db as string,
    tokenExpiresIn: process.env.tokenExpiresIn as string,
    expires_at: process.env.expires_at as string
}

// let us validate and check 
if (!envConfiguration.email_pass || !envConfiguration.email_user || !envConfiguration.jwt_token || !envConfiguration.refresh_token || !envConfiguration.db || !envConfiguration.tokenExpiresIn || !envConfiguration.expires_at) {
    console.log("some env values are missing pleaze")
    process.abort()
}
export default envConfiguration;

