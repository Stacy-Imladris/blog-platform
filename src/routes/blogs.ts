import {
    QueryResultType,
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery,
    RequestWithQuery
} from '../types';
import express, {Response} from 'express';
import {HTTP_STATUSES} from '../utils';
import {BlogViewModel} from '../models/blogs/BlogViewModel';
import {URIParamsBlogIdModel} from '../models/blogs/URIParamsBlogIdModel';
import {CreateBlogModel} from '../models/blogs/CreateBlogModel';
import {QueryBlogsModel} from '../models/blogs/QueryBlogsModel';
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware';
import {UpdateBlogModel} from '../models/blogs/UpdateBlogModel';
import {basicAuthMiddleware} from '../middlewares/basic-auth-middleware';
import {
    blogDescriptionValidator,
    blogNameValidator,
    blogWebsiteUrlValidator
} from '../validators/blogs-validators';
import {blogsService} from '../domain/blogs-service';
import {blogsQueryRepository} from '../repositories/blogs-query-repository';
import {
    postContentValidator,
    postShortDescriptionValidator,
    postTitleValidator
} from '../validators/posts-validators';
import {postsService} from '../domain/posts-service';
import {CreatePostModel} from '../models/posts/CreatePostModel';
import {URIParamsPostIdModel} from '../models/posts/URIParamsPostIdModel';
import {postsQueryRepository} from '../repositories/posts-query-repository';
import {PostViewModel} from '../models/posts/PostViewModel';
import {QueryPostsModel} from '../models/posts/QueryPostsModel';
import {getBlogsQueryParams, getPostsQueryParams} from '../utils/getQueryParams';

export const getBlogsRouter = () => {
    const router = express.Router()

    router.get('/', async (req: RequestWithQuery<QueryBlogsModel>, res: Response<QueryResultType<BlogViewModel>>) => {
        const params = getBlogsQueryParams(req.query)

        const blogsQueryResult = await blogsQueryRepository.findBlogs(params)

        res.json(blogsQueryResult)
    })

    router.get('/:id', async (req: RequestWithParams<URIParamsBlogIdModel>,
                             res: Response<BlogViewModel>) => {
        const foundBlog = await blogsQueryRepository.findBlogById(req.params.id)

        if (!foundBlog) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        }

        res.json(foundBlog)
    })

    router.get('/:id/posts', async (req: RequestWithParamsAndQuery<URIParamsBlogIdModel, QueryPostsModel>,
                              res: Response<QueryResultType<PostViewModel>>) => {
        const params = getPostsQueryParams(req.query)

        const foundBlog = await blogsQueryRepository.findBlogById(req.params.id)

        if (!foundBlog) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        }

        const postsQueryResult = await postsQueryRepository.findPosts(params, req.params.id)

        res.json(postsQueryResult)
    })

    router.post('/', basicAuthMiddleware, blogNameValidator, blogDescriptionValidator, blogWebsiteUrlValidator, inputValidationMiddleware, async (req: RequestWithBody<CreateBlogModel>, res: Response<BlogViewModel>) => {
        const {name, description, websiteUrl} = req.body

        const newBlogId = await blogsService.createBlog(name, description, websiteUrl)

        const createdBlog = await blogsQueryRepository.findBlogByMongoId(newBlogId)

        if (createdBlog) {
            res.status(HTTP_STATUSES.CREATED_201).json(createdBlog)
        }

        res.status(HTTP_STATUSES.BAD_REQUEST_400)
    })

    router.post('/:id/posts', basicAuthMiddleware, postTitleValidator, postShortDescriptionValidator, postContentValidator, inputValidationMiddleware, async (req: RequestWithParamsAndBody<URIParamsPostIdModel, Omit<CreatePostModel, 'blogId'>>, res: Response<PostViewModel>) => {
        const {title, shortDescription, content} = req.body

        const blogId = req.params.id

        const foundBlog = await blogsQueryRepository.findBlogById(blogId)

        if (!foundBlog) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        }

        const newPostId = await postsService.createPost(title, shortDescription, content, blogId, foundBlog.name)

        const createdPost = await postsQueryRepository.findPostByMongoId(newPostId)

        if (createdPost) {
            res.status(HTTP_STATUSES.CREATED_201).json(createdPost)
        }

        res.status(HTTP_STATUSES.BAD_REQUEST_400)
    })

    router.put('/:id', basicAuthMiddleware, blogNameValidator, blogDescriptionValidator, blogWebsiteUrlValidator, inputValidationMiddleware, async (req: RequestWithParamsAndBody<URIParamsBlogIdModel, UpdateBlogModel>, res) => {
        const {name, description, websiteUrl} = req.body

        const isUpdated = await blogsService.updateBlog(req.params.id, name, description, websiteUrl)

        if (isUpdated) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }
    })

    router.delete('/:id', basicAuthMiddleware, async (req: RequestWithParams<URIParamsBlogIdModel>, res) => {
        const isDeleted = await blogsService.deleteBlog(req.params.id)

        if (isDeleted) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }
    })

    return router
}
