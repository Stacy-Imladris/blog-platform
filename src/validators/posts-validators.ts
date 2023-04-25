import {blogIdCustomValidation, createFieldValidationChain} from './utils';

export const postTitleValidator = createFieldValidationChain('title', {max: 30})

export const postShortDescriptionValidator = createFieldValidationChain('shortDescription', {max: 100})

export const postContentValidator = createFieldValidationChain('content', {max: 1000})

export const postBlogIdValidator = createFieldValidationChain('blogId')
    .custom(blogIdCustomValidation)
