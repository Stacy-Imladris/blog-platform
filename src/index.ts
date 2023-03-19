import express, {Request, Response} from 'express';

const app = express()
const port = 3000

app.get('/', (req: Request, res: Response) => {
  let helloWorld = 'Hello! I am Stacy. Nice to meet you!';
  res.send(helloWorld)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})