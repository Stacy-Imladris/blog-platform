import {
    blogsCollection,
    commentsCollection,
    postsCollection,
    usersCollection
} from '../db/db';

export const testsRepository = {
    async deleteAllData(): Promise<void> {
        await blogsCollection.deleteMany({})
        await commentsCollection.deleteMany({})
        await postsCollection.deleteMany({})
        await usersCollection.deleteMany({})
    }
}
