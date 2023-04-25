import {AvailableResolutionsEnum, Nullable} from '../types';

export const __db: DBType = {
    blogs: [
        {
            id: '0',
            name: 'Google',
            description: 'Google blog',
            websiteUrl: 'https://www.google.com/',
            createdAt: '2023-03-21T16:15:21.034Z',
            isMembership: false
        }
    ],
    posts: [
        {
            id: '0',
            title: 'Post 1',
            shortDescription: 'Description for post 1',
            content: 'Content of post 1',
            blogId: '0',
            blogName: 'string',
            createdAt: '2023-03-22T17:15:21.034Z'
        },
        {
            id: '1',
            title: 'Post 2',
            shortDescription: 'Description for post 2',
            content: 'Content of post 2',
            blogId: '0',
            blogName: 'Google',
            createdAt: '2023-03-23T18:15:21.034Z'
        }
    ],
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
            id: 1,
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

//types
export type DBType = {
    blogs: BlogType[]
    posts: PostType[]
    videos: VideoType[]
}

export type BlogType = {
    id: string
    name: string
    description: string
    websiteUrl: string
    createdAt: string
    isMembership: boolean
}

export type PostType = {
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string
}

export type VideoType = {
    id: number
    title: string
    author: string
    canBeDownloaded: boolean
    minAgeRestriction: Nullable<number>
    createdAt: string
    publicationDate: string
    availableResolutions: Array<keyof typeof AvailableResolutionsEnum>
}
