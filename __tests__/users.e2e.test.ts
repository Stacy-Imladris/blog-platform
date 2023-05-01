import {HTTP_STATUSES} from '../src/utils';
import {getBasicAuthString, header, runDB, stopDB} from '../src/db/db';
import {Nullable} from '../src/types';
import {CreateUserModel} from '../src/models/users/CreateUserModel';
import {UserViewModel} from '../src/models/users/UserViewModel';
import {settings} from '../src/settings';
import {getRequest} from '../src/app';

describe('/users', () => {
    let createdUser1: Nullable<UserViewModel> = null
    let createdUser2: Nullable<UserViewModel> = null

    beforeAll(async () => {
        await runDB()
        await getRequest().delete('/testing/all-data')
    })

    afterAll(async () => {
        await stopDB()
    })

    it('GET /users - shouldn\'t return users without basic authorization', async () => {
        await getRequest().get('/users').expect(HTTP_STATUSES.NOT_AUTHORIZED_401)
    })

    it('GET /users - should return 200 and items as empty array', async () => {
        const res = await getRequest()
            .get('/users')
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .expect(HTTP_STATUSES.OK_200)
        expect(res.body.items).toEqual([])
    })

    it('POST /users - shouldn\'t create user without basic authorization', async () => {
        const data: CreateUserModel = {
            login: 'login',
            password: 'Password',
            email: 'email@mail.io',
        }

        await getRequest().post('/users')
            .send(data)
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401)

        const res = await getRequest()
            .get('/users')
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .expect(HTTP_STATUSES.OK_200)
        expect(res.body.items).toEqual([])
    })

    it('POST /posts - shouldn\'t create user with invalid email', async () => {
        const data: CreateUserModel = {
            login: 'login',
            password: 'Password',
            email: 'invalid-email',
        }

        await getRequest().post('/users')
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        const res = await getRequest()
            .get('/users')
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .expect(HTTP_STATUSES.OK_200)
        expect(res.body.items).toEqual([])
    })

    it('POST /users - should create user with correct input data', async () => {
        const data: CreateUserModel = {
            login: 'login',
            password: 'password',
            email: 'email@mail.io',
        }

        const createdResponse = await getRequest()
            .post('/users')
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .send(data)
            .expect(HTTP_STATUSES.CREATED_201)

        createdUser1 = createdResponse.body

        expect(createdUser1).toEqual({
            id: expect.any(String),
            login: data.login,
            email: data.email,
            createdAt: expect.any(String)
        })

        const res = await getRequest()
            .get('/users')
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .expect(HTTP_STATUSES.OK_200)
        expect(res.body.items).toEqual([createdUser1])
    })

    it('POST /users - create one more user', async () => {
        const data: CreateUserModel = {
            login: 'admin',
            password: '12345678',
            email: 'letter-null@and.io',
        }

        const createdResponse = await getRequest()
            .post('/users')
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .send(data)
            .expect(HTTP_STATUSES.CREATED_201)

        createdUser2 = createdResponse.body

        expect(createdUser2).toEqual({
            id: expect.any(String),
            login: data.login,
            email: data.email,
            createdAt: expect.any(String)
        })

        const res = await getRequest()
            .get('/users')
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .expect(HTTP_STATUSES.OK_200)
        expect(res.body.items).toEqual([createdUser2, createdUser1])
    })

    it('GET /users - should return 200 and founded items for request with query params', async () => {
        const res = await getRequest()
            .get('/users')
            .query({
                searchLoginTerm: 'log',
                searchEmailTerm: null,
                pageNumber: 1,
                pageSize: 10,
                sortBy: 'createdAt',
                sortDirection: 'desc'
            })
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .expect(HTTP_STATUSES.OK_200)
        expect(res.body.items).toEqual([createdUser1])
    })

    it('DELETE /users/:id - shouldn\'t delete user without basic authorization', async () => {
        await getRequest()
            .delete(`/users/${createdUser1!.id}`)
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401)

        const res = await getRequest()
            .get(`/users`)
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .expect(HTTP_STATUSES.OK_200)
        expect(res.body.items).toEqual([createdUser2, createdUser1])
    })

    it('DELETE /users/:id - shouldn\'t delete user that don\'t exists', async () => {
        await getRequest()
            .delete(`/users/-999`)
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('DELETE /users/:id - should delete both users', async () => {
        await getRequest()
            .delete(`/users/${createdUser1!.id}`)
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        const res1 = await getRequest()
            .get(`/users`)
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .expect(HTTP_STATUSES.OK_200)
        expect(res1.body.items).toEqual([createdUser2])

        await getRequest()
            .delete(`/users/${createdUser2!.id}`)
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        const res2 = await getRequest()
            .get(`/users`)
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .expect(HTTP_STATUSES.OK_200)
        expect(res2.body.items).toEqual([])
    })
})
