import {db} from '../db/db';

export const testsRepository = {
    deleteAllData() {
        db.blogs = []
        db.posts = []
        db.videos = []
    }
}
