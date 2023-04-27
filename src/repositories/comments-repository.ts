import {commentsCollection} from '../db/db';
import {CommentModel} from '../models/comments/CommentModel';
import {ObjectId} from 'mongodb';

export const commentsRepository = {
    async createComment(comment: CommentModel): Promise<ObjectId> {
        const {insertedId} = await commentsCollection.insertOne(comment)

        return insertedId
    },

    async updateComment(id: string, content: string): Promise<boolean> {
        const result = await commentsCollection.updateOne({id}, {$set: {content}})

        return !!result.matchedCount
    },

    async deleteComment(id: string): Promise<boolean> {
        const result = await commentsCollection.deleteOne({id})

        return !!result.deletedCount
    }
}
