import express from 'express'
import bodyParser from 'body-parser'
import {getTestsRouter} from './routes/tests';
import {db} from './db/db';
import {getVideosRouter} from './routes/videos';

export const app = express()

app.use(bodyParser.json())

app.use('/videos', getVideosRouter(db))
app.use('/testing', getTestsRouter(db))