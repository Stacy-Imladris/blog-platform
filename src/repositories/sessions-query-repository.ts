import {sessionsCollection, sessionsProjection} from '../db/db';
import {SessionModel} from '../models/sessions/SessionModel';
import type {Nullable} from '../types';

export const sessionsQueryRepository = {
    async findSessionById(deviceId: string): Promise<Nullable<SessionModel>> {
        return await sessionsCollection.findOne({deviceId})
    },

    async findAllSessionsByUserId(userId: string): Promise<Nullable<Pick<SessionModel, 'ip' | 'iat' | 'deviceId' | 'deviceName'>[]>> {
        return await sessionsCollection.find({userId}, sessionsProjection).toArray()
    }
}
