import {SessionModel} from '../models/sessions/SessionModel';
import {sessionsCollection} from '../db/db';
import {UpdateSessionModel} from '../models/sessions/UpdateSessionModel';

export const sessionsRepository = {
    async createSession(sessionData: SessionModel): Promise<void> {
        await sessionsCollection.insertOne(sessionData)
    },

    async updateSession(sessionId: string, data: UpdateSessionModel, updateAt: string): Promise<boolean> {
        const result = await sessionsCollection.updateOne({sessionId}, {$set: {
                userId: data.userId,
                userAgent: data.userAgent,
                ip: data.ip,
                refreshToken: data.refreshToken,
                updateAt
            }})

        return !!result.matchedCount
    },

    async deleteSession(sessionId: string): Promise<boolean> {
        const result = await sessionsCollection.deleteOne({sessionId})

        return !!result.deletedCount
    }
}
