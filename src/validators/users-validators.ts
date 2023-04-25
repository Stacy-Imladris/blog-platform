import {createFieldValidationChain} from './utils';

export const userLoginValidator = createFieldValidationChain('login', {min: 3, max: 10})
    .matches(/^[a-zA-Z0-9_-]*$/)
    .withMessage(`Value 'login' should be valid`)

export const userPasswordValidator = createFieldValidationChain('password', {min: 6, max: 20})

export const userEmailValidator = createFieldValidationChain('email')
    .matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .withMessage(`Value 'email' should be a valid email`)
