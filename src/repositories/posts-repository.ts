import {__db, PostType} from '../db/__db';
import {PostViewModel} from '../models/posts/PostViewModel';
import {blogsCollection, postsCollection} from './db';
import {v1} from 'uuid';

export const postsRepository = {
    async findPosts(): Promise<PostViewModel[]> {
        return await postsCollection.find({}).toArray()
    },

    async findBlogById(id: string): Promise<PostViewModel | null> {
        return await postsCollection.findOne({id})
    },

    async createPost(title: string, shortDescription: string, content: string, blogId: string, blogName: string): Promise<PostViewModel> {
        const newPost: PostType = {
            id: v1(),
            title,
            shortDescription,
            content,
            blogId,
            blogName,
            createdAt: new Date().toISOString(),
        }

        await postsCollection.insertOne(newPost)

        return newPost
    },

    async updatePost(id: string, title: string, shortDescription: string, content: string, blogId: string, blogName: string): Promise<boolean> {
        const result = await postsCollection.updateOne({id}, {$set: {title, shortDescription, content, blogId, blogName}})

        return !!result.matchedCount
    },

    async deletePost(id: string): Promise<boolean> {
        const result = await postsCollection.deleteOne({id})

        return !!result.deletedCount
    }
}
