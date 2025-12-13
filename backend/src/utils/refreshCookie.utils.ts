// src/utils/refreshCookie.utils.ts

import { Response } from 'express';

const isProd: boolean = process.env.NODE_ENV === 'production';


export const setRefreshTokenCookie = (res: Response, token: string): void => {

    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        // maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days  (also check in jwt.utils.ts)
        maxAge: 30 * 60 * 1000 // 30 minutes  (also check in jwt.utils.ts)
        // maxAge: 60 * 1000 // 60 seconds  (also check in jwt.utils.ts)
    });
};

export const clearRefreshTokenCookie = (res: Response): void => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        expires: new Date(0),
    });
};