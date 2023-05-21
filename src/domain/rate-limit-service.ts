import {rateLimitRepository} from '../repositories/rate-limit-repository';
import {CreateRateModel} from '../models/rate/CreateRateModel';

export const rateLimitService = {
    async commitAttempt(ip: string, date: Date, url: string): Promise<void> {
        const attempt: CreateRateModel = {ip, date, url}

        await rateLimitRepository.createAttempt(attempt)
    },
}
