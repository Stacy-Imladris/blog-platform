import {__db} from '../../db/__db';

export const testsRepository = {
    async deleteAllData(): Promise<void> {
        __db.blogs = []
        __db.posts = []
        __db.videos = []
    }
}
