import {commentsCollection, commentsProjection} from '../db/db';
import {Filter, ObjectId} from 'mongodb';
import {QueryResultType} from '../types';
import {CommentViewModel} from '../models/comments/CommentViewModel';
import {QueryCommentsModel} from '../models/comments/QueryCommentsModel';

export const commentsQueryRepository = {
    async findComments(params: Required<QueryCommentsModel>, postId: string): Promise<QueryResultType<CommentViewModel>> {
        const {sortBy, sortDirection, pageNumber, pageSize} = params

        const filter: Filter<CommentViewModel> = {}

        if (!!postId) {
            filter.postId = postId
        }

        const skippedCount = (pageNumber - 1) * pageSize

        const foundSortedComments = await commentsCollection.find(filter, commentsProjection)
            .sort({[sortBy]: sortDirection}).skip(skippedCount).limit(pageSize).toArray()

        const totalCount = await commentsCollection.countDocuments(filter)

        const pagesCount = Math.ceil(totalCount / pageSize)

        return {
            pagesCount,
            page: pageNumber,
            pageSize,
            totalCount,
            items: foundSortedComments
        }
    },

    async findCommentById(id: string): Promise<CommentViewModel | null> {
        return await commentsCollection.findOne({id}, commentsProjection)
    },

    async findCommentByMongoId(_id: ObjectId): Promise<CommentViewModel | null> {
        return await commentsCollection.findOne({_id}, commentsProjection)
    }
}
