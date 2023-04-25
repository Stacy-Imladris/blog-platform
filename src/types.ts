import {Request} from 'express'

export type RequestWithBody<T> = Request<{}, {}, T>
export type RequestWithQuery<T> = Request<{}, {}, {}, T>
export type RequestWithParams<T> = Request<T>
export type RequestWithParamsAndQuery<T, D> = Request<T, {}, {}, D>
export type RequestWithParamsAndBody<T, D> = Request<T, {}, D>

export type Nullable<T> = T | null

export enum AvailableResolutionsEnum {
    'P144',
    'P240',
    'P360',
    'P480',
    'P720',
    'P1080',
    'P1440',
    'P2160'
}

export type APIErrorResultType = {
    errorsMessages: FieldErrorType[]
}

export type FieldErrorType = {
    message: Nullable<string>
    field: Nullable<string>
}

export type QueryResultType<T> = {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: T[]
}
