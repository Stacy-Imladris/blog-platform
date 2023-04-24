import {createFieldChain} from './utils';

export const blogNameValidator = createFieldChain('name', 15)

export const blogDescriptionValidator = createFieldChain('description', 500)

export const blogWebsiteUrlValidator = createFieldChain('websiteUrl', 100)
    .matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
    .withMessage('Value \'websiteUrl\' should be a valid URL')