import {createFieldValidationChain} from './utils';

export const commentContentValidator = createFieldValidationChain('content', {max: 300, min: 20})
