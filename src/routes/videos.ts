import {
    APIErrorResultType,
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody
} from '../types';
import express, {Request, Response} from 'express';
import {VideoViewModel} from '../models/VideoViewModel';
import {URIParamsVideoIdModel} from '../models/URIParamsVideoIdModel';
import {CreateVideoModel} from '../models/CreateVideoModel';
import {UpdateVideoModel} from '../models/UpdateVideoModel';
import {DBType, VideosType} from '../db/db';
import {
    createErrorObject,
    HTTP_STATUSES,
    validateRequiredStringDataFromBody
} from '../utils';

export const getVideosRouter = (db: DBType) => {
    const router = express.Router()

    router.get('/', (req: Request, res: Response<VideoViewModel[]>) => {
        const foundVideos = db.videos

        res.json(foundVideos)
    })

    router.get('/:id', (req: RequestWithParams<URIParamsVideoIdModel>,
                             res: Response<VideoViewModel>) => {
        const foundVideo = db.videos.find(el => el.id === +req.params.id)

        if (!foundVideo) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return;
        }

        res.json(foundVideo)
    })

    router.post('/', (req: RequestWithBody<CreateVideoModel>,
                          res: Response<VideoViewModel | APIErrorResultType>) => {
        const {title, author, availableResolutions} = req.body

        const errorObject: APIErrorResultType = {errorsMessages: []}

        const titleError = validateRequiredStringDataFromBody(title, 'title', 40)
        const authorError = validateRequiredStringDataFromBody(author, 'author', 20)

        if (titleError) errorObject.errorsMessages.push(titleError)
        if (authorError) errorObject.errorsMessages.push(authorError)
        if (availableResolutions && !availableResolutions.length) errorObject.errorsMessages.push(createErrorObject('availableResolutions'))

        if (!!errorObject.errorsMessages.length) {
            res.status(HTTP_STATUSES.BAD_REQUEST_400).json(errorObject)
            return;
        }

        const date = new Date()

        const newVideo: VideosType = {
            id: db.videos.length,
            title,
            author,
            availableResolutions,
            canBeDownloaded: false,
            minAgeRestriction: null,
            createdAt: date.toISOString(),
            publicationDate: new Date(date.setDate(date.getDate() + 1)).toISOString()
        }

        db.videos.push(newVideo)

        res.status(HTTP_STATUSES.CREATED_201).json(newVideo)
    })

    router.put('/:id', (req: RequestWithParamsAndBody<URIParamsVideoIdModel, UpdateVideoModel>,
                        res) => {
        const {
            title,
            author,
            canBeDownloaded,
            availableResolutions,
            publicationDate,
            minAgeRestriction
        } = req.body

        let videoForUpdate = db.videos.find(el => el.id === +req.params.id)

        if (!videoForUpdate) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return;
        }

        const errorObject: APIErrorResultType = {errorsMessages: []}

        const titleError = validateRequiredStringDataFromBody(title, 'title', 40)
        const authorError = validateRequiredStringDataFromBody(author, 'author', 20)

        if (titleError) errorObject.errorsMessages.push(titleError)
        if (authorError) errorObject.errorsMessages.push(authorError)
        if (availableResolutions && !availableResolutions.length) errorObject.errorsMessages.push(createErrorObject('availableResolutions'))
        if (!!minAgeRestriction && (minAgeRestriction > 18 || minAgeRestriction < 1)) errorObject.errorsMessages.push(createErrorObject('canBeDownloaded'))

        if (!!errorObject.errorsMessages.length) {
            res.status(HTTP_STATUSES.BAD_REQUEST_400).json(errorObject)
            return;
        }

        videoForUpdate.title = title
        videoForUpdate.author = author
        if (canBeDownloaded) videoForUpdate.canBeDownloaded = canBeDownloaded
        videoForUpdate.availableResolutions = availableResolutions
        if (publicationDate) videoForUpdate.publicationDate = publicationDate
        if (minAgeRestriction) videoForUpdate.minAgeRestriction = minAgeRestriction

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

    router.delete('/:id', (req: RequestWithParams<URIParamsVideoIdModel>,
                                res) => {
        const videoToDelete = db.videos.find(el => el.id === +req.params.id)

        if (!videoToDelete) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return;
        }

        db.videos = db.videos.filter(f => f.id !== +req.params.id)

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

    return router
}