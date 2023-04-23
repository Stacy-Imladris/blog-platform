import request from 'supertest';
import {app} from '../src/app';
import {HTTP_STATUSES} from '../src/utils';
import {CreatePostModel} from '../src/models/posts/CreatePostModel';
import {UpdatePostModel} from '../src/models/posts/UpdatePostModel';
import {header, token} from '../src/db/__db';
import {CreateBlogModel} from '../src/models/blogs/CreateBlogModel';

const getRequest = () => request(app)

describe('/posts', () => {
    beforeAll(async () => {
        await getRequest().delete('/testing/all-data')
    })

    it('should return 200 and empty array', async () => {
        await getRequest().get('/posts')
            .expect(HTTP_STATUSES.OK_200, [])
    })

    it('should return 404 for not existing post', async () => {
        await getRequest().get('/posts/1')
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('shouldn\'t create post without authorization', async () => {
        const data: CreatePostModel = {
            title: 'Correct post title',
            shortDescription: 'Description of new post',
            content: 'Content of new post',
            blogId: 'Blog id'
        }

        await getRequest().post('/posts')
            .send(data)
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401)

        await getRequest()
            .get('/posts')
            .expect(HTTP_STATUSES.OK_200, [])
    })

    it('shouldn\'t create post with not existing blog id', async () => {
        const data: CreatePostModel = {
            title: 'Correct post title',
            shortDescription: 'Description of new post',
            content: 'Content of new post',
            blogId: '-999'
        }

        await getRequest().post('/posts')
            .set(header, token)
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        await getRequest()
            .get('/posts')
            .expect(HTTP_STATUSES.OK_200, [])
    })

    it('shouldn\'t create post with incorrect title data', async () => {
        const data: CreatePostModel = {
            title: '',
            shortDescription: 'Description of new post',
            content: 'Content of new post',
            blogId: 'Blog id'
        }

        await getRequest().post('/posts')
            .set(header, token)
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        await getRequest()
            .get('/posts')
            .expect(HTTP_STATUSES.OK_200, [])
    })

    let createdBlog: any = null
    let createdPost1: any = null
    it('should create post with correct input data', async () => {
        const newBlog: CreateBlogModel = {
            name: 'Blog name 1',
            description: 'Blog description 1',
            websiteUrl: 'https://first-website.com'
        }

        const {body} = await getRequest()
            .post('/blogs')
            .set(header, token)
            .send(newBlog)

        createdBlog = body

        const data: CreatePostModel = {
            title: 'New post',
            shortDescription: 'Description of new post',
            content: 'Content of new post',
            blogId: createdBlog.id
        }

        const createResponse = await getRequest()
            .post('/posts')
            .set(header, token)
            .send(data)
            .expect(HTTP_STATUSES.CREATED_201)

        createdPost1 = createResponse.body

        expect(createdPost1).toEqual({
            id: expect.any(String),
            title: data.title,
            shortDescription: data.shortDescription,
            content: data.content,
            blogId: data.blogId,
            blogName: expect.any(String)
        })

        await getRequest()
            .get('/posts')
            .expect(HTTP_STATUSES.OK_200, [createdPost1])
    })

    let createdPost2: any = null
    it('create one more post', async () => {
        const data: CreatePostModel = {
            title: 'New post 2',
            shortDescription: 'Description of new post 2',
            content: 'Content of new post 2',
            blogId: createdBlog.id
        }

        const createResponse = await getRequest()
            .post('/posts')
            .set(header, token)
            .send(data)
            .expect(HTTP_STATUSES.CREATED_201)

        createdPost2 = createResponse.body

        expect(createdPost2).toEqual({
            id: expect.any(String),
            title: data.title,
            shortDescription: data.shortDescription,
            content: data.content,
            blogId: data.blogId,
            blogName: expect.any(String)
        })

        await getRequest()
            .get('/posts')
            .expect(HTTP_STATUSES.OK_200, [createdPost1, createdPost2])
    })

    it('shouldn\'t update post with incorrect title data', async () => {
        const data: UpdatePostModel = {
            title: '',
            shortDescription: 'Description of new post',
            content: 'Content of new post',
            blogId: createdBlog.id
        }

        await getRequest()
            .put(`/posts/${createdPost1.id}`)
            .set(header, token)
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        await getRequest()
            .get(`/posts/${createdPost1.id}`)
            .expect(HTTP_STATUSES.OK_200, createdPost1)
    })

    it('shouldn\'t update post that not exist', async () => {
        const data: UpdatePostModel = {
            title: 'Post',
            shortDescription: 'Description of new post',
            content: 'Content of new post',
            blogId: createdBlog.id
        }

        await getRequest()
            .put(`/posts/-999`)
            .set(header, token)
            .send(data)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('should update post with correct input data', async () => {
        const data: UpdatePostModel = {
            title: 'Post',
            shortDescription: 'Description of new post',
            content: 'Content of new post',
            blogId: createdBlog.id
        }

        await getRequest()
            .put(`/posts/${createdPost1.id}`)
            .set(header, token)
            .send(data)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await getRequest()
            .get(`/posts/${createdPost1.id}`)
            .expect(HTTP_STATUSES.OK_200, {...createdPost1, ...data})

        await getRequest()
            .get(`/posts/${createdPost2.id}`)
            .expect(HTTP_STATUSES.OK_200, createdPost2)
    })

    it('should delete both posts', async () => {
        await getRequest()
            .delete(`/posts/${createdPost1.id}`)
            .set(header, token)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await getRequest()
            .get(`/posts/${createdPost1.id}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        await getRequest()
            .delete(`/posts/${createdPost2.id}`)
            .set(header, token)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await getRequest()
            .get(`/posts/${createdPost2.id}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        await getRequest()
            .get(`/posts`)
            .expect(HTTP_STATUSES.OK_200, [])
    })
})
