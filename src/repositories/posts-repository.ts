import {PostType} from '../db/__db';
import {PostViewModel} from '../models/posts/PostViewModel';
import {exclusionMongoId, postsCollection} from './db';
import {v1} from 'uuid';

export const postsRepository = {
    async findPosts(): Promise<PostViewModel[]> {
        return await postsCollection.find({}, exclusionMongoId).toArray()
    },

    async findBlogById(id: string): Promise<PostViewModel | null> {
        return await postsCollection.findOne({id}, exclusionMongoId)
    },

    async createPost(title: string, shortDescription: string, content: string, blogId: string): Promise<PostViewModel | null> {
        const newPost: PostType = {
            id: v1(),
            title,
            shortDescription,
            content,
            blogId,
            blogName: 'Blog name',
            createdAt: new Date().toISOString(),
        }

        const {insertedId} = await postsCollection.insertOne(newPost)

        return await postsCollection.findOne({_id: insertedId}, exclusionMongoId)
    },

    async updatePost(id: string, title: string, shortDescription: string, content: string, blogId: string): Promise<boolean> {
        const result = await postsCollection.updateOne({id}, {$set: {title, shortDescription, content, blogId}})

        return !!result.matchedCount
    },

    async deletePost(id: string): Promise<boolean> {
        const result = await postsCollection.deleteOne({id})

        return !!result.deletedCount
    }
}
