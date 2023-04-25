import {blogIdCustomValidation, createFieldChain} from './utils';
import {param} from 'express-validator';

export const postTitleValidator = createFieldChain('title', 30)

export const postShortDescriptionValidator = createFieldChain('shortDescription', 100)

export const postContentValidator = createFieldChain('content', 1000)

export const postBlogIdValidator = createFieldChain('blogId')
    .custom(blogIdCustomValidation)

export const blogIdValidator = param('id')
    .custom(blogIdCustomValidation)
