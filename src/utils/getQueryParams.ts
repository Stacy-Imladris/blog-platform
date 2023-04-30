import {QueryBlogsModel} from '../models/blogs/QueryBlogsModel';
import {QueryPostsModel} from '../models/posts/QueryPostsModel';
import {QueryUsersModel} from '../models/users/QueryUsersModel';
import {QueryCommentsModel} from '../models/comments/QueryCommentsModel';

export const getPostsQueryParams = (params: QueryPostsModel): Required<QueryPostsModel> => {
    const {sortBy, sortDirection, pageNumber, pageSize} = params

    return {
        sortBy: sortBy || 'createdAt',
        sortDirection: sortDirection && ['desc', 'asc'].includes(sortDirection) ? sortDirection : 'desc',
        pageNumber: pageNumber && !isNaN(+pageNumber) ? +pageNumber : 1,
        pageSize: pageSize && !isNaN(+pageSize) ? +pageSize : 10,
    }
}

export const getBlogsQueryParams = (params: QueryBlogsModel): Required<QueryBlogsModel> => {
    const {searchNameTerm, sortBy, sortDirection, pageNumber, pageSize} = params

    return {
        searchNameTerm: searchNameTerm || null,
        sortBy: sortBy || 'createdAt',
        sortDirection: sortDirection && ['desc', 'asc'].includes(sortDirection) ? sortDirection : 'desc',
        pageNumber: pageNumber && !isNaN(+pageNumber) ? +pageNumber : 1,
        pageSize: pageSize && !isNaN(+pageSize) ? +pageSize : 10,
    }
}

export const getUsersQueryParams = (params: QueryUsersModel): Required<QueryUsersModel> => {
    const {searchLoginTerm, searchEmailTerm, sortBy, sortDirection, pageNumber, pageSize} = params

    return {
        searchLoginTerm: searchLoginTerm || null,
        searchEmailTerm: searchEmailTerm || null,
        sortBy: sortBy || 'createdAt',
        sortDirection: sortDirection && ['desc', 'asc'].includes(sortDirection) ? sortDirection : 'desc',
        pageNumber: pageNumber && !isNaN(+pageNumber) ? +pageNumber : 1,
        pageSize: pageSize && !isNaN(+pageSize) ? +pageSize : 10,
    }
}

export const getCommentsQueryParams = (params: QueryCommentsModel): Required<QueryCommentsModel> => {
    const {sortBy, sortDirection, pageNumber, pageSize} = params

    return {
        sortBy: sortBy || 'createdAt',
        sortDirection: sortDirection && ['desc', 'asc'].includes(sortDirection) ? sortDirection : 'desc',
        pageNumber: pageNumber && !isNaN(+pageNumber) ? +pageNumber : 1,
        pageSize: pageSize && !isNaN(+pageSize) ? +pageSize : 10,
    }
}
