import {body} from 'express-validator';
import {blogsRepository} from '../repositories/blogs-repository';

export const postTitleValidator = body('title')
    .isString().withMessage('Value \'title\' should be type string')
    .trim().notEmpty().withMessage('Value \'title\' is required and shouldn\'t be empty')
    .isLength({max: 30}).withMessage('Value \'title\' should be with max length of 30')

export const postShortDescriptionValidator = body('shortDescription')
    .isString().withMessage('Value \'shortDescription\' should be type string')
    .trim().notEmpty().withMessage('Value \'shortDescription\' is required and shouldn\'t be empty')
    .isLength({max: 100}).withMessage('Value \'shortDescription\' should be with max length of 100')

export const postContentValidator = body('content')
    .isString().withMessage('Value \'content\' should be type string')
    .trim().notEmpty().withMessage('Value \'content\' is required and shouldn\'t be empty')
    .isLength({max: 1000}).withMessage('Value \'content\' should be with max length of 1000')

export const postBlogIdValidator = body('blogId')
    .custom(async blogId => {
        const blog = await blogsRepository.findBlogById(blogId)

        if (!blog) {
            throw new Error('Value \'blogId\' should be an id of existing blog');
        }
    })
    .isString().withMessage('Value \'blogId\' should be type string')
    .trim().notEmpty().withMessage('Value \'blogId\' is required and shouldn\'t be empty')