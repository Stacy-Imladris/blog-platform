export const getFirstTwoPartsOfJwtToken = (jwt: string) => jwt
    .split('.').slice(0, 2).join('.')
