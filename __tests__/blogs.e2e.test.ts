import request from 'supertest';
import {app} from '../src/app';
import {HTTP_STATUSES} from '../src/utils';
import {CreateBlogModel} from '../src/models/blogs/CreateBlogModel';
import {runDB, stopDB, header, getBasicAuthString} from '../src/db/db';
import {Nullable} from '../src/types';
import {BlogViewModel} from '../src/models/blogs/BlogViewModel';
import {UpdateBlogModel} from '../src/models/blogs/UpdateBlogModel';
import {PostViewModel} from '../src/models/posts/PostViewModel';
import {CreatePostModel} from '../src/models/posts/CreatePostModel';
import {settings} from '../src/settings';

const getRequest = () => request(app)

describe('/blogs', () => {
    let createdBlog1: Nullable<BlogViewModel> = null
    let createdBlog2: Nullable<BlogViewModel> = null
    let createdPost: Nullable<PostViewModel> = null

    beforeAll(async () => {
        await runDB()
        await getRequest().delete('/testing/all-data')
    })

    afterAll(async () => {
        await stopDB()
    })

    it('GET /blogs - should return 200 and items as empty array', async () => {
        const res = await getRequest().get('/blogs').expect(HTTP_STATUSES.OK_200)
        expect(res.body.items).toEqual([])
    })

    it('POST /blogs - shouldn\'t create blog without basic authorization', async () => {
        const data: CreateBlogModel = {
            name: 'Blog name',
            description: 'Blog description',
            websiteUrl: 'https://website.com',
        }

        await getRequest().post('/blogs')
            .send(data)
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401)

        const res = await getRequest().get('/blogs').expect(HTTP_STATUSES.OK_200)
        expect(res.body.items).toEqual([])
    })

    it('POST /blogs - shouldn\'t create blog with incorrect name data', async () => {
        const data: CreateBlogModel = {
            name: '',
            description: 'Blog description',
            websiteUrl: 'https://website.com'
        }

        await getRequest().post('/blogs')
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        const res = await getRequest().get('/blogs').expect(HTTP_STATUSES.OK_200)
        expect(res.body.items).toEqual([])
    })

    it('POST /blogs - should be one error for websiteUrl field', async () => {
        const data: CreateBlogModel = {
            name: 'Blog name',
            description: 'Blog description',
            websiteUrl: 'wrong-url-'.repeat(11)
        }

        const response = await getRequest()
            .post('/blogs')
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        const errors = response.body

        expect(errors).toEqual({
            errorsMessages: [{
                message: 'Value \'websiteUrl\' should be with max length of 100',
                field: 'websiteUrl'
            }]
        })

        const res = await getRequest().get('/blogs').expect(HTTP_STATUSES.OK_200)
        expect(res.body.items).toEqual([])
    })

    it('POST /blogs - should create blog with correct input data', async () => {
        const data: CreateBlogModel = {
            name: 'Blog name one',
            description: 'Blog description 1',
            websiteUrl: 'https://first-website.com'
        }

        const createdResponse = await getRequest()
            .post('/blogs')
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .send(data)
            .expect(HTTP_STATUSES.CREATED_201)

        createdBlog1 = createdResponse.body

        expect(createdBlog1).toEqual({
            id: expect.any(String),
            createdAt: expect.any(String),
            isMembership: false,
            ...data
        })

        const res = await getRequest().get('/blogs').expect(HTTP_STATUSES.OK_200)
        expect(res.body.items).toEqual([createdBlog1])
    })

    it('POST /blogs - create one more blog', async () => {
        const data: CreateBlogModel = {
            name: 'Blog name two',
            description: 'Blog description 2',
            websiteUrl: 'https://second-website.com'
        }

        const createdResponse = await getRequest()
            .post('/blogs')
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .send(data)
            .expect(HTTP_STATUSES.CREATED_201)

        createdBlog2 = createdResponse.body

        expect(createdBlog2).toEqual({
            id: expect.any(String),
            createdAt: expect.any(String),
            isMembership: false,
            ...data
        })

        const res = await getRequest().get('/blogs').expect(HTTP_STATUSES.OK_200)
        expect(res.body.items).toEqual([createdBlog2, createdBlog1])
    })

    it('GET /blogs - should return 200 and founded items for request with query params', async () => {
        const res = await getRequest()
            .get('/blogs')
            .query({
                searchNameTerm: 'one',
                pageNumber: 1,
                pageSize: 10,
                sortBy: 'createdAt',
                sortDirection: 'desc'
            })
            .expect(HTTP_STATUSES.OK_200)

        expect(res.body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 1,
            items: [createdBlog1]
        })
    })

    it('GET /blogs/:id/posts - shouldn\'t return 404 for requesting posts for not existing blog', async () => {
        await getRequest().get(`/blogs/-999/posts`).expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('GET /blogs/:id/posts - should return 200 and items as empty array', async () => {
        const res = await getRequest()
            .get(`/blogs/${createdBlog1!.id}/posts`)
            .expect(HTTP_STATUSES.OK_200)
        expect(res.body.items).toEqual([])
    })

    it('POST /blogs/:id/posts - shouldn\'t create a post for blog without basic authorization', async () => {
        const data: Omit<CreatePostModel, 'blogId'> = {
            title: 'Post title one',
            shortDescription: 'Post description',
            content: 'Post content',
        }

        await getRequest()
            .post(`/blogs/${createdBlog1!.id}/posts`)
            .send(data)
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401)

        const res = await getRequest()
            .get(`/blogs/${createdBlog1!.id}/posts`)
            .expect(HTTP_STATUSES.OK_200)
        expect(res.body.items).toEqual([])
    })

    it('POST /blogs/:id/posts - shouldn\'t create a post for not existing blog', async () => {
        const data: Omit<CreatePostModel, 'blogId'> = {
            title: 'Post title one',
            shortDescription: 'Post description',
            content: 'Post content',
        }

        await getRequest()
            .post(`/blogs/-999/posts`)
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .send(data)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('POST /blogs/:id/posts - shouldn\'t create a post with invalid title data', async () => {
        const data: Omit<CreatePostModel, 'blogId'> = {
            title: '',
            shortDescription: 'Post description',
            content: 'Post content',
        }

        await getRequest()
            .post(`/blogs/${createdBlog1!.id}/posts`)
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)
    })

    it('POST /blogs/:id/posts - should create a post for blog', async () => {
        const data: Omit<CreatePostModel, 'blogId'> = {
            title: 'Post title one',
            shortDescription: 'Post description',
            content: 'Post content',
        }

        const createdResponse = await getRequest()
            .post(`/blogs/${createdBlog1!.id}/posts`)
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .send(data)
            .expect(HTTP_STATUSES.CREATED_201)

        createdPost = createdResponse.body

        expect(createdPost).toEqual({
            id: expect.any(String),
            blogId: createdBlog1!.id,
            blogName: createdBlog1!.name,
            createdAt: expect.any(String),
            ...data
        })

        await getRequest().get(`/blogs/${createdBlog1!.id}/posts`).expect(HTTP_STATUSES.OK_200, {
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 1,
            items: [createdPost]
        })

        await getRequest().get(`/blogs/${createdBlog2!.id}/posts`).expect(HTTP_STATUSES.OK_200, {
            pagesCount: 0,
            page: 1,
            pageSize: 10,
            totalCount: 0,
            items: []
        })
    })

    it('GET /blogs/:id/posts - should return 200 and founded items for request with query params', async () => {
        const res = await getRequest()
            .get(`/blogs/${createdBlog1!.id}/posts`)
            .query({
                pageNumber: 1,
                pageSize: 10,
                sortBy: 'createdAt',
                sortDirection: 'desc'
            }).expect(HTTP_STATUSES.OK_200)
        expect(res.body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 1,
            items: [createdPost]
        })
    })

    it('GET /blogs/:id - should return 404 for not existing blog', async () => {
        await getRequest().get('/blogs/-999').expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('GET /blogs/:id - should return one blog', async () => {
        const res = await getRequest().get(`/blogs/${createdBlog1!.id}`).expect(HTTP_STATUSES.OK_200)
        expect(res.body).toEqual(createdBlog1)
    })

    it('PUT /blogs/:id - shouldn\'t update blog without basic authorization', async () => {
        const data: UpdateBlogModel = {
            name: 'Name',
            description: 'Description',
            websiteUrl: 'https://website-url.com'
        }

        await getRequest()
            .put(`/blogs/${createdBlog1!.id}`)
            .send(data)
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401)

        const res = await getRequest().get(`/blogs/${createdBlog1!.id}`).expect(HTTP_STATUSES.OK_200)
        expect(res.body).toEqual(createdBlog1)
    })

    it('PUT /blogs/:id - shouldn\'t update blog that don\'t exists', async () => {
        const data: UpdateBlogModel = {
            name: 'Name',
            description: 'Description',
            websiteUrl: 'https://website-url.com'
        }

        await getRequest()
            .put(`/blogs/-999`)
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .send(data)
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        const res = await getRequest().get(`/blogs/${createdBlog1!.id}`).expect(HTTP_STATUSES.OK_200)
        expect(res.body).toEqual(createdBlog1)
    })

    it('PUT /blogs/:id - shouldn\'t update blog with incorrect name data', async () => {
        const data: UpdateBlogModel = {
            name: '',
            description: 'Blog description',
            websiteUrl: 'https://website.com'
        }

        await getRequest()
            .put(`/blogs/${createdBlog1!.id}`)
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        const res = await getRequest().get(`/blogs/${createdBlog1!.id}`).expect(HTTP_STATUSES.OK_200)
        expect(res.body).toEqual(createdBlog1)
    })

    it('PUT /blogs/:id - should update blog with correct input data', async () => {
        const data: UpdateBlogModel = {
            name: 'Correct name',
            description: 'Blog description',
            websiteUrl: 'https://website-url.com'
        }

        await getRequest()
            .put(`/blogs/${createdBlog1!.id}`)
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .send(data)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        const res = await getRequest()
            .get(`/blogs/${createdBlog1!.id}`)
            .expect(HTTP_STATUSES.OK_200, {...createdBlog1, ...data})

        createdBlog1 = res.body

        await getRequest()
            .get(`/blogs/${createdBlog2!.id}`)
            .expect(HTTP_STATUSES.OK_200, createdBlog2)
    })

    it('DELETE /blogs/:id - shouldn\'t delete blog without basic authorization', async () => {
        await getRequest()
            .delete(`/blogs/${createdBlog1!.id}`)
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401)

        await getRequest()
            .get(`/blogs/${createdBlog1!.id}`)
            .expect(HTTP_STATUSES.OK_200, createdBlog1)
    })

    it('DELETE /blogs/:id - shouldn\'t delete blog that don\'t exists', async () => {
        await getRequest()
            .delete(`/blogs/-999`)
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('DELETE /blogs/:id - should delete both blogs', async () => {
        await getRequest()
            .delete(`/blogs/${createdBlog1!.id}`)
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await getRequest()
            .get(`/blogs/${createdBlog1!.id}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        await getRequest()
            .delete(`/blogs/${createdBlog2!.id}`)
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await getRequest()
            .get(`/blogs/${createdBlog2!.id}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        const res = await getRequest().get('/blogs').expect(HTTP_STATUSES.OK_200)
        expect(res.body.items).toEqual([])
    })
})
