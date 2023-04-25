import {blogsQueryRepository} from '../repositories/blogs-query-repository';
import {HTTP_STATUSES} from '../utils';
import {Response} from 'express';
import {BlogViewModel} from '../models/blogs/BlogViewModel';

export const checkIsValidBlogId = async (blogId: string, res: Response): Promise<BlogViewModel | void> => {
    const foundBlog = await blogsQueryRepository.findBlogById(blogId)

    if (foundBlog) {
        return foundBlog
    }

    res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
}
