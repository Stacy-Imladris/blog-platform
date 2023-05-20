/**
 * function to extract the user data from access_token
 */
export const parseJwt = (token: string) => {
    if (!token) {
        return
    }
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    /**
     * converting Base64-encoded ASCII string to binary
     */
    const res = Buffer.from(base64, 'base64').toString('binary')
    return JSON.parse(res);
}
