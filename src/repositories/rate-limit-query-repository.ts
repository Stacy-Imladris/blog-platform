import dateFns from 'date-fns/addSeconds'
import {rateLimitCollection} from '../db/db';
import {RateModel} from '../models/rate/RateModel';

export const rateLimitQueryRepository = {
    async countAttempts(ip: string, url: string): Promise<RateModel[] | null> {
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
