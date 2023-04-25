import {UserViewModel} from './UserViewModel';

export type QueryUsersModel = {
    searchLoginTerm?: string
    searchEmailTerm?: string
    sortBy?: keyof UserViewModel
    sortDirection?: 'asc' | 'desc'
    pageNumber?: number
    pageSize?: number
}
