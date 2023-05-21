import {HTTP_STATUSES} from '../src/utils';
import {getBasicAuthString, getJwtAuthString, header, runDB, stopDB} from '../src/db/db';
import {Nullable} from '../src/types';
import {CreateUserModel} from '../src/models/users/CreateUserModel';
import {UserViewModel} from '../src/models/users/UserViewModel';
import {CreateAuthModel} from '../src/models/auth/CreateAuthModel';
import {settings} from '../src/settings';
import {getRequest} from '../src/app';
import {parseJwt} from '../src/utils/parseJwt';
import {sessionsQueryRepository} from '../src/repositories/sessions-query-repository';
import {usersQueryRepository} from '../src/repositories/users-query-repository';
import {UserModel} from '../src/models/users/UserModel';

describe('/auth', () => {
    let createdUser1: Nullable<UserViewModel> = null
    let createdUser2: Nullable<UserModel> = null
    let accessToken1: Nullable<string> = null
    let accessToken2: Nullable<string> = null
    let refreshToken1: Nullable<string> = null
    let refreshToken2: Nullable<string> = null

    beforeAll(async () => {
        await runDB()
        await getRequest().delete('/testing/all-data')

        const data: CreateUserModel = {
            login: 'login',
            password: '12345678',
            email: 'emltstgml27@mail27.ooo',
        }

        const createdResponse = await getRequest()
            .post('/users')
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .send(data)
            .expect(HTTP_STATUSES.CREATED_201)

        createdUser1 = createdResponse.body
    })

    afterAll(async () => {
        await stopDB()
    })

    it('POST /auth/login - shouldn\'t login user with invalid password value', async () => {
        const data = {
            loginOrEmail: 'login',
            password: 12345678
        }

        const res = await getRequest()
            .post('/auth/login')
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        const errors = res.body

        expect(errors).toEqual({
            errorsMessages: [{
                message: `Value 'password' should be type string`,
                field: 'password'
            }]
        })
    })

    it('POST /auth/login - shouldn\'t login user with wrong credentials', async () => {
        const data: CreateAuthModel = {
            loginOrEmail: 'login',
            password: 'wrong-password'
        }

        await getRequest()
            .post('/auth/login')
            .send(data)
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401)
    })

    it('POST /auth/login - should login user with correct credentials', async () => {
        const data: CreateAuthModel = {
            loginOrEmail: 'login',
            password: '12345678'
        }

        const res = await getRequest()
            .post('/auth/login')
            .send(data)
            .expect(HTTP_STATUSES.OK_200)

        const cookie = res.get('Set-Cookie')
        refreshToken1 = cookie[0].split('=')[1]

        const dataInToken = parseJwt(refreshToken1)

        const session = await sessionsQueryRepository.findSessionById(dataInToken.deviceId)

        accessToken1 = res.body.accessToken

        expect(typeof accessToken1).toBe('string')
        expect(session).not.toBe(null)
        expect(session!.userId).toBe(dataInToken.id)
    })

    it('POST /auth/refresh-token - shouldn\'t refresh token if the JWT refreshToken inside cookie is missing', async () => {
        await getRequest()
            .post('/auth/refresh-token')
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401)
    })

    it('POST /auth/refresh-token - shouldn\'t refresh token if the JWT refreshToken inside cookie is incorrect', async () => {
        await getRequest()
            .post('/auth/refresh-token')
            .set('Cookie', [`refreshToken=incorrect-refresh-token`])
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401)
    })

    it('POST /auth/refresh-token - should return JWT accessToken in body and JWT refreshToken in cookie', async () => {
        const res = await getRequest()
            .post('/auth/refresh-token')
            .set('Cookie', [`refreshToken=${refreshToken1}`])
            .expect(HTTP_STATUSES.OK_200)

        accessToken2 = res.body.accessToken

        const cookie = res.get('Set-Cookie')
        refreshToken2 = cookie[0].split('=')[1]

        expect(typeof accessToken2).toBe('string')
        expect(typeof refreshToken2).toBe('string')
    })

    it('POST /auth/registration - shouldn\'t register user with incorrect input data', async () => {
        const data = {
            login: 'incorrect-login',
            password: 12345678,
            email: 'email'
        }

        await getRequest()
            .post('/auth/registration')
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        const user = await usersQueryRepository.findUserByLoginOrEmail(data.login)

        expect(user).toEqual(null)
    })

    it('POST /auth/registration - should register user with correct input data', async () => {
        const data = {
            login: 'stacy',
            password: '12345678',
            email: 'ada.davis27@gmail.com'
        }

        await getRequest()
            .post('/auth/registration')
            .send(data)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        createdUser2 = await usersQueryRepository.findUserByLoginOrEmail(data.login)

        expect(createdUser2).not.toEqual(null)
        expect(createdUser2!.login).toEqual(data.login)
        expect(createdUser2!.email).toEqual(data.email)
    })

    it('POST /auth/registration-email-resending - shouldn\'t resend email with confirmation code if the inputModel has incorrect values', async () => {
        const data = {
            email: 'email'
        }

        const res = await getRequest()
            .post('/auth/registration-email-resending')
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(res.body).toEqual({
            errorsMessages: [
                {
                    message: 'Value \'email\' should be a valid email',
                    field: 'email'
                }
            ]
        })
    })

    it('POST /auth/registration-email-resending - shouldn\'t resend email with confirmation code if email is already confirmed', async () => {
        const data = {
            email: 'emltstgml27@mail27.ooo'
        }

        const res = await getRequest()
            .post('/auth/registration-email-resending')
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(res.body).toEqual({
            errorsMessages: [
                {
                    message: 'Value \'email\' has already been confirmed',
                    field: 'email'
                }
            ]
        })
    })

    it('POST /auth/registration-email-resending - should resend email with confirmation code', async () => {
        const data = {
            email: 'ada.davis27@gmail.com'
        }

        await getRequest()
            .post('/auth/registration-email-resending')
            .send(data)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        createdUser2 = await usersQueryRepository.findUserByLoginOrEmail(data.email)
    })

    it('POST /auth/registration-confirmation - shouldn\'t confirm email if the confirmation code is incorrect', async () => {
        const data = {
            code: 'incorrect-confirmation-code'
        }

        const res = await getRequest()
            .post('/auth/registration-confirmation')
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        console.log(res.body, 'incorrect code')

        expect(res.body).toEqual({
            errorsMessages: [
                {
                    message: 'Value \'code\' should be a valid code for existing user',
                    field: 'code'
                }
            ]
        })
    })

    it('POST /auth/registration-email-resending - should confirm email and activate account', async () => {
        const data = {
            code: createdUser2!.emailConfirmation.confirmationCode
        }

        const userDataBeforeConfirmation = await usersQueryRepository.findUserByLoginOrEmail(createdUser2!.login)

        expect(userDataBeforeConfirmation!.emailConfirmation.isConfirmed).toBeFalsy()

        await getRequest()
            .post('/auth/registration-confirmation')
            .send(data)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        const userDataAfterConfirmation = await usersQueryRepository.findUserByLoginOrEmail(createdUser2!.login)

        expect(userDataAfterConfirmation!.emailConfirmation.isConfirmed).toBeTruthy()
    })

    it('POST /auth/registration-confirmation - shouldn\'t confirm email if the confirmation code is already been applied', async () => {
        const data = {
            code: createdUser2!.emailConfirmation.confirmationCode
        }

        const res = await getRequest()
            .post('/auth/registration-confirmation')
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        console.log(res.body, 'been applied')

        expect(res.body).toEqual({
            errorsMessages: [
                {
                    message: 'Value \'code\' has already been applied',
                    field: 'code'
                }
            ]
        })
    })

    it('GET /auth/me - shouldn\'t identify user with absence of accessToken', async () => {
        await getRequest()
            .get('/auth/me')
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401)
    })

    it('GET /auth/me - shouldn\'t identify user with invalid accessToken', async () => {
        await getRequest()
            .get('/auth/me')
            .set(header, getJwtAuthString('wrong-jwt-token'))
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401)
    })

    it('GET /auth/me - should identify user with valid accessToken', async () => {
        const res = await getRequest()
            .get('/auth/me')
            .set(header, getJwtAuthString(accessToken2!))
            .expect(HTTP_STATUSES.OK_200)
        expect(res.body).toEqual({
            email: createdUser1!.email,
            login: createdUser1!.login,
            userId: createdUser1!.id,
        })
    })

    it('POST /auth/logout - shouldn\'t logout user if the JWT refreshToken inside cookie is missing', async () => {
        await getRequest()
            .post('/auth/logout')
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401)
    })

    it('POST /auth/logout - shouldn\'t logout user if the JWT refreshToken inside cookie is incorrect', async () => {
        await getRequest()
            .post('/auth/logout')
            .set('Cookie', [`refreshToken=incorrect-refresh-token`])
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401)
    })

    it('POST /auth/logout - should logout user with correct JWT refreshToken in cookie', async () => {
        await getRequest()
            .post('/auth/logout')
            .set('Cookie', [`refreshToken=${refreshToken2}`])
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        const {deviceId} = parseJwt(refreshToken2!)

        const session = await sessionsQueryRepository.findSessionById(deviceId)

        expect(session).toBe(null)
    })
})
