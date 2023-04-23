import {
    APIErrorResultType,
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithQuery
} from '../types';
import express, {Response} from 'express';
import {VideoViewModel} from '../models/videos/VideoViewModel';
import {URIParamsVideoIdModel} from '../models/videos/URIParamsVideoIdModel';
import {CreateVideoModel} from '../models/videos/CreateVideoModel';
import {UpdateVideoModel} from '../models/videos/UpdateVideoModel';
import {
    createErrorObject,
    HTTP_STATUSES,
    isResolutionsInvalid,
    validateRequiredStringDataFromBody
} from '../utils';
import {videosRepository} from '../repositories/videos-repository';
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware';
import {QueryVideosModel} from '../models/videos/QueryVideosModel';
import {titleValidator} from '../validators/videos-validators';

export const getVideosRouter = () => {
    const router = express.Router()

    router.get('/', async (req: RequestWithQuery<QueryVideosModel>, res: Response<VideoViewModel[]>) => {
        const foundVideos = await videosRepository.findVideos(req.query.title?.toString())

        res.json(foundVideos)
    })

    router.get('/:id', async (req: RequestWithParams<URIParamsVideoIdModel>,
                             res: Response<VideoViewModel>) => {
        const foundVideo = await videosRepository.findVideoById(+req.params.id)

        if (!foundVideo) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        }

        res.json(foundVideo)
    })

    router.post('/', titleValidator, inputValidationMiddleware, async (req: RequestWithBody<CreateVideoModel>, res: Response<VideoViewModel | APIErrorResultType>) => {
        const {title, author, availableResolutions} = req.body

        const errorObject: APIErrorResultType = {errorsMessages: []}

        const authorError = validateRequiredStringDataFromBody(author, 'author', 20)

        if (authorError) errorObject.errorsMessages.push(authorError)
        if (availableResolutions && (!availableResolutions.length || isResolutionsInvalid(availableResolutions))) errorObject.errorsMessages.push(createErrorObject('availableResolutions'))

        if (!!errorObject.errorsMessages.length) {
            res.status(HTTP_STATUSES.BAD_REQUEST_400).json(errorObject)
            return;
        }

        const newVideo = await videosRepository.createVideo(title, author, availableResolutions)

        res.status(HTTP_STATUSES.CREATED_201).json(newVideo)
    })

    router.put('/:id', titleValidator, inputValidationMiddleware, async (req: RequestWithParamsAndBody<URIParamsVideoIdModel, UpdateVideoModel>, res) => {
        const {
            title,
            author,
            canBeDownloaded,
            availableResolutions,
            publicationDate,
            minAgeRestriction
        } = req.body

        const errorObject: APIErrorResultType = {errorsMessages: []}

        const authorError = validateRequiredStringDataFromBody(author, 'author', 20)

        if (authorError) errorObject.errorsMessages.push(authorError)
        if (availableResolutions && (!availableResolutions.length || isResolutionsInvalid(availableResolutions))) {
            errorObject.errorsMessages.push(createErrorObject('availableResolutions'))
        }
        if (!!minAgeRestriction && (minAgeRestriction > 18 || minAgeRestriction < 1)) {
            errorObject.errorsMessages.push(createErrorObject('minAgeRestriction'))
        }
        if (!!canBeDownloaded && typeof canBeDownloaded !== 'boolean') {
            errorObject.errorsMessages.push(createErrorObject('canBeDownloaded'))
        }
        if (!!publicationDate && typeof publicationDate !== 'string') {
            errorObject.errorsMessages.push(createErrorObject('publicationDate'))
        }

        if (!!errorObject.errorsMessages.length) {
            res.status(HTTP_STATUSES.BAD_REQUEST_400).json(errorObject)
            return;
        }

        const isUpdated = await videosRepository.updateVideo(+req.params.id, title, author, canBeDownloaded, availableResolutions, publicationDate, minAgeRestriction)

        if (isUpdated) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }
    })

    router.delete('/:id', async (req: RequestWithParams<URIParamsVideoIdModel>,
                                res) => {
        const isDeleted = await videosRepository.deleteVideo(+req.params.id)

        if (isDeleted) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }
    })

    return router
}
