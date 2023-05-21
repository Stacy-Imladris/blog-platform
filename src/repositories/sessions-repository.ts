import {SessionModel} from '../models/sessions/SessionModel';
import {sessionsCollection} from '../db/db';
import {UpdateSessionModel} from '../models/sessions/UpdateSessionModel';

export const sessionsRepository = {
    async createSession(sessionData: SessionModel): Promise<void> {
        await sessionsCollection.insertOne(sessionData)
    },

    async updateSession(deviceId: string, data: UpdateSessionModel): Promise<boolean> {
        const result = await sessionsCollection.updateOne({deviceId}, {$set: data})

        return !!result.matchedCount
    },

    async deleteSession(deviceId: string): Promise<boolean> {
        const result = await sessionsCollection.deleteOne({deviceId})

        return !!result.deletedCount
    },

    async deleteAllOtherSessions(userId: string, deviceId: string): Promise<boolean> {
        const result = await sessionsCollection.deleteMany({userId, deviceId: {$ne: deviceId}})

        return !!result.deletedCount
    }
}
