import {ObjectId} from 'mongodb';

export type BlogModel = {
    _id: ObjectId
    id: string
    name: string
    description: string
    websiteUrl: string
    createdAt: string
    isMembership: boolean
}