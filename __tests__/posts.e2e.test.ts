import {HTTP_STATUSES} from '../src/utils';
import {CreatePostModel} from '../src/models/posts/CreatePostModel';
import {UpdatePostModel} from '../src/models/posts/UpdatePostModel';
import {getBasicAuthString, getJwtAuthString, header, runDB, stopDB} from '../src/db/db';
import {CreateBlogModel} from '../src/models/blogs/CreateBlogModel';
import {Nullable} from '../src/types';
import {BlogViewModel} from '../src/models/blogs/BlogViewModel';
import {PostViewModel} from '../src/models/posts/PostViewModel';
import {settings} from '../src/settings';
import {UserViewModel} from '../src/models/users/UserViewModel';
import {CreateUserModel} from '../src/models/users/CreateUserModel';
import {CreateAuthModel} from '../src/models/auth/CreateAuthModel';
import {CreateCommentModel} from '../src/models/comments/CreateCommentModel';
import {CommentViewModel} from '../src/models/comments/CommentViewModel';
import {getRequest} from '../src/app';

describe('/posts', () => {
    let createdUser: Nullable<UserViewModel> = null
    let accessToken: Nullable<string> = null
    let createdBlog: Nullable<BlogViewModel> = null
    let createdPost1: Nullable<PostViewModel> = null
    let createdPost2: Nullable<PostViewModel> = null
    let createdComment: Nullable<CommentViewModel> = null

    beforeAll(async () => {
        await runDB()
        await getRequest().delete('/testing/all-data')

        const userData1: CreateUserModel = {
            login: 'login',
            password: '12345678',
            email: 'email@mail.io',
        }

        const createdResponse1 = await getRequest()
            .post('/users')
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .send(userData1)
            .expect(HTTP_STATUSES.CREATED_201)

        createdUser = createdResponse1.body

        const authData: CreateAuthModel = {
            loginOrEmail: 'login',
            password: '12345678'
        }

        const createdResponse2 = await getRequest()
            .post('/auth/login')
            .send(authData)
            .expect(HTTP_STATUSES.OK_200)

        accessToken = createdResponse2.body.accessToken

        const blogData: CreateBlogModel = {
            name: 'Blog name',
            description: 'Blog description',
            websiteUrl: 'https://website.com'
        }

        const createdResponse3 = await getRequest()
            .post('/blogs')
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .send(blogData)
            .expect(HTTP_STATUSES.CREATED_201)

        createdBlog = createdResponse3.body
    })

    afterAll(async () => {
        await stopDB()
    })

    it('GET /posts - should return 200 and items as empty array', async () => {
        const res = await getRequest().get('/posts').expect(HTTP_STATUSES.OK_200)
        expect(res.body.items).toEqual([])
    })

    it('POST /posts - shouldn\'t create post without basic authorization', async () => {
        const data: CreatePostModel = {
            title: 'Post title',
            shortDescription: 'Post description',
            content: 'Post content',
            blogId: createdBlog!.id
        }

        await getRequest().post('/posts')
            .send(data)
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401)

        const res = await getRequest().get('/posts').expect(HTTP_STATUSES.OK_200)
        expect(res.body.items).toEqual([])
    })

    it('POST /posts - shouldn\'t create post with not existing blog id', async () => {
        const data: CreatePostModel = {
            title: 'Post title',
            shortDescription: 'Post description',
            content: 'Post content',
            blogId: '-999'
        }

        await getRequest().post('/posts')
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        const res = await getRequest().get('/posts').expect(HTTP_STATUSES.OK_200)
        expect(res.body.items).toEqual([])
    })

    it('POST /posts - shouldn\'t create post with incorrect title data', async () => {
        const data: CreatePostModel = {
            title: '',
            shortDescription: 'Post description',
            content: 'Post content',
            blogId: createdBlog!.id
        }

        await getRequest().post('/posts')
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        const res = await getRequest().get('/posts').expect(HTTP_STATUSES.OK_200)
        expect(res.body.items).toEqual([])
    })

    it('POST /posts - should create post with correct input data', async () => {
        const data: CreatePostModel = {
            title: 'Post title',
            shortDescription: 'Post description',
            content: 'Post content',
            blogId: createdBlog!.id
        }

        const createdResponse = await getRequest()
            .post('/posts')
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .send(data)
            .expect(HTTP_STATUSES.CREATED_201)

        createdPost1 = createdResponse.body

        expect(createdPost1).toEqual({
            id: expect.any(String),
            createdAt: expect.any(String),
            blogName: createdBlog!.name,
            ...data
        })

        const res = await getRequest().get('/posts').expect(HTTP_STATUSES.OK_200)
        expect(res.body.items).toEqual([createdPost1])
    })

    it('POST /posts - create one more post', async () => {
        const data: CreatePostModel = {
            title: 'Post title 2',
            shortDescription: 'Post description 2',
            content: 'Post content 2',
            blogId: createdBlog!.id
        }

        const createdResponse = await getRequest()
            .post('/posts')
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .send(data)
            .expect(HTTP_STATUSES.CREATED_201)

        createdPost2 = createdResponse.body

        expect(createdPost2).toEqual({
            id: expect.any(String),
            createdAt: expect.any(String),
            blogName: createdBlog!.name,
            ...data
        })

        const res = await getRequest().get('/posts').expect(HTTP_STATUSES.OK_200)
        expect(res.body.items).toEqual([createdPost2, createdPost1])
    })

    it('GET /posts/:id/comments - shouldn\'t return comments for post that don\'t exists', async () => {
        await getRequest()
            .get(`/posts/-999/comments`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('GET /posts/:id/comments - should return 200 and comments for post as empty array', async () => {
        const res = await getRequest()
            .get(`/posts/${createdPost1!.id}/comments`)
            .expect(HTTP_STATUSES.OK_200)
        expect(res.body.items).toEqual([])
    })

    it('POST /posts/:id/comments - shouldn\'t create comment without authorization', async () => {
        const data: CreateCommentModel = {
            content: 'Valid comment content',
        }

        await getRequest()
            .post(`/posts/${createdPost1!.id}/comments`)
            .send(data)
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401)

        const res = await getRequest()
            .get(`/posts/${createdPost1!.id}/comments`)
            .expect(HTTP_STATUSES.OK_200)
        expect(res.body.items).toEqual([])
    })

    it('POST /posts/:id/comments - shouldn\'t create comment for post that don\'t exists', async () => {
        const data: CreateCommentModel = {
            content: 'Valid comment content',
        }

        await getRequest()
            .post(`/posts/-999/comments`)
            .set(header, getJwtAuthString(accessToken!))
            .send(data)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('POST /posts/:id/comments - shouldn\'t create comment for post that don\'t exists', async () => {
        const data: CreateCommentModel = {
            content: 'Invalid content <20',
        }

        await getRequest()
            .post(`/posts/${createdPost1!.id}/comments`)
            .set(header, getJwtAuthString(accessToken!))
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        const res = await getRequest()
            .get(`/posts/${createdPost1!.id}/comments`)
            .expect(HTTP_STATUSES.OK_200)
        expect(res.body.items).toEqual([])
    })

    it('POST /posts/:id/comments - should create comment for post with valid content', async () => {
        const data: CreateCommentModel = {
            content: 'Valid comment content',
        }

        const res1 = await getRequest()
            .post(`/posts/${createdPost1!.id}/comments`)
            .set(header, getJwtAuthString(accessToken!))
            .send(data)
            .expect(HTTP_STATUSES.CREATED_201)

        createdComment = res1.body

        expect(createdComment).toEqual({
            id: expect.any(String),
            content: data.content,
            commentatorInfo: {
                userId: createdUser!.id,
                userLogin: createdUser!.login
            },
            createdAt: expect.any(String)
        })

        const res2 = await getRequest()
            .get(`/posts/${createdPost1!.id}/comments`)
            .expect(HTTP_STATUSES.OK_200)
        expect(res2.body.items).toEqual([createdComment])
    })

    it('POST /posts/:id/comments - should create one more comment', async () => {
        const data: CreateCommentModel = {
            content: 'Valid comment content 2',
        }

        const res1 = await getRequest()
            .post(`/posts/${createdPost1!.id}/comments`)
            .set(header, getJwtAuthString(accessToken!))
            .send(data)
            .expect(HTTP_STATUSES.CREATED_201)

        const secondComment = res1.body

        expect(secondComment).toEqual({
            id: expect.any(String),
            content: data.content,
            commentatorInfo: {
                userId: createdUser!.id,
                userLogin: createdUser!.login
            },
            createdAt: expect.any(String)
        })

        const res2 = await getRequest()
            .get(`/posts/${createdPost1!.id}/comments`)
            .expect(HTTP_STATUSES.OK_200)
        expect(res2.body.items).toEqual([secondComment, createdComment])
    })

    it('GET /posts/:id/comments - should return 200 and comments for post for request with query params', async () => {
        const res = await getRequest()
            .get(`/posts/${createdPost1!.id}/comments`)
            .query({
                pageNumber: 1,
                pageSize: 1,
                sortBy: 'createdAt',
                sortDirection: 'desc'
            })
            .expect(HTTP_STATUSES.OK_200)

        expect(res.body.items.length).toBe(1)
    })

    it('GET /posts/:id - should return 404 for not existing post', async () => {
        await getRequest().get('/posts/-999').expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('GET /posts/:id - should return one post', async () => {
        const res = await getRequest().get(`/posts/${createdPost1!.id}`).expect(HTTP_STATUSES.OK_200)
        expect(res.body).toEqual(createdPost1)
    })

    it('PUT /posts/:id - shouldn\'t update post without basic authorization', async () => {
        const data: UpdatePostModel = {
            title: 'Post',
            shortDescription: 'Description',
            content: 'Content',
            blogId: createdBlog!.id
        }

        await getRequest()
            .put(`/posts/${createdPost1!.id}`)
            .send(data)
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401)

        const res = await getRequest().get(`/posts/${createdPost1!.id}`).expect(HTTP_STATUSES.OK_200)
        expect(res.body).toEqual(createdPost1)
    })

    it('PUT /posts/:id - shouldn\'t update post that don\'t exists', async () => {
        const data: UpdatePostModel = {
            title: 'Post',
            shortDescription: 'Description',
            content: 'Content',
            blogId: createdBlog!.id
        }

        await getRequest()
            .put(`/posts/-999`)
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .send(data)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('PUT /posts/:id - shouldn\'t update post with incorrect title data', async () => {
        const data: UpdatePostModel = {
            title: '',
            shortDescription: 'Description',
            content: 'Content',
            blogId: createdBlog!.id
        }

        await getRequest()
            .put(`/posts/${createdPost1!.id}`)
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        const res = await getRequest().get(`/posts/${createdPost1!.id}`).expect(HTTP_STATUSES.OK_200)
        expect(res.body).toEqual(createdPost1)
    })

    it('PUT /posts/:id - should update post with correct input data', async () => {
        const data: UpdatePostModel = {
            title: 'Post',
            shortDescription: 'Description',
            content: 'Content',
            blogId: createdBlog!.id
        }

        await getRequest()
            .put(`/posts/${createdPost1!.id}`)
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .send(data)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        const res = await getRequest().get(`/posts/${createdPost1!.id}`).expect(HTTP_STATUSES.OK_200, {...createdPost1, ...data})

        createdPost1 = res.body

        await getRequest().get(`/posts/${createdPost2!.id}`).expect(HTTP_STATUSES.OK_200, createdPost2)
    })

    it('DELETE /posts/:id - shouldn\'t delete post without basic authorization', async () => {
        await getRequest()
            .delete(`/posts/${createdPost1!.id}`)
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401)

        await getRequest().get(`/posts/${createdPost1!.id}`).expect(HTTP_STATUSES.OK_200, createdPost1)
    })

    it('DELETE /posts/:id - shouldn\'t delete post that don\'t exists', async () => {
        await getRequest()
            .delete(`/posts/-999`)
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('DELETE /posts/:id - should delete both posts', async () => {
        await getRequest()
            .delete(`/posts/${createdPost1!.id}`)
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await getRequest()
            .get(`/posts/${createdPost1!.id}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        await getRequest()
            .delete(`/posts/${createdPost2!.id}`)
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await getRequest()
            .get(`/posts/${createdPost2!.id}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        const res = await getRequest().get('/posts').expect(HTTP_STATUSES.OK_200)
        expect(res.body.items).toEqual([])
    })
})
