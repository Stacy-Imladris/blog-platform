import dateFns from 'date-fns/addSeconds'
import {rateLimitCollection} from '../db/db';
import {RateModel} from '../models/rate/RateModel';
import {Nullable} from '../types';

export const rateLimitQueryRepository = {
    async countAttempts(ip: string, url: string): Promise<Nullable<RateModel[]>> {
        const date = new Date()

        return await rateLimitCollection.find({
            ip,
            url,
            date: {
                $gte: dateFns(date, -10),
                $lt: date
            },
        }).toArray()
    },
}
