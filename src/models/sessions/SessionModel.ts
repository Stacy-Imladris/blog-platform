import {ObjectId} from 'mongodb';

export type SessionModel = {
    _id?: ObjectId
    userId: string
    deviceId: string
    deviceName: string
    ip: string
    refreshTokenPayload: string
    iat: number
    exp: number
}
