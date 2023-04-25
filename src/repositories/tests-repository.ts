import {__db} from '../db/__db';
import {blogsCollection, postsCollection} from '../db/db';

export const testsRepository = {
    async deleteAllData(): Promise<void> {
        await blogsCollection.deleteMany({})
        await postsCollection.deleteMany({})
    }
}
