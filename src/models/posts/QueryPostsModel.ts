import {PostViewModel} from './PostViewModel';

export type QueryPostsModel = {
    sortBy?: keyof PostViewModel
    sortDirection?: 'asc' | 'desc'
    pageNumber?: number
    pageSize?: number
}
