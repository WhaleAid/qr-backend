const { VerifyJWT, SignJWT } = require('../utils/jwt.utils');

exports.deserializeUser = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        console.log('No authorization header present.');
        return next();
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        console.log('No token found in authorization header.');
        return next();
    }

    const { payload, expired } = VerifyJWT(token);

    if (payload) {
        req.user = payload;
        console.log('User deserialized:', req.user);
        return next();
    }

    if (expired) {
        console.log('Token expired.');
        return next();
    }

    console.log('Invalid token.');
    return next();
};

