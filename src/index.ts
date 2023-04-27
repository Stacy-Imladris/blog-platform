import {app} from './app';
import {runDB} from './db/db';
import {settings} from './settings';

const port = settings.PORT || 3000

const startApp = async () => {
  await runDB()
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
}

startApp()
