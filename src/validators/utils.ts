import {body} from 'express-validator';
import {blogsQueryRepository} from '../repositories/blogs-query-repository';
import {MinMaxOptions} from 'express-validator/src/options';
import {usersQueryRepository} from '../repositories/users-query-repository';

export const createFieldValidationChain = (field: string, lengthOptions?: MinMaxOptions) => {
    const chain = body(field)
        .isString().withMessage(`Value '${field}' should be type string`)
        .trim().notEmpty().withMessage(`Value '${field}' is required and shouldn\'t be empty`)

    if (lengthOptions) {
        const {min, max} = lengthOptions
        let minLengthMessage = ''
        let maxLengthMessage = ''

        if (min) {
            minLengthMessage = `min length of ${min}`
        }
        if (max) {
            maxLengthMessage = `max length of ${max}`
        }

        if (min || max) {
            return chain.isLength(lengthOptions).withMessage(`Value '${field}' should be with ${minLengthMessage}${min && max ? ' and ' : ''}${maxLengthMessage}`)
        }
    }

    return chain
}

export const blogIdCustomValidation = async (blogId: string) => {
    const blog = await blogsQueryRepository.findBlogById(blogId)

    if (!blog) {
        throw new Error(`Value 'id' should be an id of existing blog`);
    }
}

export const confirmationCodeCustomValidation = async (code: string) => {
    const user = await usersQueryRepository.findUserByConfirmationCode(code)

    if (!user) {
        throw new Error(`Value 'code' should be a valid code for existing user`);
    }
    if (user.emailConfirmation.expirationDate < new Date()) {
        throw new Error(`Value 'code' has been expired`);
    }
    if (user.emailConfirmation.isConfirmed) {
        throw new Error(`Value 'code' has already been applied`);
    }
}

export const existingEmailCustomValidation = async (email: string) => {
    const user = await usersQueryRepository.findUserByLoginOrEmail(email)

    if (!user) {
        throw new Error(`Value 'email' should be an email of existing user`);
    }
    if (user.emailConfirmation.isConfirmed) {
        throw new Error(`Value 'email' has already been confirmed`);
    }
}
