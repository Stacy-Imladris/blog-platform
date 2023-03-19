import {AvailableResolutionsEnum, Nullable} from '../types';

export type VideosType = {
    id: number
    title: string
    author: string
    canBeDownloaded: boolean
    minAgeRestriction: Nullable<number>
    createdAt: string
    publicationDate: string
    availableResolutions: Array<keyof typeof AvailableResolutionsEnum>
}

export const db: DBType = {
    videos: [
        {
            id: 0,
            title: 'Next JS',
            author: 'Stacy',
            canBeDownloaded: true,
            minAgeRestriction: null,
            createdAt: "2023-03-19T16:15:21.034Z",
            publicationDate: "2023-03-20T16:15:21.034Z",
            availableResolutions: ['P480', 'P1080']
        },
        {
            id: 0,
            title: 'CSS',
            author: 'Sveta',
            canBeDownloaded: true,
            minAgeRestriction: null,
            createdAt: "2023-03-20T16:15:21.034Z",
            publicationDate: "2023-03-21T16:15:21.034Z",
            availableResolutions: ['P1440', 'P240']
        },
        {
            id: 2,
            title: 'Angular',
            author: 'Valera',
            canBeDownloaded: true,
            minAgeRestriction: null,
            createdAt: "2023-03-21T16:15:21.034Z",
            publicationDate: "2023-03-22T16:15:21.034Z",
            availableResolutions: ['P1080']
        }
    ]
}

export type DBType = {
    videos: VideosType[]
}