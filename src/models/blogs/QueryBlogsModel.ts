import {Nullable} from '../../types';
import {BlogViewModel} from './BlogViewModel';

export type QueryBlogsModel = {
    /**
     * This title should be included in Title of found videos
     */
    searchNameTerm?: Nullable<string>
    sortBy?: keyof BlogViewModel
    sortDirection?: 'asc' | 'desc'
    pageNumber?: number
    pageSize?: number
}