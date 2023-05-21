import {sessionsCollection, sessionsProjection} from '../db/db';
import {SessionModel} from '../models/sessions/SessionModel';

export const sessionsQueryRepository = {
    async findSessionById(deviceId: string): Promise<SessionModel | null> {
        return await sessionsCollection.findOne({deviceId})
    },

    async findAllSessionsByDeviceId(deviceId: string): Promise<Pick<SessionModel, 'ip' | 'iat' | 'deviceId' | 'deviceName'>[] | null> {
        return await sessionsCollection.find({deviceId}, sessionsProjection).toArray()
    }
}
