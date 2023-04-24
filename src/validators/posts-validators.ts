import {blogsRepository} from '../repositories/blogs-repository';
import {createFieldChain} from './utils';

export const postTitleValidator = createFieldChain('title', 30)

export const postShortDescriptionValidator = createFieldChain('shortDescription', 100)

export const postContentValidator = createFieldChain('content', 1000)

export const postBlogIdValidator = createFieldChain('blogId')
    .custom(async blogId => {
        const blog = await blogsRepository.findBlogById(blogId)

        if (!blog) {
            throw new Error('Value \'blogId\' should be an id of existing blog');
        }
    })
