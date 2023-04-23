import {NextFunction, Request, Response} from 'express';
import {HTTP_STATUSES} from '../utils';
import {header, token} from '../db/__db';

export const basicAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authToken = req.headers[header]
    if (!authToken || authToken !== token) {
        res.sendStatus(HTTP_STATUSES.NOT_AUTHORIZED_401)
    } else {
        next()
    }
}