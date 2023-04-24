import {BlogType} from '../db/__db';
import {BlogViewModel} from '../models/blogs/BlogViewModel';
import {blogsCollection, exclusionMongoId} from './db';
import {v1} from 'uuid';

export const blogsRepository = {
    async findBlogs(searchNameTerm: string | undefined): Promise<BlogViewModel[]> {
        const filter: any = {}

        if (searchNameTerm) {
            filter.title = {$regex: searchNameTerm}
        }

        return await blogsCollection.find(filter, exclusionMongoId).toArray()
    },

    async findBlogById(id: string): Promise<BlogViewModel | null> {
        return await blogsCollection.findOne({id}, exclusionMongoId)
    },

    async createBlog(name: string, description: string, websiteUrl: string): Promise<BlogViewModel | null> {
        const newBlog: BlogType = {
            id: v1(),
            name,
            description,
            websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false
        }

        const {insertedId} = await blogsCollection.insertOne(newBlog)

        return await blogsCollection.findOne({_id: insertedId}, exclusionMongoId)
    },

    async updateBlog(id: string, name: string, description: string, websiteUrl: string): Promise<boolean> {
        const result = await blogsCollection.updateOne({id}, {$set: {name, description, websiteUrl}})

        return !!result.matchedCount
    },

    async deleteBlog(id: string): Promise<boolean> {
        const result = await blogsCollection.deleteOne({id})

        return !!result.deletedCount
    }
}
