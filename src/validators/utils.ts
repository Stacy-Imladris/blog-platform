import {body} from 'express-validator';
import {blogsQueryRepository} from '../repositories/blogs-query-repository';
import {MinMaxOptions} from 'express-validator/src/options';

export const createFieldValidationChain = (field: string, lengthOptions?: MinMaxOptions) => {
    const chain = body(field)
        .isString().withMessage(`Value '${field}' should be type string`)
        .trim().notEmpty().withMessage(`Value '${field}' is required and shouldn\'t be empty`)

    if (lengthOptions) {
        const {min, max} = lengthOptions
        let minLengthMessage = ''
        let maxLengthMessage = ''

        if (min) {
            minLengthMessage = `min length of ${min}`
        }
        if (max) {
            maxLengthMessage = `max length of ${max}`
        }

        if (min || max) {
            return chain.isLength(lengthOptions).withMessage(`Value '${field}' should be with ${minLengthMessage}${min && max ? ' and ' : ''}${maxLengthMessage}`)
        }
    }

    return chain
}

export const blogIdCustomValidation = async (blogId: string) => {
    const blog = await blogsQueryRepository.findBlogById(blogId)

    if (!blog) {
        throw new Error(`Value 'id' should be an id of existing blog`);
    }
}
