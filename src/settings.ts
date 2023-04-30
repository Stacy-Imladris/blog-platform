import * as dotenv from 'dotenv'
dotenv.config()

export const settings = {
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/blog-platform-local',
    BASIC_AUTH_TOKEN: process.env.BASIC_AUTH_TOKEN || 'YWRtaW46cXdlcnR5',
    JWT_SECRET: process.env.JWT_SECRET || '123',
}
