import {postsRepository} from '../repositories/posts-repository';
import {v1} from 'uuid';
import {ObjectId} from 'mongodb';
import {PostModel} from '../models/posts/PostModel';

export const postsService = {
    async createPost(title: string, shortDescription: string, content: string, blogId: string, blogName: string): Promise<ObjectId> {
        const newPost: PostModel = {
            id: v1(),
            title,
            shortDescription,
            content,
            blogId,
            blogName,
            createdAt: new Date().toISOString(),
        }

        return await postsRepository.createPost(newPost)
    },

    async updatePost(id: string, title: string, shortDescription: string, content: string, blogId: string): Promise<boolean> {
        return await postsRepository.updatePost(id, title, shortDescription, content, blogId)
    },

    async deletePost(id: string): Promise<boolean> {
        return await postsRepository.deletePost(id)
    }
}
