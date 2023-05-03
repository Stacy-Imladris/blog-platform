import {ObjectId} from 'mongodb';

export type SessionModel = {
    _id?: ObjectId
    userId: string
    sessionId: string
    userAgent: string
    ip: string
    refreshToken: string
    createdAt: string
    updatedAt: string
}
