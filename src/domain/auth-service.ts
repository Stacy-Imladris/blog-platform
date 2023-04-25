import {usersQueryRepository} from '../repositories/users-query-repository';
import {generateHash} from '../utils/generateHash';

export const authService = {
    async checkCredentials(loginOrEmail: string, password: string): Promise<boolean> {
        const user = await usersQueryRepository.findUserByLoginOrEmail(loginOrEmail)

        if (!user) return false

        const passwordHash = await generateHash(password, user.passwordSalt)

        return passwordHash === user.passwordHash
    }
}
