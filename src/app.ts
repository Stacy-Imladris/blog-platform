import express from 'express'
import bodyParser from 'body-parser'
import {getTestsRouter} from './routes/tests';
import {db} from './db/db';
import {getVideosRouter} from './routes/videos';
import {getBlogsRouter} from './routes/blogs';
import {getPostsRouter} from './routes/posts';

export const app = express()

app.use(bodyParser.json())

app.use('/blogs', getBlogsRouter())
app.use('/posts', getPostsRouter())
app.use('/videos', getVideosRouter())
app.use('/testing', getTestsRouter(db))