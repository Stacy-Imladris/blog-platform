import {HTTP_STATUSES} from '../src/utils';
import {getBasicAuthString, header, runDB, stopDB} from '../src/db/db';
import {Nullable} from '../src/types';
import {settings} from '../src/settings';
import {CreateUserModel} from '../src/models/users/CreateUserModel';
import {getRequest} from '../src/app';
import {loginUserAndGetData} from '../src/utils/testsUtils/loginUserAndGetData';
import {SessionViewModel} from '../src/models/sessions/SessionViewModel';

describe('/security/devices', () => {
  const userData: CreateUserModel = {
    login: 'login',
    password: '12345678',
    email: 'email@mail.io',
  }

  const userAgent = 'Mozilla/5.0 Chrome/86.0.4240.75'

  let refreshToken1: Nullable<string> = null
  let refreshToken3: Nullable<string> = null
  let newRefreshToken1: Nullable<string> = null

  let lastActiveDate1: Nullable<Date> = null

  let deviceId1: Nullable<string> = null
  let deviceId2: Nullable<string> = null
  let deviceId3: Nullable<string> = null
  let deviceId4: Nullable<string> = null

  beforeAll(async () => {
    await runDB()
    await getRequest().delete('/testing/all-data')

    await getRequest()
        .post('/users')
        .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
        .send(userData)
        .expect(HTTP_STATUSES.CREATED_201)
  })

  afterAll(async () => {
    await stopDB()
  })

  it('POST /auth/login - should login user for four times with correct credentials', async () => {
    [deviceId1, refreshToken1] = await loginUserAndGetData(userData, userAgent);
    [deviceId2] = await loginUserAndGetData(userData, 'Mozilla/5.0 Gecko/20100101 QQBrowser/9.7.13021.400');
    [deviceId3, refreshToken3] = await loginUserAndGetData(userData, 'Mozilla/5.0 Firefox/84.0');
    [deviceId4] = await loginUserAndGetData(userData, 'Mozilla/5.0 Safari/537.36');

    expect([deviceId1, deviceId2, deviceId3, deviceId4].every(deviceId => typeof deviceId === 'string')).toBeTruthy()
  })

  it('GET /security/devices - shouldn\'t return a list of user\'s active devices with incorrect refresh token', async () => {
    await getRequest()
        .get('/security/devices')
        .set('Cookie', [`refreshToken=incorrectRefreshToken`])
        .expect(HTTP_STATUSES.NOT_AUTHORIZED_401)
  })

  it('GET /security/devices - should return a list of user\'s active devices', async () => {
    const res = await getRequest()
        .get('/security/devices')
        .set('Cookie', [`refreshToken=${refreshToken1}`])
        .expect(HTTP_STATUSES.OK_200)

    lastActiveDate1 = res.body[0].lastActiveDate

    expect(res.body.length).toBe(4)
    expect(res.body[0].title).toBe(userAgent)
    expect(lastActiveDate1).not.toBeNull()
  })

  it('POST /auth/refresh-token - should return JWT accessToken in body and JWT refreshToken in cookie', async () => {
    /**
     * Delay before next request (1sec)
     */
    await new Promise(resolve => setTimeout(resolve, 1000))

    const res = await getRequest()
        .post('/auth/refresh-token')
        .set('User-Agent', userAgent)
        .set('Cookie', [`refreshToken=${refreshToken1}`])
        .expect(HTTP_STATUSES.OK_200)

    const cookie = res.get('Set-Cookie')
    newRefreshToken1 = cookie[0].split('=')[1]

    expect(typeof newRefreshToken1).toBe('string')
  })

  it('GET /security/devices - should return a list of user\'s active devices with new refresh token', async () => {
    const res = await getRequest()
        .get('/security/devices')
        .set('Cookie', [`refreshToken=${newRefreshToken1}`])
        .expect(HTTP_STATUSES.OK_200)

    const newLastActiveDate1 = res.body[0].lastActiveDate

    expect(res.body.length).toBe(4)
    expect(res.body[0].title).toBe(userAgent)
    expect(newLastActiveDate1 > lastActiveDate1!).toBeTruthy()
  })

  it('DELETE /security/devices/:deviceId - shouldn\'t delete device without refresh token', async () => {
    await getRequest()
        .delete(`/security/devices/${deviceId2}`)
        .expect(HTTP_STATUSES.NOT_AUTHORIZED_401)

    const res = await getRequest()
        .get('/security/devices')
        .set('Cookie', [`refreshToken=${newRefreshToken1}`])
        .expect(HTTP_STATUSES.OK_200)

    expect(res.body.length).toBe(4)
  })

  it('DELETE /security/devices/:deviceId - shouldn\'t delete another user\'s device', async () => {
    const userData2: CreateUserModel = {
      login: 'login2',
      password: '123456789',
      email: 'email2@mail.io',
    }

    await getRequest()
        .post('/users')
        .set(header, getBasicAuthString(settings.BASIC_AUTH_TOKEN))
        .send(userData2)
        .expect(HTTP_STATUSES.CREATED_201)

    const [newUserDeviceId, newUserRefreshToken] = await loginUserAndGetData(userData2, 'newUserAgent');

    await getRequest()
        .delete(`/security/devices/${newUserDeviceId}`)
        .set('Cookie', [`refreshToken=${newRefreshToken1}`])
        .expect(HTTP_STATUSES.FORBIDDEN_403)

    const res = await getRequest()
        .get('/security/devices')
        .set('Cookie', [`refreshToken=${newUserRefreshToken}`])
        .expect(HTTP_STATUSES.OK_200)

    expect(res.body.length).toEqual(1)
  })

  it('DELETE /security/devices/:deviceId - shouldn\'t delete device with incorrect device id', async () => {
    await getRequest()
        .delete(`/security/devices/incorrectDeviceId`)
        .set('Cookie', [`refreshToken=${newRefreshToken1}`])
        .expect(HTTP_STATUSES.NOT_FOUND_404)

    const res = await getRequest()
        .get('/security/devices')
        .set('Cookie', [`refreshToken=${newRefreshToken1}`])
        .expect(HTTP_STATUSES.OK_200)

    expect(res.body.length).toBe(4)
  })

  it('DELETE /security/devices/:deviceId - should delete device with new refresh token', async () => {
    await getRequest()
        .delete(`/security/devices/${deviceId2}`)
        .set('Cookie', [`refreshToken=${newRefreshToken1}`])
        .expect(HTTP_STATUSES.NO_CONTENT_204)

    const res = await getRequest()
        .get('/security/devices')
        .set('Cookie', [`refreshToken=${newRefreshToken1}`])
        .expect(HTTP_STATUSES.OK_200)

    const devicesList: SessionViewModel[] = res.body

    expect(devicesList.length).toBe(3)
    expect(devicesList.some(device => device.deviceId === deviceId2)).toBeFalsy()
  })

  it('POST /auth/logout - should logout user from third device', async () => {
    await getRequest()
        .post('/auth/logout')
        .set('Cookie', [`refreshToken=${refreshToken3}`])
        .expect(HTTP_STATUSES.NO_CONTENT_204)

    const res = await getRequest()
        .get('/security/devices')
        .set('Cookie', [`refreshToken=${newRefreshToken1}`])
        .expect(HTTP_STATUSES.OK_200)

    const devicesList: SessionViewModel[] = res.body

    expect(devicesList.length).toBe(2)
    expect(devicesList.some(device => device.deviceId === deviceId3)).toBeFalsy()
  })

  it('DELETE /security/devices - shouldn\'t delete all devices with incorrect refresh token', async () => {
    await getRequest()
        .delete(`/security/devices`)
        .set('Cookie', [`refreshToken=incorrectRefreshToken`])
        .expect(HTTP_STATUSES.NOT_AUTHORIZED_401)

    const res = await getRequest()
        .get('/security/devices')
        .set('Cookie', [`refreshToken=${newRefreshToken1}`])
        .expect(HTTP_STATUSES.OK_200)

    expect(res.body.length).toBe(2)
  })

  it('DELETE /security/devices - should delete all devices with correct refresh token', async () => {
    await getRequest()
        .delete(`/security/devices`)
        .set('Cookie', [`refreshToken=${newRefreshToken1}`])
        .expect(HTTP_STATUSES.NO_CONTENT_204)

    const res = await getRequest()
        .get('/security/devices')
        .set('Cookie', [`refreshToken=${newRefreshToken1}`])
        .expect(HTTP_STATUSES.OK_200)

    const devicesList: SessionViewModel[] = res.body

    expect(devicesList.length).toBe(1)
    expect(devicesList[0].deviceId).toBe(deviceId1)
  })
})
