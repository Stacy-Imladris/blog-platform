import {AvailableResolutionsEnum, Nullable} from '../types';
import {db, VideoType} from '../db/db';

export const videosRepository = {
    findVideos(title: string | undefined) {
        let foundVideos = db.videos

        if (title) {
            foundVideos = foundVideos.filter(el => el.title.toLowerCase().includes(title?.toString().toLowerCase()))
        }

        return foundVideos
    },

    findVideoById(id: number) {
        return db.videos.find(el => el.id === id)
    },

    createVideo(title: string, author: string, availableResolutions: Array<keyof typeof AvailableResolutionsEnum>) {
        const date = new Date()

        const newVideo: VideoType = {
            id: db.videos.length,
            title,
            author,
            availableResolutions,
            canBeDownloaded: false,
            minAgeRestriction: null,
            createdAt: date.toISOString(),
            publicationDate: new Date(date.setDate(date.getDate() + 1)).toISOString()
        }

        db.videos.push(newVideo)

        return newVideo
    },

    updateVideo(id: number, title: string, author: string, canBeDownloaded: boolean | undefined, availableResolutions: Array<keyof typeof AvailableResolutionsEnum>, publicationDate: string | undefined, minAgeRestriction: Nullable<number> | undefined) {
        let videoForUpdate = db.videos.find(el => el.id === id)

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

    deleteVideo(id: number) {
        const videoToDelete = db.videos.find(el => el.id === id)

        if (videoToDelete) {
            db.videos = db.videos.filter(f => f.id !== id)
            return true
        } else {
            return false
        }
    },
}
