import {NextFunction, Request, Response} from 'express';
import {validationResult} from 'express-validator';
import {HTTP_STATUSES} from '../utils';
import {APIErrorResultType} from '../types';

export const inputValidationMiddleware = (req: Request, res: Response<APIErrorResultType>, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorsMessages = errors.array().map(error => ({message: error.msg, field: error.type === 'field' ? error.path : null }))

        res.status(HTTP_STATUSES.BAD_REQUEST_400).json({errorsMessages})
    } else {
        next()
    }
}