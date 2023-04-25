import {ObjectId} from 'mongodb';

export type UserModel = {
    _id?: ObjectId
    id: string
    login: string
    email: string
    passwordHash: string
    passwordSalt: string
    createdAt: string
}
