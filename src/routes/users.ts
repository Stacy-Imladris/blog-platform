import express, {Response} from 'express';
import {usersService} from '../domain/users-service';
import {
    QueryResultType,
    RequestWithBody,
    RequestWithParams,
    RequestWithQuery
} from '../types';
import {CreateUserModel} from '../models/users/CreateUserModel';
import {UserViewModel} from '../models/users/UserViewModel';
import {basicAuthMiddleware} from '../middlewares/basic-auth-middleware';
import {HTTP_STATUSES} from '../utils';
import {URIParamsUserIdModel} from '../models/users/URIParamsUserIdModel';
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware';
import {
    userEmailValidator,
    userLoginValidator,
    userPasswordValidator
} from '../validators/users-validators';
import {usersQueryRepository} from '../repositories/users-query-repository';
import {getUsersQueryParams} from '../utils/getQueryParams';
import {QueryUsersModel} from '../models/users/QueryUsersModel';

export const getUsersRouter = () => {
    const router = express.Router()

    router.get('/', basicAuthMiddleware, async (req: RequestWithQuery<QueryUsersModel>, res: Response<QueryResultType<UserViewModel>>) => {
        const params = getUsersQueryParams(req.query)

        const usersQueryResult = await usersQueryRepository.findUsers(params)

        res.json(usersQueryResult)
    })

    router.post('/', basicAuthMiddleware, userLoginValidator, userPasswordValidator, userEmailValidator, inputValidationMiddleware, async (req: RequestWithBody<CreateUserModel>, res: Response<UserViewModel>) => {
        const {login, password, email} = req.body

        const newUserId = await usersService.createUser(login, password, email)

        const createdUser = await usersQueryRepository.findUserByMongoId(newUserId)

        if (createdUser) {
            res.status(HTTP_STATUSES.CREATED_201).json(createdUser)
            return
        }

        res.status(HTTP_STATUSES.BAD_REQUEST_400)
    })

    router.delete('/:id', basicAuthMiddleware, async (req: RequestWithParams<URIParamsUserIdModel>, res) => {
        const isDeleted = await usersService.deleteUser(req.params.id)

        if (isDeleted) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }
    })

    return router
}