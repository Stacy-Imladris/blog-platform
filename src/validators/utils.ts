import {body} from 'express-validator';

export const createFieldChain = (field: string, maxLength?: number) => {
    const chain = body(field)
        .isString().withMessage(`Value ${field} should be type string`)
        .trim().notEmpty().withMessage(`Value ${field} is required and shouldn\'t be empty`)

    if (maxLength) {
        return chain.isLength({max: maxLength}).withMessage(`Value ${field} should be with max length of ${maxLength}`)
    }

    return chain
}
