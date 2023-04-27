import {usersQueryRepository} from '../repositories/users-query-repository';
import {generateHash} from '../utils/generateHash';
import {Nullable} from '../types';
import {UserModel} from '../models/users/UserModel';

export const authService = {
    async checkCredentials(loginOrEmail: string, password: string): Promise<Nullable<UserModel>> {
        const user = await usersQueryRepository.findUserByLoginOrEmail(loginOrEmail)

        if (!user) return null

        const passwordHash = await generateHash(password, user.passwordSalt)

        return passwordHash === user.passwordHash ? user : null
    }
}
