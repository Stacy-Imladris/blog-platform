import {exclusionMongoId, postsCollection} from '../db/db';
import {Filter, ObjectId} from 'mongodb';
import {PostViewModel} from '../models/posts/PostViewModel';
import {QueryPostsModel} from '../models/posts/QueryPostsModel';
import {QueryResultType} from '../types';

export const postsQueryRepository = {
    async findPosts(params: Required<QueryPostsModel>, blogId?: string): Promise<QueryResultType<PostViewModel>> {
        const {sortBy, sortDirection, pageNumber, pageSize} = params

        const filter: Filter<PostViewModel> = {}

        if (!!blogId) {
            filter.blogId = blogId
        }

        const skippedCount = (pageNumber - 1) * pageSize

        const foundSortedPosts = await postsCollection.find(filter, exclusionMongoId)
            .sort({[sortBy]: sortDirection}).skip(skippedCount).limit(pageSize).toArray()

        const totalCount = await postsCollection.countDocuments(filter)

        const pagesCount = Math.ceil(totalCount / pageSize)

        return {
            pagesCount,
            page: pageNumber,
            pageSize,
            totalCount,
            items: foundSortedPosts
        }
    },

    async findPostById(id: string): Promise<PostViewModel | null> {
        return await postsCollection.findOne({id}, exclusionMongoId)
    },

    async findPostByMongoId(_id: ObjectId): Promise<PostViewModel | null> {
        return await postsCollection.findOne({_id}, exclusionMongoId)
    }
}
