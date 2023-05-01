import {
    confirmationCodeCustomValidation,
    createFieldValidationChain,
    existingEmailCustomValidation
} from './utils';

export const authLoginOrEmailValidator = createFieldValidationChain('loginOrEmail')

export const authPasswordValidator = createFieldValidationChain('password')

export const authCodeValidator = createFieldValidationChain('code')
    .custom(confirmationCodeCustomValidation)

export const userExistingEmailValidator = createFieldValidationChain('email')
    .matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .withMessage(`Value 'email' should be a valid email`)
    .custom(existingEmailCustomValidation)
