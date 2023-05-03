import express, {Request, Response} from 'express';
import {APIErrorResultType, RequestWithBody} from '../types';
import {CreateAuthModel} from '../models/auth/CreateAuthModel';
import {
    authCodeValidator,
    authLoginOrEmailValidator,
    authPasswordValidator,
    userExistingEmailValidator
} from '../validators/auth-validators';
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware';
import {authService} from '../domain/auth-service';
import {createErrorForExistingLoginOrEmail, HTTP_STATUSES} from '../utils';
import {jwtService} from '../application/jwt-service';
import {authMiddleware} from '../middlewares/auth-middleware';
import {AuthMeModel} from '../models/auth/AuthMeModel';
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
import {usersRepository} from '../repositories/users-repository';
import {UserViewModel} from '../models/users/UserViewModel';
import {v4} from 'uuid';
import {sessionsService} from '../domain/sessions-service';
import {cookiesMiddleware} from '../middlewares/cookies-middleware';

export const getAuthRouter = () => {
    const router = express.Router()

    router.post('/login', authLoginOrEmailValidator, authPasswordValidator, inputValidationMiddleware, async (req: RequestWithBody<CreateAuthModel>, res: Response<ResponseWithToken>) => {
        const {loginOrEmail, password} = req.body

        const userAgent: string = req.headers['user-agent'] ?? ''
        const ip: string = req.ip ?? ''

        const user = await authService.checkCredentials(loginOrEmail, password)

        if (!user) {
            res.sendStatus(HTTP_STATUSES.NOT_AUTHORIZED_401)
            return
        }

        const sessionId = v4()
        const accessToken = await jwtService.createJWT(user)
        const refreshToken = await jwtService.createRefreshJWT(user, sessionId)

        await sessionsService.createSession({
            userId: user.id,
            sessionId,
            userAgent,
            ip,
            refreshToken
        })

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true
        })

        res.json({accessToken})
    })

    router.post('/refresh-token', cookiesMiddleware, async (req: Request, res: Response<ResponseWithToken>) => {
        const refreshToken = req.cookies.refreshToken

        const userAgent: string = req.headers['user-agent'] ?? ''
        const ip: string = req.ip ?? ''

        const verifiedData = await jwtService.verifyUserByToken(refreshToken)

        const user = await usersQueryRepository.findUserById(verifiedData!.id)

        if (!refreshToken || !verifiedData || !user) {
            res.sendStatus(HTTP_STATUSES.NOT_AUTHORIZED_401)
            return
        }

        const accessToken = await jwtService.createJWT(user)
        const newRefreshToken = await jwtService.createRefreshJWT(user, verifiedData.sessionId!)

        await sessionsService.updateSession(verifiedData.sessionId!, {
            userId: user.id,
            userAgent,
            ip,
            refreshToken: newRefreshToken
        })

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: true
        })

        res.json({accessToken})
    })

    router.post('/logout', cookiesMiddleware, async (req: Request, res: Response) => {
        const {refreshToken} = req.cookies

        const verifiedData = await jwtService.verifyUserByToken(refreshToken)

        const user = await usersQueryRepository.findUserById(verifiedData!.id)

        if (!refreshToken || !verifiedData || !user) {
            res.sendStatus(HTTP_STATUSES.NOT_AUTHORIZED_401)
            return
        }

        await sessionsService.deleteSession(verifiedData.sessionId!)

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
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

            const isLoginAndEmailExists = await usersQueryRepository.getIsUserExistsByLoginAndEmail(login, email)

            const errorObject: APIErrorResultType = {errorsMessages: []}

            if (isLoginAndEmailExists.login) {
                errorObject.errorsMessages.push(createErrorForExistingLoginOrEmail('login'))
            }
            if (isLoginAndEmailExists.email) {
                errorObject.errorsMessages.push(createErrorForExistingLoginOrEmail('email'))
            }

            if (errorObject.errorsMessages.length) {
                res.status(HTTP_STATUSES.BAD_REQUEST_400).json(errorObject)
                return
            }

            const newUserId = await usersService.createUser(login, password, email, true)

            const createdUser = await usersQueryRepository.findUserByMongoIdWithoutProjection(newUserId)

            if (createdUser) {
                try {
                    await emailManager.sendEmailConfirmationMessage(createdUser.email, createdUser.emailConfirmation.confirmationCode)
                    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
                } catch (error) {
                    console.error(error)
                    res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
                }
            } else {
                res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
            }
        })

    router.post('/registration-email-resending', userExistingEmailValidator, inputValidationMiddleware,
        async (req: RequestWithBody<EmailResendingModel>, res: Response) => {
            const user = await usersQueryRepository.findUserByLoginOrEmail(req.body.email)

            try {
                if (user && !user.emailConfirmation.isConfirmed) {
                    const newConfirmationCode = await usersRepository.updateConfirmationCode(user._id!)

                    if (newConfirmationCode) {
                        await emailManager.sendEmailConfirmationMessage(user.email, newConfirmationCode)
                        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
                        return
                    }
                }
            } catch (error) {
                console.error(error)
            }

            res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
        })

    router.get('/me', authMiddleware, async (req: Request, res: Response<AuthMeModel>) => {
        const {id, login, email} = req.user as UserViewModel

        const authMeData: AuthMeModel = {
            userId: id,
            login,
            email
        }

        res.json(authMeData)
        return
    })

    return router
}

//types
type ResponseWithToken = {
    accessToken: string
}
