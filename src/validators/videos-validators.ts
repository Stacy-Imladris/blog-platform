import {createFieldValidationChain} from './utils';

export const titleValidator = createFieldValidationChain('title', {max: 40})
