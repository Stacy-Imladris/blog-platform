import {NextFunction, Request, Response} from 'express';
import {HTTP_STATUSES} from '../utils';
import {jwtService} from '../application/jwt-service';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
        res.sendStatus(HTTP_STATUSES.NOT_AUTHORIZED_401)
        return
    }
    const token = req.headers.authorization.split(' ')[1]
    const user = await jwtService.getUserIdByToken(token)
    if (user) {
        req.user = user
        next()
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_AUTHORIZED_401)
    }
}
