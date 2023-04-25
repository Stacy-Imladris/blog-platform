import bcrypt from 'bcrypt'
import {v1} from 'uuid';
import {usersRepository} from '../repositories/users-repository';
import {ObjectId} from 'mongodb';
import {generateHash} from '../utils/generateHash';
import {UserModel} from '../models/users/UserModel';

export const usersService = {
    async createUser(login: string, password: string, email: string): Promise<ObjectId> {
        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await generateHash(password, passwordSalt)

        const newUser: UserModel = {
            id: v1(),
            login,
            email,
            passwordHash,
            passwordSalt,
            createdAt: new Date().toISOString(),
        }

        return await usersRepository.createUser(newUser)
    },

    async deleteUser(id: string): Promise<boolean> {
        return await usersRepository.deleteUser(id)
    }
}
