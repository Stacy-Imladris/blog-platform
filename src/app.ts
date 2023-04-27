import express from 'express'
import bodyParser from 'body-parser'
import {getAuthRouter} from './routes/auth';
import {getBlogsRouter} from './routes/blogs';
import {getPostsRouter} from './routes/posts';
import {getUsersRouter} from './routes/users';
import {getVideosRouter} from './routes/videos';
import {getTestsRouter} from './routes/tests';
import {getCommentsRouter} from './routes/comments';

export const app = express()

app.use(bodyParser.json())

app.use('/auth', getAuthRouter())
app.use('/blogs', getBlogsRouter())
app.use('/comments', getCommentsRouter())
app.use('/posts', getPostsRouter())
app.use('/users', getUsersRouter())
app.use('/videos', getVideosRouter())
app.use('/testing', getTestsRouter())
