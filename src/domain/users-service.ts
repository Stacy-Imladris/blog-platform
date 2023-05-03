import bcrypt from 'bcrypt'
import {v4} from 'uuid';
import {usersRepository} from '../repositories/users-repository';
import {ObjectId} from 'mongodb';
import {generateHash} from '../utils/generateHash';
import {UserModel} from '../models/users/UserModel';
import add from 'date-fns/add'

export const usersService = {
    async createUser(login: string, password: string, email: string, isRegistration: boolean = false): Promise<ObjectId> {
        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await generateHash(password, passwordSalt)

        const newUser: UserModel = {
            id: v4(),
            login,
            email,
            passwordHash,
            passwordSalt,
            createdAt: new Date().toISOString(),
            emailConfirmation: {
                confirmationCode: v4(),
                expirationDate: isRegistration ? add(new Date(), {
                    hours: 1,
                    minutes: 3
                }) : new Date(),
                isConfirmed: !isRegistration,
            }
        }

        return await usersRepository.createUser(newUser)
    },

    async deleteUser(id: string): Promise<boolean> {
        return await usersRepository.deleteUser(id)
    }
}
