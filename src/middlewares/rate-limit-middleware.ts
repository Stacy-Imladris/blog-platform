import {NextFunction, Request, Response} from 'express';
import {HTTP_STATUSES} from '../utils';
import {rateLimitService} from '../domain/rate-limit-service';
import {rateLimitQueryRepository} from '../repositories/rate-limit-query-repository';

export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip ?? '::1'
    const url = req.originalUrl

    await rateLimitService.commitAttempt(ip, new Date(), url)

    const attempts = await rateLimitQueryRepository.countAttempts(ip, url)

    const attemptsCount = attempts ? attempts.length : 0

    if (attemptsCount > 5) {
        res.sendStatus(HTTP_STATUSES.TOO_MANY_REQUESTS_429)
        return
    }

    next()
}
