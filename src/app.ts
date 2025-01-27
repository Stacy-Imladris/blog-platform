import express from 'express'
import cookieParser from 'cookie-parser';
import request from 'supertest';
import bodyParser from 'body-parser'
import {getAuthRouter} from './routes/auth';
import {getBlogsRouter} from './routes/blogs';
import {getCommentsRouter} from './routes/comments';
import {getPostsRouter} from './routes/posts';
import {getUsersRouter} from './routes/users';
import {getSessionsRouter} from './routes/sessions';
import {getVideosRouter} from './routes/videos';
import {getTestsRouter} from './routes/tests';

export const app = express()

app.set('trust proxy', true)
app.use(bodyParser.json())
app.use(cookieParser())

app.use('/auth', getAuthRouter())
app.use('/blogs', getBlogsRouter())
app.use('/comments', getCommentsRouter())
app.use('/posts', getPostsRouter())
app.use('/users', getUsersRouter())
app.use('/security/devices', getSessionsRouter())
app.use('/videos', getVideosRouter())
app.use('/testing', getTestsRouter())

export const getRequest = () => request(app)
