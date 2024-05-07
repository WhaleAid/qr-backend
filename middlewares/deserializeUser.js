const jwt = require('jsonwebtoken');
const { VerifyJWT, SignJWT } = require('../utils/jwt.utils');
const { getSession } = require('../services');

exports.deserializeUser = (req, res, next) => {
    const { accessToken, refreshToken } = req.cookies;

    if (!accessToken && !refreshToken) {
        return next();
    }

    const { payload, expired } = VerifyJWT(accessToken);

    if (payload) {
        req.user = payload;
        return next();
    }

    const { payload: refresh } = expired && refreshToken ? VerifyJWT(refreshToken) : { payload: null };

    if (!refresh || !refresh.sessionId) {
        return next();
    }

    const session = req.sessionStore.get(refresh.sessionId, (error, session) => {
        if (error || !session) {
            return next();
        }

        const newAccessToken = SignJWT(session.user, '5s');

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            maxAge: 30000000,
        });

        req.user = VerifyJWT(newAccessToken).payload;

        return next();
    });
}