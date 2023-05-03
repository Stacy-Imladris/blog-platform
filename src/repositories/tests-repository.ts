import {
    blogsCollection,
    commentsCollection,
    postsCollection, sessionsCollection,
    usersCollection
} from '../db/db';
import {__db} from '../db/__db';

export const testsRepository = {
    async deleteAllData(): Promise<void> {
        await blogsCollection.deleteMany({})
        await commentsCollection.deleteMany({})
        await postsCollection.deleteMany({})
        await usersCollection.deleteMany({})
        await sessionsCollection.deleteMany({})
        /**
         * Obsolete: clean memory db for videos (for passing tests)
         */
        __db.videos = []
    }
}
