import {usersQueryRepository} from '../repositories/users-query-repository';
import {generateHash} from '../utils/generateHash';
import {Nullable} from '../types';
import {UserModel} from '../models/users/UserModel';
import {usersRepository} from '../repositories/users-repository';

export const authService = {
    async checkCredentials(loginOrEmail: string, password: string): Promise<Nullable<UserModel>> {
        const user = await usersQueryRepository.findUserByLoginOrEmail(loginOrEmail)

        if (!user || !user.emailConfirmation.isConfirmed) return null

        const passwordHash = await generateHash(password, user.passwordSalt)

        return passwordHash === user.passwordHash ? user : null
    },

    async confirmEmail(code: string): Promise<boolean> {
        const user = await usersQueryRepository.findUserByConfirmationCode(code)

        if (user && user.emailConfirmation.expirationDate > new Date()
            && !user.emailConfirmation.isConfirmed) {
            return await usersRepository.updateConfirmation(user._id!)
        }

        return false
    },
}
