import {BlogViewModel} from '../models/blogs/BlogViewModel';
import {blogsCollection, exclusionMongoId} from '../db/db';
import {Filter, ObjectId} from 'mongodb';
import {QueryBlogsModel} from '../models/blogs/QueryBlogsModel';
import {QueryResultType} from '../types';

export const blogsQueryRepository = {
    async findBlogs(params: Required<QueryBlogsModel>): Promise<QueryResultType<BlogViewModel>> {
        const {searchNameTerm, sortBy, sortDirection, pageNumber, pageSize} = params

        const filter: Filter<BlogViewModel> = {}

        if (searchNameTerm) {
            filter.name = {$regex: searchNameTerm ,$options : 'i'}
        }

        const skippedCount = (pageNumber - 1) * pageSize

        const foundSortedBlogs = await blogsCollection.find(filter, exclusionMongoId)
            .sort({[sortBy]: sortDirection}).skip(skippedCount).limit(pageSize).toArray()

        const totalCount = await blogsCollection.countDocuments(filter)

        const pagesCount = !totalCount ? 0 : Math.ceil(totalCount / pageSize)

        return {
            pagesCount,
            page: pageNumber,
            pageSize,
            totalCount,
            items: foundSortedBlogs
        }
    },

    async findBlogById(id: string): Promise<BlogViewModel | null> {
        return await blogsCollection.findOne({id}, exclusionMongoId)
    },

    async findBlogByMongoId(_id: ObjectId): Promise<BlogViewModel | null> {
        return await blogsCollection.findOne({_id}, exclusionMongoId)
    }
}
