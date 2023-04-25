import {body} from 'express-validator';
import {blogsQueryRepository} from '../repositories/blogs-query-repository';

export const createFieldChain = (field: string, maxLength?: number) => {
    const chain = body(field)
        .isString().withMessage(`Value ${field} should be type string`)
        .trim().notEmpty().withMessage(`Value ${field} is required and shouldn\'t be empty`)

    if (maxLength) {
        return chain.isLength({max: maxLength}).withMessage(`Value ${field} should be with max length of ${maxLength}`)
    }

    return chain
}

export const blogIdCustomValidation = async (blogId: string) => {
    const blog = await blogsQueryRepository.findBlogById(blogId)

    if (!blog) {
        throw new Error(`Value 'id' should be an id of existing blog`);
    }
}
