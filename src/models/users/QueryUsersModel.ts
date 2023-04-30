import {UserViewModel} from './UserViewModel';
import {Nullable} from '../../types';

export type QueryUsersModel = {
    searchLoginTerm?: Nullable<string>
    searchEmailTerm?: Nullable<string>
    sortBy?: keyof UserViewModel
    sortDirection?: 'asc' | 'desc'
    pageNumber?: number
    pageSize?: number
}
