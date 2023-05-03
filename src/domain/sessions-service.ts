import {sessionsRepository} from '../repositories/sessions-repository';
import {CreateSessionModel} from '../models/sessions/CreateSessionModel';
import {UpdateSessionModel} from '../models/sessions/UpdateSessionModel';

export const sessionsService = {
    async createSession(sessionData: CreateSessionModel): Promise<void> {
        const isoDate = new Date().toISOString()

        const data = {
            ...sessionData,
            createdAt: isoDate,
            updatedAt: isoDate
        }

        await sessionsRepository.createSession(data)
    },

    async updateSession(sessionId: string, sessionData: UpdateSessionModel): Promise<boolean> {
        const updatedAt = new Date().toISOString()

        return sessionsRepository.updateSession(sessionId, sessionData, updatedAt)
    },

    async deleteSession(sessionId: string): Promise<boolean> {
        return sessionsRepository.deleteSession(sessionId)
    }
}
