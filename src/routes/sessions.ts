import express, {Request, Response} from 'express';
import {HTTP_STATUSES} from '../utils';
import {jwtService} from '../application/jwt-service';
import {sessionsService} from '../domain/sessions-service';
import {cookiesMiddleware} from '../middlewares/cookies-middleware';
import {sessionsQueryRepository} from '../repositories/sessions-query-repository';
import {SessionViewModel} from '../models/sessions/SessionViewModel';
import {RequestWithParams} from '../types';
import {URIParamsSessionIdModel} from '../models/sessions/URIParamsSessionIdModel';

export const getSessionsRouter = () => {
    const router = express.Router()

    router.get('/', cookiesMiddleware, async (req: Request, res: Response<SessionViewModel[]>) => {
        const {refreshToken} = req.cookies

        const verifiedData = await jwtService.verifyUserByToken(refreshToken)

        const sessions = await sessionsQueryRepository.findAllSessionsByUserId(verifiedData!.id)

        if (!refreshToken || !verifiedData || !sessions) {
            res.sendStatus(HTTP_STATUSES.NOT_AUTHORIZED_401)
            return
        }

        const mappedSessions = sessions.map(session => ({
            ip: session.ip,
            title: session.deviceName,
            lastActiveDate: new Date(session.iat * 1000).toISOString(),
            deviceId: session.deviceId,
        }))

        res.json(mappedSessions)
    })

    router.delete('/', cookiesMiddleware, async (req: Request, res: Response) => {
        const {refreshToken} = req.cookies

        const verifiedData = await jwtService.verifyUserByToken(refreshToken)

        await sessionsService.terminateAllOtherDeviceSessions(verifiedData!)

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

    router.delete('/:deviceId', cookiesMiddleware, async (req: RequestWithParams<URIParamsSessionIdModel>, res: Response) => {
        const {refreshToken} = req.cookies

        const verifiedData = await jwtService.verifyUserByToken(refreshToken)

        const deviceIdForDelete = req.params.deviceId

        const session = await sessionsQueryRepository.findSessionById(deviceIdForDelete)

        if (!session) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        }

        if (session.userId !== verifiedData!.id) {
            res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
            return
        }

        await sessionsService.deleteSession(deviceIdForDelete)

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

    return router
}
