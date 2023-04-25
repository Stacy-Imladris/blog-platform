import {createFieldValidationChain} from './utils';

export const authLoginOrEmailValidator = createFieldValidationChain('loginOrEmail')

export const authPasswordValidator = createFieldValidationChain('password')
