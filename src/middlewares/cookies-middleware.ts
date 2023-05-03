import {NextFunction, Request, Response} from 'express';
import {HTTP_STATUSES} from '../utils';
import {jwtService} from '../application/jwt-service';
import {sessionsQueryRepository} from '../repositories/sessions-query-repository';

export const cookiesMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
        res.sendStatus(HTTP_STATUSES.NOT_AUTHORIZED_401)
        return
    }

    const verifiedData = await jwtService.verifyUserByToken(refreshToken)

    const session = await sessionsQueryRepository.findSessionById(verifiedData?.sessionId!)

    if (!verifiedData || !session || session.refreshToken !== refreshToken) {
        res.sendStatus(HTTP_STATUSES.NOT_AUTHORIZED_401)
        return
    }

    next()
}
