import express, {Request, Response} from 'express';
import {RequestWithBody} from '../types';
import {CreateAuthModel} from '../models/auth/CreateAuthModel';
import {
    authLoginOrEmailValidator,
    authPasswordValidator
} from '../validators/auth-validators';
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware';
import {authService} from '../domain/auth-service';
import {HTTP_STATUSES} from '../utils';
import {jwtService} from '../application/jwt-service';
import {authMiddleware} from '../middlewares/auth-middleware';
import {AuthMeModel} from '../models/auth/AuthMeModel';
import {UserViewModel} from '../models/users/UserViewModel';

export const getAuthRouter = () => {
    const router = express.Router()

    router.post('/login', authLoginOrEmailValidator, authPasswordValidator, inputValidationMiddleware, async (req: RequestWithBody<CreateAuthModel>, res: Response<ResponseWithToken>) => {
        const {loginOrEmail, password} = req.body

        const user = await authService.checkCredentials(loginOrEmail, password)

        if (user) {
            const accessToken = await jwtService.createJWT(user)

            res.json({accessToken})
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_AUTHORIZED_401)
        }
    })

    router.get('/me', authMiddleware, async (req: Request, res: Response<AuthMeModel>) => {
        const {id, login, email} = req.user as UserViewModel

        const authMeData: AuthMeModel = {
            userId: id,
            login,
            email
        }

        res.json(authMeData)
    })

    return router
}

//types
type ResponseWithToken = {
    accessToken: string
}
