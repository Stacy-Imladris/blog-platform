import {AvailableResolutionsEnum, Nullable} from '../../types';

export type VideoViewModel = {
    id: number
    title: string
    author: string
    canBeDownloaded: boolean
    minAgeRestriction: Nullable<number>
    createdAt: string
    publicationDate: string
    availableResolutions: Array<keyof typeof AvailableResolutionsEnum>
}
