import jwt from 'jsonwebtoken'
import {settings} from '../settings';
import {UserModel} from '../models/users/UserModel';
import {Nullable} from '../types';

export const jwtService = {
    async createJWT(user: UserModel): Promise<string> {
        return jwt.sign({user}, settings.JWT_SECRET, {expiresIn: '1h'})
    },

    async getUserIdByToken(token: string): Promise<Nullable<UserModel>> {
        try {
            const result: any = jwt.verify(token, settings.JWT_SECRET)
            return result.user
        } catch (error) {
            return null
        }
    }
}