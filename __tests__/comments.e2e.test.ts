import request from 'supertest';
import {app} from '../src/app';
import {HTTP_STATUSES} from '../src/utils';
import {CreatePostModel} from '../src/models/posts/CreatePostModel';
import {getBasicAuthString, getJwtAuthString, header, runDB, stopDB} from '../src/db/db';
import {CreateBlogModel} from '../src/models/blogs/CreateBlogModel';
import {Nullable} from '../src/types';
import {BlogViewModel} from '../src/models/blogs/BlogViewModel';
import {PostViewModel} from '../src/models/posts/PostViewModel';
import {settings} from '../src/settings';
import {CommentViewModel} from '../src/models/comments/CommentViewModel';
import {UserViewModel} from '../src/models/users/UserViewModel';
import {CreateUserModel} from '../src/models/users/CreateUserModel';
import {CreateCommentModel} from '../src/models/comments/CreateCommentModel';
import {CreateAuthModel} from '../src/models/auth/CreateAuthModel';
import {UpdateCommentModel} from '../src/models/comments/UpdateCommentModel';

const getRequest = () => request(app)

describe('/comments', () => {
    let createdUser1: Nullable<UserViewModel> = null
    let createdUser2: Nullable<UserViewModel> = null
    let accessToken1: Nullable<string> = null
    let accessToken2: Nullable<string> = null
    let createdBlog: Nullable<BlogViewModel> = null
    let createdPost: Nullable<PostViewModel> = null
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

        createdUser1 = createdResponse1.body

        const userData2: CreateUserModel = {
            login: 'login2',
            password: '87654321',
            email: 'email2@mail.io',
        }

        const createdResponse2 = await getRequest()
            .post('/users')
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .send(userData2)
            .expect(HTTP_STATUSES.CREATED_201)

        createdUser2 = createdResponse2.body

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

        const postData: CreatePostModel = {
            title: 'Post title',
            shortDescription: 'Post description',
            content: 'Post content',
            blogId: createdBlog!.id
        }

        const createdResponse4 = await getRequest()
            .post('/posts')
            .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
            .send(postData)
            .expect(HTTP_STATUSES.CREATED_201)

        createdPost = createdResponse4.body

        const authData1: CreateAuthModel = {
            loginOrEmail: 'login',
            password: '12345678'
        }

        const createdResponse5 = await getRequest()
            .post('/auth/login')
            .send(authData1)
            .expect(HTTP_STATUSES.OK_200)

        accessToken1 = createdResponse5.body.accessToken

        const authData2: CreateAuthModel = {
            loginOrEmail: 'login2',
            password: '87654321'
        }

        const createdResponse6 = await getRequest()
            .post('/auth/login')
            .send(authData2)
            .expect(HTTP_STATUSES.OK_200)

        accessToken2 = createdResponse6.body.accessToken

        const commentData: CreateCommentModel = {
            content: 'Created comment content',
        }

        const createdResponse7 = await getRequest()
            .post(`/posts/${createdPost!.id}/comments`)
            .set(header, getJwtAuthString(accessToken1!))
            .send(commentData)
            .expect(HTTP_STATUSES.CREATED_201)

        createdComment = createdResponse7.body
    })

    afterAll(async () => {
        await stopDB()
    })

    it('GET /comments/:id - shouldn\'t return comment that don\'t exists', async () => {
        await getRequest()
            .get('/comments/-999')
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('GET /comments/:id - should return 200 and comment by id', async () => {
        const res = await getRequest()
            .get(`/comments/${createdComment!.id}`)
            .expect(HTTP_STATUSES.OK_200)
        expect(res.body).toEqual(createdComment)
    })

    it('PUT /comments/:id - shouldn\'t update comment without authorization', async () => {
        const data: UpdateCommentModel = {
            content: 'Comment updated content',
        }

        await getRequest()
            .put(`/comments/${createdComment!.id}`)
            .send(data)
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401)

        const res = await getRequest()
            .get(`/comments/${createdComment!.id}`)
            .expect(HTTP_STATUSES.OK_200)
        expect(res.body).toEqual(createdComment)
    })

    it('PUT /comments/:id - shouldn\'t update comment that don\'t exists', async () => {
        const data: UpdateCommentModel = {
            content: 'Comment updated content',
        }

        await getRequest()
            .put(`/comments/-999`)
            .set(header, getJwtAuthString(accessToken1!))
            .send(data)
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        const res = await getRequest()
            .get(`/comments/${createdComment!.id}`)
            .expect(HTTP_STATUSES.OK_200)
        expect(res.body).toEqual(createdComment)
    })

    it('PUT /comments/:id - shouldn\'t update comment with invalid content value', async () => {
        const data: UpdateCommentModel = {
            content: 'Invalid value < 20',
        }

        await getRequest()
            .put(`/comments/${createdComment!.id}`)
            .set(header, getJwtAuthString(accessToken1!))
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        const res = await getRequest()
            .get(`/comments/${createdComment!.id}`)
            .expect(HTTP_STATUSES.OK_200)
        expect(res.body).toEqual(createdComment)
    })

    it('PUT /comments/:id - shouldn\'t update comment that is not your own', async () => {
        const data: UpdateCommentModel = {
            content: 'Valid comment content for updating',
        }

        await getRequest()
            .put(`/comments/${createdComment!.id}`)
            .set(header, getJwtAuthString(accessToken2!))
            .send(data)
            .expect(HTTP_STATUSES.FORBIDDEN_403)

        const res = await getRequest()
            .get(`/comments/${createdComment!.id}`)
            .expect(HTTP_STATUSES.OK_200)
        expect(res.body).toEqual(createdComment)
    })

    it('PUT /comments/:id - should update comment with valid content value and that is your own', async () => {
        const data: UpdateCommentModel = {
            content: 'Valid comment content for updating',
        }

        await getRequest()
            .put(`/comments/${createdComment!.id}`)
            .set(header, getJwtAuthString(accessToken1!))
            .send(data)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        const res = await getRequest()
            .get(`/comments/${createdComment!.id}`)
            .expect(HTTP_STATUSES.OK_200)
        expect(res.body).toEqual({
            ...createdComment,
            ...data
        })

        createdComment = res.body
    })

    it('DELETE /comments/:id - shouldn\'t delete comment without authorization', async () => {
        await getRequest()
            .delete(`/comments/${createdComment!.id}`)
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401)

        await getRequest()
            .get(`/comments/${createdComment!.id}`)
            .expect(HTTP_STATUSES.OK_200, createdComment)
    })

    it('DELETE /comments/:id - shouldn\'t delete comment that don\'t exists', async () => {
        await getRequest()
            .delete(`/comments/-999`)
            .set(header, getJwtAuthString(accessToken1!))
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        await getRequest()
            .get(`/comments/${createdComment!.id}`)
            .expect(HTTP_STATUSES.OK_200, createdComment)
    })

    it('DELETE /comments/:id - shouldn\'t delete comment that is not your own', async () => {
        await getRequest()
            .delete(`/comments/${createdComment!.id}`)
            .set(header, getJwtAuthString(accessToken2!))
            .expect(HTTP_STATUSES.FORBIDDEN_403)

        await getRequest()
            .get(`/comments/${createdComment!.id}`)
            .expect(HTTP_STATUSES.OK_200, createdComment)
    })

    it('DELETE /comments/:id - should delete comment that is your own', async () => {
        await getRequest()
            .delete(`/comments/${createdComment!.id}`)
            .set(header, getJwtAuthString(accessToken1!))
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await getRequest()
            .get(`/comments/${createdComment!.id}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })
})
