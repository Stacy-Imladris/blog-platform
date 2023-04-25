import {blogsCollection, postsCollection, usersCollection} from '../db/db';

export const testsRepository = {
    async deleteAllData(): Promise<void> {
        await blogsCollection.deleteMany({})
        await postsCollection.deleteMany({})
        await usersCollection.deleteMany({})
    }
}
