import {createFieldValidationChain} from './utils';

export const blogNameValidator = createFieldValidationChain('name', {max: 15})

export const blogDescriptionValidator = createFieldValidationChain('description', {max: 500})

export const blogWebsiteUrlValidator = createFieldValidationChain('websiteUrl', {max: 100})
    .matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
    .withMessage('Value \'websiteUrl\' should be a valid URL')