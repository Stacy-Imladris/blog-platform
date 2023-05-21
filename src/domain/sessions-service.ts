import {sessionsRepository} from '../repositories/sessions-repository';
import {CreateSessionModel} from '../models/sessions/CreateSessionModel';
import {UpdateSessionModel} from '../models/sessions/UpdateSessionModel';
import {VerifiedTokenType} from '../application/jwt-service';

export const sessionsService = {
    async createSession(sessionData: CreateSessionModel): Promise<void> {
        await sessionsRepository.createSession(sessionData)
    },

    async updateSession(deviceId: string, sessionData: UpdateSessionModel): Promise<boolean> {
        return sessionsRepository.updateSession(deviceId, sessionData)
    },

    async deleteSession(deviceId: string): Promise<boolean> {
        return sessionsRepository.deleteSession(deviceId)
    },

    async terminateAllOtherDeviceSessions(verifiedData: VerifiedTokenType): Promise<boolean> {
        return sessionsRepository.deleteAllOtherSessions(verifiedData.id, verifiedData.deviceId)
    }
}
