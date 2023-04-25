import {PostType} from '../db/__db';
import {postsCollection} from '../db/db';
import {ObjectId} from 'mongodb';

export const postsRepository = {
    async createPost(post: PostType): Promise<ObjectId> {
        const {insertedId} = await postsCollection.insertOne(post)

        return insertedId
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
