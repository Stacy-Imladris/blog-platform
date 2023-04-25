import {BlogType} from '../db/__db';
import {v1} from 'uuid';
import {blogsRepository} from '../repositories/blogs-repository';
import {ObjectId} from 'mongodb';

export const blogsService = {
    async createBlog(name: string, description: string, websiteUrl: string): Promise<ObjectId> {
        const newBlog: BlogType = {
            id: v1(),
            name,
            description,
            websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false
        }

        return await blogsRepository.createBlog(newBlog)
    },

    async updateBlog(id: string, name: string, description: string, websiteUrl: string): Promise<boolean> {
        return await blogsRepository.updateBlog(id, name, description, websiteUrl)
    },

    async deleteBlog(id: string): Promise<boolean> {
        return await blogsRepository.deleteBlog(id)
    }
}
