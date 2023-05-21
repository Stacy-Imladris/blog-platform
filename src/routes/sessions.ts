import express, {Request, Response} from 'express';
import {HTTP_STATUSES} from '../utils';
import {jwtService} from '../application/jwt-service';
import {sessionsService} from '../domain/sessions-service';
import {cookiesMiddleware} from '../middlewares/cookies-middleware';
import {sessionsQueryRepository} from '../repositories/sessions-query-repository';
import {SessionViewModel} from '../models/sessions/SessionViewModel';
import {parseJwt} from '../utils/parseJwt';

export const getSessionsRouter = () => {
    const router = express.Router()

    router.get('/', cookiesMiddleware, async (req: Request, res: Response<SessionViewModel[]>) => {
        const {refreshToken} = req.cookies

        console.log('refreshToken ', parseJwt(refreshToken))

        const verifiedData = await jwtService.verifyUserByToken(refreshToken)

        const sessions = await sessionsQueryRepository.findAllSessionsByDeviceId(verifiedData!.deviceId)

        if (!refreshToken || !verifiedData || !sessions) {
            res.sendStatus(HTTP_STATUSES.NOT_AUTHORIZED_401)
            return
        }

        const mappedSessions = sessions.map(session => ({
            ip: session.ip,
            title: session.deviceName,
            lastActiveDate: session.iat,
            deviceId: session.deviceId,
        }))

        res.json(mappedSessions)
    })

    router.delete('/', async (req: Request, res: Response) => {
        const {refreshToken} = req.cookies

        const verifiedData = await jwtService.verifyUserByToken(refreshToken)

        if (!refreshToken || !verifiedData) {
            res.sendStatus(HTTP_STATUSES.NOT_AUTHORIZED_401)
            return
        }

        await sessionsService.terminateAllOtherDeviceSessions(verifiedData!)

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

    router.delete('/:deviceId', async (req: Request, res: Response) => {
        const {refreshToken} = req.cookies

        const verifiedData = await jwtService.verifyUserByToken(refreshToken)

        if (!refreshToken || !verifiedData) {
            res.sendStatus(HTTP_STATUSES.NOT_AUTHORIZED_401)
            return
        }

        const session = await sessionsQueryRepository.findSessionById(verifiedData.deviceId)

        if (!session) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        }

        if (session.userId !== verifiedData.id) {
            res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
            return
        }

        await sessionsService.deleteSession(verifiedData.deviceId)

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

    return router
}
