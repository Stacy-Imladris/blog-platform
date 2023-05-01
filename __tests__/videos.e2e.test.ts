import {createErrorObject, HTTP_STATUSES} from '../src/utils';
import {CreateVideoModel} from '../src/models/videos/CreateVideoModel';
import {UpdateVideoModel} from '../src/models/videos/UpdateVideoModel';
import {getRequest} from '../src/app';

describe('/videos', () => {
    beforeAll(async () => {
        await getRequest().delete('/testing/all-data')
    })

    it('should return 200 and empty array', async () => {
        await getRequest().get('/videos')
            .expect(HTTP_STATUSES.OK_200, [])
    })

    it('should return 404 for not existing video', async () => {
        await getRequest().get('/videos/1')
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('shouldn\'t create video with incorrect title data', async () => {
        const data: CreateVideoModel = {
            title: '',
            author: 'Stacy',
            availableResolutions: ['P240']
        }

        await getRequest().post('/videos')
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        await getRequest()
            .get('/videos')
            .expect(HTTP_STATUSES.OK_200, [])
    })

    it('shouldn\'t create video with incorrect availableResolutions data', async () => {
        const data = {
            title: 'New video title',
            author: 'Stacy',
            availableResolutions: ['P240', 'Invalid']
        }

        await getRequest().post('/videos')
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [createErrorObject('availableResolutions')]
            })

        await getRequest()
            .get('/videos')
            .expect(HTTP_STATUSES.OK_200, [])
    })

    let createdVideo1: any = null
    it('should create video with correct input data', async () => {
        const data: CreateVideoModel = {
            title: 'Nest JS',
            author: 'Stacy',
            availableResolutions: ['P240']
        }

        const createdResponse = await getRequest()
            .post('/videos')
            .send(data)
            .expect(HTTP_STATUSES.CREATED_201)

        createdVideo1 = createdResponse.body

        expect(createdVideo1).toEqual({
            id: expect.any(Number),
            title: data.title,
            author: data.author,
            availableResolutions: data.availableResolutions,
            canBeDownloaded: false,
            minAgeRestriction: null,
            createdAt: expect.any(String),
            publicationDate: expect.any(String)
        })

        await getRequest()
            .get('/videos')
            .expect(HTTP_STATUSES.OK_200, [createdVideo1])
    })

    let createdVideo2: any = null
    it('create one more video', async () => {
        const data: CreateVideoModel = {
            title: 'Node JS',
            author: 'Stacy',
            availableResolutions: ['P1080']
        }

        const createdResponse = await getRequest()
            .post('/videos')
            .send(data)
            .expect(HTTP_STATUSES.CREATED_201)

        createdVideo2 = createdResponse.body

        expect(createdVideo2).toEqual({
            id: expect.any(Number),
            title: data.title,
            author: data.author,
            availableResolutions: data.availableResolutions,
            canBeDownloaded: false,
            minAgeRestriction: null,
            createdAt: expect.any(String),
            publicationDate: expect.any(String)
        })

        await getRequest()
            .get('/videos')
            .expect(HTTP_STATUSES.OK_200, [createdVideo1, createdVideo2])
    })

    it('shouldn\'t update video with incorrect title data', async () => {
        const data: UpdateVideoModel = {
            title: '   ',
            author: 'Dima',
            availableResolutions: ['P2160'],
        }

        await getRequest()
            .put(`/videos/${createdVideo1.id}`)
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        await getRequest()
            .get(`/videos/${createdVideo1.id}`)
            .expect(HTTP_STATUSES.OK_200, createdVideo1)
    })

    it('shouldn\'t update video with incorrect availableResolutions data', async () => {
        const data = {
            title: 'New correct title',
            author: 'Alex',
            availableResolutions: ['P2160', 'wrong resolution'],
        }

        await getRequest()
            .put(`/videos/${createdVideo1.id}`)
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        await getRequest()
            .get(`/videos/${createdVideo1.id}`)
            .expect(HTTP_STATUSES.OK_200, createdVideo1)
    })

    it('shouldn\'t update video with incorrect \'title\' and \'canBeDownloaded\' data', async () => {
        const data = {
            title: null,
            author: "valid author",
            availableResolutions: ["P144","P240","P720"],
            canBeDownloaded: "string",
            minAgeRestriction: 17,
            publicationDate: "2023-03-22T19:50:46.412Z"
        }

        await getRequest()
            .put(`/videos/${createdVideo1.id}`)
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        await getRequest()
            .get(`/videos/${createdVideo1.id}`)
            .expect(HTTP_STATUSES.OK_200, createdVideo1)
    })

    it('shouldn\'t update video that don\'t exists', async () => {
        const data: UpdateVideoModel = {
            title: 'New video title',
            author: 'Dima',
            availableResolutions: ['P2160'],
        }

        await getRequest()
            .put(`/videos/-999`)
            .send(data)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('should update video with correct input data', async () => {
        const data: UpdateVideoModel = {
            title: 'New video title',
            author: 'Dima',
            availableResolutions: ['P2160'],
        }

        await getRequest()
            .put(`/videos/${createdVideo1.id}`)
            .send(data)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await getRequest()
            .get(`/videos/${createdVideo1.id}`)
            .expect(HTTP_STATUSES.OK_200, {...createdVideo1, ...data})

        await getRequest()
            .get(`/videos/${createdVideo2.id}`)
            .expect(HTTP_STATUSES.OK_200, createdVideo2)
    })

    it('should delete both videos', async () => {
        await getRequest()
            .delete(`/videos/${createdVideo1.id}`)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await getRequest()
            .get(`/videos/${createdVideo1.id}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        await getRequest()
            .delete(`/videos/${createdVideo2.id}`)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await getRequest()
            .get(`/videos/${createdVideo2.id}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        await getRequest()
            .get(`/videos`)
            .expect(HTTP_STATUSES.OK_200, [])
    })
})
