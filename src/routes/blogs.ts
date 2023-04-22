import {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithQuery
} from '../types';
import express, {Response} from 'express';
import {HTTP_STATUSES} from '../utils';
import {blogsRepository} from '../repositories/blogs-repository';
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

export const getBlogsRouter = () => {
    const router = express.Router()

    router.get('/', (req: RequestWithQuery<QueryBlogsModel>, res: Response<BlogViewModel[]>) => {
        const foundBlogs = blogsRepository.findBlogs(req.query.searchNameTerm?.toString())

        res.json(foundBlogs)
    })

    router.get('/:id', (req: RequestWithParams<URIParamsBlogIdModel>,
                             res: Response<BlogViewModel>) => {
        const foundBlog = blogsRepository.findBlogById(req.params.id)

        if (!foundBlog) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        }

        res.json(foundBlog)
    })

    router.post('/', basicAuthMiddleware, blogNameValidator, blogDescriptionValidator, blogWebsiteUrlValidator, inputValidationMiddleware, (req: RequestWithBody<CreateBlogModel>, res: Response<BlogViewModel>) => {
        const {name, description, websiteUrl} = req.body

        const newBlog = blogsRepository.createBlog(name, description, websiteUrl)

        res.status(HTTP_STATUSES.CREATED_201).json(newBlog)
    })

    router.put('/:id', basicAuthMiddleware, blogNameValidator, blogDescriptionValidator, blogWebsiteUrlValidator, inputValidationMiddleware, (req: RequestWithParamsAndBody<URIParamsBlogIdModel, UpdateBlogModel>, res) => {
        const {name, description, websiteUrl} = req.body

        const isUpdated = blogsRepository.updateBlog(req.params.id, name, description, websiteUrl)

        if (isUpdated) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }
    })

    router.delete('/:id', basicAuthMiddleware, (req: RequestWithParams<URIParamsBlogIdModel>, res) => {
        const isDeleted = blogsRepository.deleteBlog(req.params.id)

        if (isDeleted) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }
    })

    return router
}
