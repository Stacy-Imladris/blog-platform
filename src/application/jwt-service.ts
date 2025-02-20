import jwt from 'jsonwebtoken'
import {settings} from '../settings';
import {UserModel} from '../models/users/UserModel';
import {Nullable} from '../types';
import {UserViewModel} from '../models/users/UserViewModel';

export const jwtService = {
    async createJWT(user: UserModel | UserViewModel): Promise<string> {
        return jwt.sign({id: user.id}, settings.JWT_SECRET, {
            // expiresIn: '10s',
            expiresIn: '1h',
        })
    },

    async createRefreshJWT(user: UserModel | UserViewModel, deviceId: string): Promise<string> {
        return jwt.sign({id: user.id, deviceId}, settings.JWT_SECRET, {
            // expiresIn: '20s',
            expiresIn: '20h',
        })
    },

    async verifyUserByToken(token: string): Promise<Nullable<VerifiedTokenType>> {
        try {
            return jwt.verify(token, settings.JWT_SECRET) as VerifiedTokenType
        } catch (err) {
            console.log(err)
            return null
        }
    }
}

//types
export type VerifiedTokenType = {
    id: string
    deviceId: string
}
