import {AvailableResolutionsEnum, Nullable} from '../types';
import {__db, VideoType} from '../db/__db';
import {VideoViewModel} from '../models/videos/VideoViewModel';

export const videosRepository = {
    async findVideos(title: string | undefined): Promise<VideoViewModel[]> {
        let foundVideos = __db.videos

        if (title) {
            foundVideos = foundVideos.filter(el => el.title.toLowerCase().includes(title?.toString().toLowerCase()))
        }

        return foundVideos
    },

    async findVideoById(id: number): Promise<VideoViewModel | undefined> {
        return __db.videos.find(el => el.id === id)
    },

    async createVideo(title: string, author: string, availableResolutions: Array<keyof typeof AvailableResolutionsEnum>): Promise<VideoViewModel> {
        const date = new Date()

        const newVideo: VideoType = {
            id: __db.videos.length,
            title,
            author,
            availableResolutions,
            canBeDownloaded: false,
            minAgeRestriction: null,
            createdAt: date.toISOString(),
            publicationDate: new Date(date.setDate(date.getDate() + 1)).toISOString()
        }

        __db.videos.push(newVideo)

        return newVideo
    },

    async updateVideo(id: number, title: string, author: string, canBeDownloaded: boolean | undefined, availableResolutions: Array<keyof typeof AvailableResolutionsEnum>, publicationDate: string | undefined, minAgeRestriction: Nullable<number> | undefined): Promise<boolean> {
        let videoForUpdate = __db.videos.find(el => el.id === id)

        if (videoForUpdate) {
            videoForUpdate.title = title
            videoForUpdate.author = author
            if (canBeDownloaded) videoForUpdate.canBeDownloaded = canBeDownloaded
            if (availableResolutions) videoForUpdate.availableResolutions = availableResolutions
            if (publicationDate) videoForUpdate.publicationDate = publicationDate
            if (minAgeRestriction) videoForUpdate.minAgeRestriction = minAgeRestriction
            return true
        } else {
            return false
        }
    },

    async deleteVideo(id: number): Promise<boolean> {
        const videoToDelete = __db.videos.find(el => el.id === id)

        if (videoToDelete) {
            __db.videos = __db.videos.filter(f => f.id !== id)
            return true
        } else {
            return false
        }
    }
}
