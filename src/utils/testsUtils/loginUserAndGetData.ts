import {CreateAuthModel} from '../../models/auth/CreateAuthModel';
import {getRequest} from '../../app';
import {HTTP_STATUSES} from '../../utils';
import {parseJwt} from '../parseJwt';
import {CreateUserModel} from '../../models/users/CreateUserModel';

export const loginUserAndGetData = async (userData: CreateUserModel, userAgent: string) => {
    const authData: CreateAuthModel = {
        loginOrEmail: userData.login,
        password: userData.password,
    }

    const res = await getRequest()
        .post('/auth/login')
        .set('User-Agent', userAgent)
        .send(authData)
        .expect(HTTP_STATUSES.OK_200)

    const cookie = res.get('Set-Cookie')
    const refreshToken = cookie[0].split('=')[1]

    const {deviceId} = parseJwt(refreshToken)

    return [deviceId, refreshToken]
}
