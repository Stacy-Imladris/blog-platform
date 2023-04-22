import {AvailableResolutionsEnum} from '../../types';

export type CreateVideoModel = {
    title: string
    author: string
    availableResolutions: Array<keyof typeof AvailableResolutionsEnum>
}
