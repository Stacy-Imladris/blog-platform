import {
    confirmationCodeCustomValidation,
    createFieldValidationChain,
    existingEmailCustomValidation
} from './utils';
import {userEmailValidator} from './users-validators';

export const authLoginOrEmailValidator = createFieldValidationChain('loginOrEmail')

export const authPasswordValidator = createFieldValidationChain('password')

export const authCodeValidator = createFieldValidationChain('code')
    .custom(confirmationCodeCustomValidation)

export const userExistingEmailValidator = userEmailValidator
    .custom(existingEmailCustomValidation)
