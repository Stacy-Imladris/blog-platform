import {rateLimitCollection} from '../db/db';
import {CreateRateModel} from '../models/rate/CreateRateModel';

export const rateLimitRepository = {
    async createAttempt(attempt: CreateRateModel): Promise<void> {
        await rateLimitCollection.insertOne(attempt)
    },
}
