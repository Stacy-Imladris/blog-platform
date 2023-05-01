import {ObjectId} from 'mongodb';

export type UserModel = {
    _id?: ObjectId
    id: string
    login: string
    email: string
    passwordHash: string
    passwordSalt: string
    createdAt: string
    emailConfirmation: UserEmailConfirmationType
}

type UserEmailConfirmationType = {
    confirmationCode: string
    expirationDate: Date
    isConfirmed: boolean
    // sentEmails: SentEmailType[]
}

type SentEmailType = {
    date: Date
}
