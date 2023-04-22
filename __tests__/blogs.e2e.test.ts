import request from 'supertest';
import {app} from '../src/app';
import {HTTP_STATUSES} from '../src/utils';
import {CreateBlogModel} from '../src/models/blogs/CreateBlogModel';
import {UpdateBlogModel} from '../src/models/blogs/UpdateBlogModel';
import {header, token} from '../src/db/db';

const getRequest = () => request(app)

describe('/blogs', () => {
    beforeAll(async () => {
        await getRequest().delete('/testing/all-data')
    })

    it('should return 200 and empty array', async () => {
        await getRequest().get('/blogs')
            .expect(HTTP_STATUSES.OK_200, [])
    })

    it('should return 404 for not existing blog', async () => {
        await getRequest().get('/blogs/1')
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('shouldn\'t create blog without authorization', async () => {
        const data: CreateBlogModel = {
            name: 'Blog name',
            description: 'Blog description',
            websiteUrl: 'https://website.com'
        }

        await getRequest().post('/blogs')
            .send(data)
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401)

        await getRequest()
            .get('/blogs')
            .expect(HTTP_STATUSES.OK_200, [])
    })

    it('shouldn\'t create blog with incorrect name data', async () => {
        const data: CreateBlogModel = {
            name: '',
            description: 'Blog description',
            websiteUrl: 'https://website.com'
        }

        await getRequest().post('/blogs')
            .set(header, token)
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        await getRequest()
            .get('/blogs')
            .expect(HTTP_STATUSES.OK_200, [])
    })

    it('should be one error for websiteUrl field', async () => {
        const data: CreateBlogModel = {
            name: 'Blog name',
            description: 'Blog description',
            websiteUrl: 'wrong-url-'.repeat(11)
        }

        const response = await getRequest().post('/blogs')
            .set(header, token)
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        const errors = response.body

        expect(errors).toEqual({
            errorsMessages: [{
                message: 'Value \'websiteUrl\' should be with max length of 100',
                field: 'websiteUrl'
            }]
        })

        await getRequest()
            .get('/blogs')
            .expect(HTTP_STATUSES.OK_200, [])
    })

    let createdBlog1: any = null
    it('should create blog with correct input data', async () => {
        const data: CreateBlogModel = {
            name: 'Blog name 1',
            description: 'Blog description 1',
            websiteUrl: 'https://first-website.com'
        }

        const createResponse = await getRequest()
            .post('/blogs')
            .set(header, token)
            .send(data)
            .expect(HTTP_STATUSES.CREATED_201)

        createdBlog1 = createResponse.body

        expect(createdBlog1).toEqual({
            id: expect.any(String),
            name: data.name,
            description: data.description,
            websiteUrl: data.websiteUrl
        })

        await getRequest()
            .get('/blogs')
            .expect(HTTP_STATUSES.OK_200, [createdBlog1])
    })

    let createdBlog2: any = null
    it('create one more blog', async () => {
        const data: CreateBlogModel = {
            name: 'Blog name 2',
            description: 'Blog description 2',
            websiteUrl: 'https://second-website.com'
        }

        const createResponse = await getRequest()
            .post('/blogs')
            .set(header, token)
            .send(data)
            .expect(HTTP_STATUSES.CREATED_201)

        createdBlog2 = createResponse.body

        expect(createdBlog2).toEqual({
            id: expect.any(String),
            name: data.name,
            description: data.description,
            websiteUrl: data.websiteUrl
        })

        await getRequest()
            .get('/blogs')
            .expect(HTTP_STATUSES.OK_200, [createdBlog1, createdBlog2])
    })

    it('shouldn\'t update blog with incorrect name data', async () => {
        const data: UpdateBlogModel = {
            name: '',
            description: 'Blog description',
            websiteUrl: 'https://website.com'
        }

        await getRequest()
            .put(`/blogs/${createdBlog1.id}`)
            .set(header, token)
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        await getRequest()
            .get(`/blogs/${createdBlog1.id}`)
            .expect(HTTP_STATUSES.OK_200, createdBlog1)
    })

    it('shouldn\'t update blog that not exist', async () => {
        const data: UpdateBlogModel = {
            name: 'Blog name',
            description: 'Blog description',
            websiteUrl: 'https://website.com'
        }

        await getRequest()
            .put(`/blogs/-999`)
            .set(header, token)
            .send(data)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('should update blog with correct input data', async () => {
        const data: UpdateBlogModel = {
            name: 'Correct name',
            description: 'Blog description',
            websiteUrl: 'https://website.com'
        }

        await getRequest()
            .put(`/blogs/${createdBlog1.id}`)
            .set(header, token)
            .send(data)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await getRequest()
            .get(`/blogs/${createdBlog1.id}`)
            .expect(HTTP_STATUSES.OK_200, {...createdBlog1, ...data})

        await getRequest()
            .get(`/blogs/${createdBlog2.id}`)
            .expect(HTTP_STATUSES.OK_200, createdBlog2)
    })

    it('should delete both blogs', async () => {
        await getRequest()
            .delete(`/blogs/${createdBlog1.id}`)
            .set(header, token)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await getRequest()
            .get(`/blogs/${createdBlog1.id}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        await getRequest()
            .delete(`/blogs/${createdBlog2.id}`)
            .set(header, token)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await getRequest()
            .get(`/blogs/${createdBlog2.id}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        await getRequest()
            .get(`/blogs`)
            .expect(HTTP_STATUSES.OK_200, [])
    })
})
