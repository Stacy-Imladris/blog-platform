import {type Nullable, QueryResultType} from '../types';
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

        const filter: Filter<UserViewModel> = searchLoginTerm || searchEmailTerm ? {$or: []} : {}
        if (searchLoginTerm) {
            filter.$or?.push({login: {$regex: searchLoginTerm, $options: 'i'}})
        }
        if (searchEmailTerm) {
            filter.$or?.push({email: {$regex: searchEmailTerm, $options: 'i'}})
        }

        const skippedCount = (pageNumber - 1) * pageSize

        const foundSortedUsers = await usersCollection.find(filter, userProjection)
            .sort({[sortBy]: sortDirection}).skip(skippedCount).limit(pageSize).toArray()

        const totalCount = await usersCollection.countDocuments(filter)

        const pagesCount = !totalCount ? 0 : Math.ceil(totalCount / pageSize)

        return {
            pagesCount,
            page: pageNumber,
            pageSize,
            totalCount,
            items: foundSortedUsers
        }
    },

    async findUserByLoginOrEmail(loginOrEmail: string): Promise<Nullable<UserModel>> {
        return await usersCollection.findOne({
            $or: [
                {login: loginOrEmail},
                {email: loginOrEmail},
            ]
        })
    },

    async getIsUserExistsByLoginAndEmail(login: string, email: string): Promise<IsExistEmailOrLoginType> {
        const user =  await usersCollection.findOne({$or: [{login}, {email}]})

        return {
            email: user?.email === email,
            login: user?.login === login
        }
    },

    async findUserByConfirmationCode(code: string): Promise<Nullable<UserModel>> {
        return await usersCollection.findOne({'emailConfirmation.confirmationCode': code})
    },

    async findUserById(id: string): Promise<Nullable<UserViewModel>> {
        return await usersCollection.findOne({id}, userProjection)
    },

    async findUserByMongoId(_id: ObjectId): Promise<Nullable<UserViewModel>> {
        return await usersCollection.findOne({_id}, userProjection)
    },

    async findUserByMongoIdWithoutProjection(_id: ObjectId): Promise<Nullable<UserModel>> {
        return await usersCollection.findOne({_id})
    }
}

type IsExistEmailOrLoginType = {
    login: boolean
    email: boolean
}
