import {CommentViewModel} from './CommentViewModel';

export type QueryCommentsModel = {
    sortBy?: keyof CommentViewModel
    sortDirection?: 'asc' | 'desc'
    pageNumber?: number
    pageSize?: number
}
