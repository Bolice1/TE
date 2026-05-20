import dotenv from 'dotenv'

// we are going to deal with all the stuffs here

export const envConfig{
    email_user: process.env.emailUser as string,
    jwt_token: process.env.jwt_token as string,
    refresh_token: process.env.refresh_token as string,
    db: process.env.db as string

}

// we are going to add a validation/check layer

if (!envConfig.email_user || !envConfig.jwt_token || !envConfig.refresh_token||!db) {
    console.log("some env values are not set");
}