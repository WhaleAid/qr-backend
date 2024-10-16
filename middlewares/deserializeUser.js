const { VerifyJWT, SignJWT } = require('../utils/jwt.utils');

exports.deserializeUser = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next();
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return next();
    }

    const { payload, expired } = VerifyJWT(token);

    if (payload) {
        req.user = payload;
        return next();
    }

    if (expired) {
        return next();
    }

    return next();
};
