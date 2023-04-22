import {AvailableResolutionsEnum, Nullable} from '../../types';

export type UpdateVideoModel = {
    title: string
    author: string
    canBeDownloaded?: boolean
    minAgeRestriction?: Nullable<number>
    publicationDate?: string
    availableResolutions: Array<keyof typeof AvailableResolutionsEnum>
}