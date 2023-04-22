import {body} from 'express-validator';

export const blogNameValidator = body('name')
    .isString().withMessage('Value \'name\' should be type string')
    .trim().notEmpty().withMessage('Value \'name\' is required and shouldn\'t be empty')
    .isLength({max: 15}).withMessage('Value \'name\' should be with max length of 15')

export const blogDescriptionValidator = body('description')
    .isString().withMessage('Value \'description\' should be type string')
    .trim().notEmpty().withMessage('Value \'description\' is required and shouldn\'t be empty')
    .isLength({max: 500}).withMessage('Value \'description\' should be with max length of 500')

export const blogWebsiteUrlValidator = body('websiteUrl')
    .isString().withMessage('Value \'websiteUrl\' should be type string')
    .trim().notEmpty().withMessage('Value \'websiteUrl\' is required and shouldn\'t be empty')
    .isLength({max: 100}).withMessage('Value \'websiteUrl\' should be with max length of 100')
    .matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/).withMessage('Value \'websiteUrl\' should be a valid URL')