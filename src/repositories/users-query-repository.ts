import {QueryResultType} from '../types';
import {UserViewModel} from '../models/users/UserViewModel';
import {QueryUsersModel} from '../models/users/QueryUsersModel';
import {userProjection, usersCollection} from '../db/db';
import {Filter, ObjectId} from 'mongodb';
import {UserModel} from '../models/users/UserModel';

export const usersQueryRepository = {
    async findUsers(params: Required<QueryUsersModel>): Promise<QueryResultType<UserViewModel>> {
        const {
            searchLoginTerm,
            searchEmailTerm,
            sortBy,
            sortDirection,
            pageNumber,
            pageSize
        } = params

        const filter: Filter<UserViewModel> = {
            $or: [
                {login: {$regex: searchLoginTerm, $options: 'i'}},
                {email: {$regex: searchEmailTerm, $options: 'i'}}
            ]
        }

        const skippedCount = (pageNumber - 1) * pageSize

        const foundSortedUsers = await usersCollection.find(filter, userProjection)
            .sort({[sortBy]: sortDirection}).skip(skippedCount).limit(pageSize).toArray()

        const totalCount = await usersCollection.countDocuments(filter)

        const pagesCount = Math.ceil(totalCount / pageSize)

        return {
            pagesCount,
            page: pageNumber,
            pageSize,
            totalCount,
            items: foundSortedUsers
        }
    },

    async findUserByLoginOrEmail(loginOrEmail: string): Promise<UserModel | null> {
        return await usersCollection.findOne({
            $or: [
                {login: loginOrEmail},
                {email: loginOrEmail},
            ]
        })
    },

    async findUserByMongoId(_id: ObjectId): Promise<UserViewModel | null> {
        return await usersCollection.findOne({_id}, userProjection)
    }
}
