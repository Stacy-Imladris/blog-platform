import jwt from 'jsonwebtoken'
import {settings} from '../settings';
import {UserModel} from '../models/users/UserModel';
import {Nullable} from '../types';
import {UserViewModel} from '../models/users/UserViewModel';

export const jwtService = {
    async createJWT(user: UserModel | UserViewModel): Promise<string> {
        return jwt.sign({id: user.id}, settings.JWT_SECRET, {expiresIn: '10h'})
    },

    async createRefreshJWT(user: UserModel | UserViewModel, sessionId: string): Promise<string> {
        return jwt.sign({id: user.id, sessionId}, settings.JWT_SECRET, {
            expiresIn: '20h',
        })
    },

    async verifyUserByToken(token: string): Promise<Nullable<VerifiedToken>> {
        try {
            return jwt.verify(token, settings.JWT_SECRET) as VerifiedToken
        } catch (error) {
            return null
        }
    }
}

//types
type VerifiedToken = {
    id: string
    sessionId?: string
}
