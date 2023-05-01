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
    },

    async updateConfirmation(_id: ObjectId): Promise<boolean> {
        const result = await usersCollection.updateOne({_id}, {$set: {
            'emailConfirmation.isConfirmed': true
            }})

        return result.modifiedCount === 1
    }
}
