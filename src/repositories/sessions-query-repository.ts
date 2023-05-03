import {sessionsCollection} from '../db/db';
import {SessionModel} from '../models/sessions/SessionModel';

export const sessionsQueryRepository = {
    async findSessionById(sessionId: string): Promise<SessionModel | null> {
        return await sessionsCollection.findOne({sessionId})
    }
}
