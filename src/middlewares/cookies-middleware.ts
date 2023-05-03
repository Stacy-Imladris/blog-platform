import {NextFunction, Request, Response} from 'express';
import {HTTP_STATUSES} from '../utils';
import {jwtService} from '../application/jwt-service';

export const cookiesMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
        res.sendStatus(HTTP_STATUSES.NOT_AUTHORIZED_401)
        return
    }

    const verifiedData = await jwtService.verifyUserByToken(refreshToken)

    if (!verifiedData) {
        res.sendStatus(HTTP_STATUSES.NOT_AUTHORIZED_401)
        return
    }

    next()
}
