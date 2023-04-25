import express, {Response} from 'express';
import {RequestWithBody} from '../types';
import {CreateAuthModel} from '../models/auth/CreateAuthModel';
import {
    authLoginOrEmailValidator,
    authPasswordValidator
} from '../validators/auth-validators';
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware';
import {authService} from '../domain/auth-service';
import {HTTP_STATUSES} from '../utils';

export const getAuthRouter = () => {
    const router = express.Router()

    router.post('/login', authLoginOrEmailValidator, authPasswordValidator, inputValidationMiddleware, async (req: RequestWithBody<CreateAuthModel>, res: Response<void>) => {
        const {loginOrEmail, password} = req.body

        const isUserLoggedIn = await authService.checkCredentials(loginOrEmail, password)

        if (isUserLoggedIn) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            return
        }

        res.sendStatus(HTTP_STATUSES.NOT_AUTHORIZED_401)
    })

    return router
}