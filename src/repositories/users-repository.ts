import {ObjectId} from 'mongodb';
import {UserModel} from '../models/users/UserModel';
import {usersCollection} from '../db/db';

export const usersRepository = {
    async createUser(user: UserModel): Promise<ObjectId> {
        const {insertedId} = await usersCollection.insertOne(user)

        return insertedId
    },

    async deleteUser(id: string): Promise<boolean> {
        const result = await usersCollection.deleteOne({id})

        return !!result.deletedCount
    }
}
