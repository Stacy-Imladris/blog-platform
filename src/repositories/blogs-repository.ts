import {BlogType} from '../db/__db';
import {blogsCollection} from '../db/db';
import {ObjectId} from 'mongodb';

export const blogsRepository = {
    async createBlog(blog: BlogType): Promise<ObjectId> {
        const {insertedId} = await blogsCollection.insertOne(blog)

        return insertedId
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
