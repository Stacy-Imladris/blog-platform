import {v4} from 'uuid';
import {ObjectId} from 'mongodb';
import {commentsRepository} from '../repositories/comments-repository';
import {CommentModel} from '../models/comments/CommentModel';

export const commentsService = {
    async createComment(content: string, postId: string, userId: string, userLogin: string): Promise<ObjectId> {
        const newComment: CommentModel = {
            id: v4(),
            content,
            commentatorInfo: {
                userId,
                userLogin
            },
            postId,
            createdAt: new Date().toISOString(),
        }

        return await commentsRepository.createComment(newComment)
    },

    async updateComment(id: string, content: string): Promise<boolean> {
        return await commentsRepository.updateComment(id, content)
    },

    async deleteComment(id: string): Promise<boolean> {
        return await commentsRepository.deleteComment(id)
    }
}
