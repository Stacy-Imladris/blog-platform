import express, {Request, Response} from 'express';
import {RequestWithBody} from '../types';
import {CreateAuthModel} from '../models/auth/CreateAuthModel';
import {
    authCodeValidator,
    authLoginOrEmailValidator,
    authPasswordValidator, userExistingEmailValidator
} from '../validators/auth-validators';
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware';
import {authService} from '../domain/auth-service';
import {HTTP_STATUSES} from '../utils';
import {jwtService} from '../application/jwt-service';
import {authMiddleware} from '../middlewares/auth-middleware';
import {AuthMeModel} from '../models/auth/AuthMeModel';
import {UserViewModel} from '../models/users/UserViewModel';
import {RegistrationModel} from '../models/auth/RegistrationModel';
import {CreateUserModel} from '../models/users/CreateUserModel';
import {
    userEmailValidator,
    userLoginValidator,
    userPasswordValidator
} from '../validators/users-validators';
import {usersService} from '../domain/users-service';
import {usersQueryRepository} from '../repositories/users-query-repository';
import {emailManager} from '../managers/email-manager';
import {EmailResendingModel} from '../models/auth/EmailResendingModel';

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

    router.post('/registration-confirmation', authCodeValidator, inputValidationMiddleware,
        async (req: RequestWithBody<RegistrationModel>, res: Response) => {
            const isConfirmed = await authService.confirmEmail(req.body.code)

            if (isConfirmed) {
                res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            } else {
                res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
            }
        })

    router.post('/registration', userLoginValidator, userPasswordValidator, userEmailValidator, inputValidationMiddleware,
        async (req: RequestWithBody<CreateUserModel>, res: Response) => {
            const {login, password, email} = req.body

            const newUserId = await usersService.createUser(login, password, email, true)

            const createdUser = await usersQueryRepository.findUserByMongoIdWithoutProjection(newUserId)

            if (createdUser) {
                try {
                    await emailManager.sendEmailConfirmationMessage(createdUser)
                    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
                } catch (error) {
                    console.error(error)
                    // await usersService.deleteUser(createdUser.id)
                    res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
                }
            } else {
                res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
            }
        })

    router.post('/registration-email-resending', userExistingEmailValidator, inputValidationMiddleware,
        async (req: RequestWithBody<EmailResendingModel>, res: Response) => {
            const user = await usersQueryRepository.findUserByLoginOrEmail(req.body.email)

            if (user) {
                try {
                    await emailManager.sendEmailConfirmationMessage(user)
                    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
                } catch (error) {
                    console.error(error)
                    // await usersService.deleteUser(createdUser.id)
                    res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
                }
            } else {
                res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
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
