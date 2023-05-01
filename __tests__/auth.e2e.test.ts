import {HTTP_STATUSES} from '../src/utils';
import {getBasicAuthString, getJwtAuthString, header, runDB, stopDB} from '../src/db/db';
import {Nullable} from '../src/types';
import {CreateUserModel} from '../src/models/users/CreateUserModel';
import {UserViewModel} from '../src/models/users/UserViewModel';
import {CreateAuthModel} from '../src/models/auth/CreateAuthModel';
import {settings} from '../src/settings';
import {getRequest} from '../src/app';

describe('/auth', () => {
    let createdUser: Nullable<UserViewModel> = null
    let accessToken: Nullable<string> = null

    beforeAll(async () => {
        await runDB()
        await getRequest().delete('/testing/all-data')

        const data: CreateUserModel = {
            login: 'login',
            password: '12345678',
            email: 'email@mail.io',
        }

        const createdResponse = await getRequest()
            .post('/users')
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .send(data)
            .expect(HTTP_STATUSES.CREATED_201)

        createdUser = createdResponse.body
    })

    afterAll(async () => {
        await stopDB()
    })

    it('POST /auth/login - shouldn\'t login user with invalid loginOrEmail value', async () => {
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

        accessToken = res.body.accessToken

        expect(typeof accessToken).toBe('string')
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
            .set(header, getJwtAuthString(accessToken!))
            .expect(HTTP_STATUSES.OK_200)
        expect(res.body).toEqual({
            email: createdUser!.email,
            login: createdUser!.login,
            userId: createdUser!.id,
        })
    })
})
