import {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithQuery,
} from '../types';
import express, {Response} from 'express';
import {HTTP_STATUSES} from '../utils';
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware';
import {basicAuthMiddleware} from '../middlewares/basic-auth-middleware';
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
import {postsService} from '../domain/posts-service';
import {
    postsQueryRepository,
    PostsQueryResultType
} from '../repositories/posts-query-repository';
import {QueryPostsModel} from '../models/posts/QueryPostsModel';
import {getPostQueryParams} from '../utils/getQueryParams';
import {checkIsValidBlogId} from '../utils/checkIsValidBlogId';

export const getPostsRouter = () => {
    const router = express.Router()

    router.get('/', async (req: RequestWithQuery<QueryPostsModel>, res: Response<PostsQueryResultType>) => {
        const params = getPostQueryParams(req.query)

        const postsQueryResult = await postsQueryRepository.findPosts(params)

        res.json(postsQueryResult)
    })

    router.get('/:id', async (req: RequestWithParams<URIParamsPostIdModel>,
                              res: Response<PostViewModel>) => {
        const foundPost = await postsQueryRepository.findPostById(req.params.id)

        if (!foundPost) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        }

        res.json(foundPost)
    })

    router.post('/', basicAuthMiddleware, postTitleValidator, postShortDescriptionValidator, postContentValidator, postBlogIdValidator, inputValidationMiddleware, async (req: RequestWithBody<CreatePostModel>, res: Response<PostViewModel>) => {
        const {title, shortDescription, content, blogId} = req.body

        const foundBlog = await checkIsValidBlogId(blogId, res)

        const newPostId = await postsService.createPost(title, shortDescription, content, blogId, foundBlog!.name)

        const createdPost = await postsQueryRepository.findPostByMongoId(newPostId)

        if (createdPost) {
            res.status(HTTP_STATUSES.CREATED_201).json(createdPost)
        }

        res.status(HTTP_STATUSES.BAD_REQUEST_400)
    })

    router.put('/:id', basicAuthMiddleware, postTitleValidator, postShortDescriptionValidator, postContentValidator, postBlogIdValidator, inputValidationMiddleware, async (req: RequestWithParamsAndBody<URIParamsPostIdModel, UpdatePostModel>, res) => {
        const {title, shortDescription, content, blogId} = req.body

        const isUpdated = await postsService.updatePost(req.params.id, title, shortDescription, content, blogId)

        if (isUpdated) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }
    })

    router.delete('/:id', basicAuthMiddleware, async (req: RequestWithParams<URIParamsPostIdModel>,
                                                      res) => {
        const isDeleted = await postsService.deletePost(req.params.id)

        if (isDeleted) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }
    })

    return router
}
