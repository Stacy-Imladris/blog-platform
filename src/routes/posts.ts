import {
    QueryResultType,
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody, RequestWithParamsAndQuery,
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
import {postsQueryRepository} from '../repositories/posts-query-repository';
import {QueryPostsModel} from '../models/posts/QueryPostsModel';
import {getCommentsQueryParams, getPostsQueryParams} from '../utils/getQueryParams';
import {blogsQueryRepository} from '../repositories/blogs-query-repository';
import {QueryCommentsModel} from '../models/comments/QueryCommentsModel';
import {commentsQueryRepository} from '../repositories/comments-query-repository';
import {CommentViewModel} from '../models/comments/CommentViewModel';
import {authMiddleware} from '../middlewares/auth-middleware';
import {commentContentValidator} from '../validators/comments-validators';
import {CreateCommentModel} from '../models/comments/CreateCommentModel';
import {commentsService} from '../domain/comments-service';

export const getPostsRouter = () => {
    const router = express.Router()

    router.get('/', async (req: RequestWithQuery<QueryPostsModel>, res: Response<QueryResultType<PostViewModel>>) => {
        const params = getPostsQueryParams(req.query)

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

    router.get('/:id/comments', async (req: RequestWithParamsAndQuery<URIParamsPostIdModel, QueryCommentsModel>,
                              res: Response<QueryResultType<CommentViewModel>>) => {
        const params = getCommentsQueryParams(req.query)

        const foundPost = await postsQueryRepository.findPostById(req.params.id)

        if (!foundPost) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        }

        const commentsQueryResult = await commentsQueryRepository.findComments(params, req.params.id)

        res.json(commentsQueryResult)
    })

    router.post('/', basicAuthMiddleware, postTitleValidator, postShortDescriptionValidator, postContentValidator, postBlogIdValidator, inputValidationMiddleware, async (req: RequestWithBody<CreatePostModel>, res: Response<PostViewModel>) => {
        const {title, shortDescription, content, blogId} = req.body

        const foundBlog = await blogsQueryRepository.findBlogById(blogId)

        if (!foundBlog) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        }

        const newPostId = await postsService.createPost(title, shortDescription, content, blogId, foundBlog!.name)

        const createdPost = await postsQueryRepository.findPostByMongoId(newPostId)

        if (createdPost) {
            res.status(HTTP_STATUSES.CREATED_201).json(createdPost)
            return
        }

        res.status(HTTP_STATUSES.BAD_REQUEST_400)
    })

    router.post('/:id/comments', authMiddleware, commentContentValidator, inputValidationMiddleware, async (req: RequestWithParamsAndBody<URIParamsPostIdModel, CreateCommentModel>, res: Response<CommentViewModel>) => {
        const postId = req.params.id

        const foundPost = await postsQueryRepository.findPostById(postId)

        if (!foundPost) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        }

        const newCommentId = await commentsService.createComment(req.body.content, postId, req.user!.id, req.user!.login)

        const createdComment = await commentsQueryRepository.findCommentByMongoId(newCommentId)

        if (createdComment) {
            res.status(HTTP_STATUSES.CREATED_201).json(createdComment)
            return
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
