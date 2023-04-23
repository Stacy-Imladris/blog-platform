import {MongoClient} from 'mongodb';
import {BlogViewModel} from '../models/blogs/BlogViewModel';
import {PostViewModel} from '../models/posts/PostViewModel';
import * as dotenv from 'dotenv'
dotenv.config()

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/blog-platform-local'

const client = new MongoClient(mongoUri)

const db = client.db()

export const blogsCollection = db.collection<BlogViewModel>('blogs');

export const postsCollection = db.collection<PostViewModel>('posts');

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
