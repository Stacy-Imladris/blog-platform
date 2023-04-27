import {ObjectId} from 'mongodb';
import {CommentatorInfoType} from './CommentViewModel';

export type CommentModel = {
    _id?: ObjectId
    id: string
    postId: string
    content: string
    commentatorInfo: CommentatorInfoType
    createdAt: string
}
