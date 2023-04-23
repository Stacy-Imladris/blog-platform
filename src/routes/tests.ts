import express from 'express';
import {HTTP_STATUSES} from '../utils';
import {testsRepository} from '../repositories/tests-repository';

export const getTestsRouter = () => {
    const router = express.Router()

    router.delete('/all-data', async (req, res) => {
        await testsRepository.deleteAllData()

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

    return router
}