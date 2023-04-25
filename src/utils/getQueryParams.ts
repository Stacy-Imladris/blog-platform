import {PostViewModel} from '../models/posts/PostViewModel';
import {BlogViewModel} from '../models/blogs/BlogViewModel';
import {QueryBlogsModel} from '../models/blogs/QueryBlogsModel';
import {QueryPostsModel} from '../models/posts/QueryPostsModel';
import {Nullable} from '../types';

export const getPostQueryParams = (params: PostQueryParams): Required<QueryPostsModel> => {
    const {sortBy, sortDirection, pageNumber, pageSize} = params

    return {
        sortBy: sortBy || 'createdAt',
        sortDirection: sortDirection && ['desc', 'asc'].includes(sortDirection) ? sortDirection : 'desc',
        pageNumber: pageNumber && !isNaN(+pageNumber) ? +pageNumber : 1,
        pageSize: pageSize && !isNaN(+pageSize) ? +pageSize : 10,
    }
}

export const getBlogQueryParams = (params: BlogQueryParams): Required<QueryBlogsModel> => {
    const {searchNameTerm, sortBy, sortDirection, pageNumber, pageSize} = params

    return {
        searchNameTerm: searchNameTerm || null,
        sortBy: sortBy || 'createdAt',
        sortDirection: sortDirection && ['desc', 'asc'].includes(sortDirection) ? sortDirection : 'desc',
        pageNumber: pageNumber && !isNaN(+pageNumber) ? +pageNumber : 1,
        pageSize: pageSize && !isNaN(+pageSize) ? +pageSize : 10,
    }
}

//types
type PostQueryParams = {
    sortBy?: keyof PostViewModel
    sortDirection?: 'asc' | 'desc'
    pageNumber?: number
    pageSize?: number
}

type BlogQueryParams = {
    searchNameTerm?: Nullable<string>
    sortBy?: keyof BlogViewModel
    sortDirection?: 'asc' | 'desc'
    pageNumber?: number
    pageSize?: number
}
