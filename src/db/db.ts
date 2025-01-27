import {MongoClient} from 'mongodb';
import {PostModel} from '../models/posts/PostModel';
import {BlogModel} from '../models/blogs/BlogModel';
import {UserModel} from '../models/users/UserModel';
import {settings} from '../settings';
import {CommentModel} from '../models/comments/CommentModel';
import {SessionModel} from '../models/sessions/SessionModel';
import {RateModel} from '../models/rate/RateModel';

const mongoUri = /*settings.MONGO_URI || */'mongodb://localhost:27017/blog-platform-local'

const client = new MongoClient(mongoUri)

const db = client.db()

export const usersCollection = db.collection<UserModel>('users');

export const sessionsCollection = db.collection<SessionModel>('sessions');

export const rateLimitCollection = db.collection<RateModel>('rate');

export const blogsCollection = db.collection<BlogModel>('blogs');

export const commentsCollection = db.collection<CommentModel>('comments');

export const postsCollection = db.collection<PostModel>('posts');

export async function runDB() {
    try {
        await client.connect()
        console.log(`Connected successfully to mongo server: ${mongoUri}`)
    } catch {
        console.log('Connection to mongo server failed')
        await client.close()
    }
}

export async function stopDB() {
    try {
        await client.close()
        console.log('Connection to mongo server has been successfully closed')
    } catch(err) {
        console.log(err)
    }
}

export const header = 'authorization'
export const getBasicAuthString = (token: string) => `Basic ${token}`
export const getJwtAuthString = (token: string) => `Bearer ${token}`

export const exclusionMongoId = {projection: {_id: 0}}

export const userProjection = {
    projection: {
        _id: 0,
        passwordHash: 0,
        passwordSalt: 0,
        emailConfirmation: 0
    }
}

export const commentsProjection = {
    projection: {
        _id: 0,
        postId: 0
    }
}

export const sessionsProjection = {
    projection: {
        _id: 0,
        userId: 0,
        refreshTokenPayload: 0,
    }
}
