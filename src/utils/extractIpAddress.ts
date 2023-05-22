import {Request} from 'express';

export const extractIpAddress = (req: Request) => {
    // @ts-ignore
    return (req.headers['x-forwarded-for'] || '').split(',').pop() || req.headers["x-real-ip"] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress
}
