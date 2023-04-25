import {MongoClient} from 'mongodb';
import * as dotenv from 'dotenv'
import {PostModel} from '../models/posts/PostModel';
import {BlogModel} from '../models/blogs/BlogModel';
import {UserModel} from '../models/users/UserModel';

dotenv.config()

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/blog-platform-local'

const client = new MongoClient(mongoUri)

const db = client.db()

export const usersCollection = db.collection<UserModel>('users');

export const blogsCollection = db.collection<BlogModel>('blogs');

export const postsCollection = db.collection<PostModel>('posts');

export async function runDB() {
    try {
        await client.connect()
        await client.db('blogs').command({ping: 1})

        console.log('Connected successfully to mongo server')
    } catch {
        console.log('Connection to mongo server failed')
        await client.close()
    }
}

export const header = 'authorization'
export const token = 'Basic YWRtaW46cXdlcnR5'

export const exclusionMongoId = {projection: {_id: 0}}

export const userProjection = {
    projection: {
        _id: 0,
        passwordHash: 0,
        passwordSalt: 0
    }
}
