import {RequestWithParams, RequestWithParamsAndBody,} from '../types';
import express, {Response} from 'express';
import {HTTP_STATUSES} from '../utils';
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware';
import {URIParamsCommentIdModel} from '../models/comments/URIParamsCommentIdModel';
import {CommentViewModel} from '../models/comments/CommentViewModel';
import {commentsQueryRepository} from '../repositories/comments-query-repository';
import {commentsService} from '../domain/comments-service';
import {authMiddleware} from '../middlewares/auth-middleware';
import {commentContentValidator} from '../validators/comments-validators';
import {UpdateCommentModel} from '../models/comments/UpdateCommentModel';

export const getCommentsRouter = () => {
    const router = express.Router()

    router.get('/:commentId', async (req: RequestWithParams<URIParamsCommentIdModel>,
                              res: Response<CommentViewModel>) => {
        const foundComment = await commentsQueryRepository.findCommentById(req.params.commentId)

        if (!foundComment) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        }

        res.json(foundComment)
    })

    router.put('/:commentId', authMiddleware, commentContentValidator, inputValidationMiddleware, async (req: RequestWithParamsAndBody<URIParamsCommentIdModel, UpdateCommentModel>, res) => {
        const commentToUpdate = await commentsQueryRepository.findCommentById(req.params.commentId)

        if (!commentToUpdate) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        }
        if (commentToUpdate.commentatorInfo.userId !== req.user!.id) {
            res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
            return
        }

        const isUpdated = await commentsService.updateComment(req.params.commentId, req.body.content)

        if (isUpdated) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }
    })

    router.delete('/:commentId', authMiddleware, async (
        req: RequestWithParams<URIParamsCommentIdModel>, res
    ) => {
        const commentToDelete = await commentsQueryRepository.findCommentById(req.params.commentId)

        if (!commentToDelete) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        }
        if (commentToDelete.commentatorInfo.userId !== req.user!.id) {
            res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
            return
        }

        const isDeleted = await commentsService.deleteComment(req.params.commentId)

        if (isDeleted) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }
    })

    return router
}
