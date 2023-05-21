import {ObjectId} from 'mongodb';

export type RateModel = {
    _id?: ObjectId
    ip: string
    date: Date
    url: string
}
