import {v4} from 'uuid';
import {blogsRepository} from '../repositories/blogs-repository';
import {ObjectId} from 'mongodb';
import {BlogModel} from '../models/blogs/BlogModel';

export const blogsService = {
    async createBlog(name: string, description: string, websiteUrl: string): Promise<ObjectId> {
        const newBlog: BlogModel = {
            id: v4(),
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
