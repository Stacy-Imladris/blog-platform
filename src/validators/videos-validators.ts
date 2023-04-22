import {body} from 'express-validator';

export const titleValidator = body('title').isString().withMessage('Value \'title\' should be type string')
    .trim().notEmpty().withMessage('Value \'title\' is required and shouldn\'t be empty')
    .isLength({max: 40}).withMessage('Value \'title\' should be with max length of 40')
