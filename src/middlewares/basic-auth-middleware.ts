import {NextFunction, Request, Response} from 'express';
import {HTTP_STATUSES} from '../utils';
import {header, getBasicAuthString} from '../db/db';
import {settings} from '../settings';

export const basicAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authToken = req.headers[header]
    if (!authToken || authToken !== getBasicAuthString(settings.BASIC_AUTH_TOKEN)) {
        res.sendStatus(HTTP_STATUSES.NOT_AUTHORIZED_401)
    } else {
        next()
    }
}