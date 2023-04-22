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

export const getPostsRouter = () => {
    const router = express.Router()

    router.get('/', (req: Request, res: Response<PostViewModel[]>) => {
        const foundPosts = postsRepository.findPosts()

        res.json(foundPosts)
    })

    router.get('/:id', (req: RequestWithParams<URIParamsPostIdModel>,
                             res: Response<PostViewModel>) => {
        const foundPost = postsRepository.findBlogById(req.params.id)

        if (!foundPost) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        }

        res.json(foundPost)
    })

    router.post('/', basicAuthMiddleware, postTitleValidator, postShortDescriptionValidator, postContentValidator, postBlogIdValidator, inputValidationMiddleware, (req: RequestWithBody<CreatePostModel>, res: Response<PostViewModel>) => {
        const {title, shortDescription, content, blogId} = req.body

        const newPost = postsRepository.createPost(title, shortDescription, content, blogId)

        res.status(HTTP_STATUSES.CREATED_201).json(newPost)
    })

    router.put('/:id', basicAuthMiddleware, postTitleValidator, postShortDescriptionValidator, postContentValidator, postBlogIdValidator, inputValidationMiddleware, (req: RequestWithParamsAndBody<URIParamsPostIdModel, UpdatePostModel>, res) => {
        const {title, shortDescription, content, blogId} = req.body

        const isUpdated = postsRepository.updatePost(req.params.id, title, shortDescription, content, blogId)

        if (isUpdated) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }
    })

    router.delete('/:id', basicAuthMiddleware, (req: RequestWithParams<URIParamsPostIdModel>,
                                res) => {
        const isDeleted = postsRepository.deletePost(req.params.id)

        if (isDeleted) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }
    })

    return router
}
