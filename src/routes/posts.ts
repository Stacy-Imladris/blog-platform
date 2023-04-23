import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody,} from '../types';
import express, {Request, Response} from 'express';
import {HTTP_STATUSES} from '../utils';
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware';
import {basicAuthMiddleware} from '../middlewares/basic-auth-middleware';
import {postsRepository} from '../repositories/posts-repository';
import {PostViewModel} from '../models/posts/PostViewModel';
import {URIParamsPostIdModel} from '../models/posts/URIParamsPostIdModel';
import {CreatePostModel} from '../models/posts/CreatePostModel';
import {UpdatePostModel} from '../models/posts/UpdatePostModel';
import {
    postBlogIdValidator,
    postContentValidator,
    postShortDescriptionValidator,
    postTitleValidator
} from '../validators/posts-validators';
import {blogsRepository} from '../repositories/blogs-repository';

export const getPostsRouter = () => {
    const router = express.Router()

    router.get('/', async (req: Request, res: Response<PostViewModel[]>) => {
        const foundPosts = await postsRepository.findPosts()

        res.json(foundPosts)
    })

    router.get('/:id', async (req: RequestWithParams<URIParamsPostIdModel>,
                             res: Response<PostViewModel>) => {
        const foundPost = await postsRepository.findBlogById(req.params.id)

        if (!foundPost) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        }

        res.json(foundPost)
    })

    router.post('/', basicAuthMiddleware, postTitleValidator, postShortDescriptionValidator, postContentValidator, postBlogIdValidator, inputValidationMiddleware, async (req: RequestWithBody<CreatePostModel>, res: Response<PostViewModel>) => {
        const {title, shortDescription, content, blogId} = req.body

        const blog = await blogsRepository.findBlogById(blogId)

        if (blog) {
            const newPost = await postsRepository.createPost(title, shortDescription, content, blogId, blog.name)

            res.status(HTTP_STATUSES.CREATED_201).json(newPost)
        } else {
            res.status(HTTP_STATUSES.BAD_REQUEST_400)
        }
    })

    router.put('/:id', basicAuthMiddleware, postTitleValidator, postShortDescriptionValidator, postContentValidator, postBlogIdValidator, inputValidationMiddleware, async (req: RequestWithParamsAndBody<URIParamsPostIdModel, UpdatePostModel>, res) => {
        const {title, shortDescription, content, blogId} = req.body

        const blog = await blogsRepository.findBlogById(blogId)

        if (blog) {
            const isUpdated = await postsRepository.updatePost(req.params.id, title, shortDescription, content, blogId, blog.name)

            if (isUpdated) {
                res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            } else {
                res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            }
        } else {
            res.status(HTTP_STATUSES.BAD_REQUEST_400)
        }
    })

    router.delete('/:id', basicAuthMiddleware, async (req: RequestWithParams<URIParamsPostIdModel>,
                                res) => {
        const isDeleted = await postsRepository.deletePost(req.params.id)

        if (isDeleted) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }
    })

    return router
}
