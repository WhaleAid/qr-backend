const { VerifyJWT, SignJWT } = require('../utils/jwt.utils');

exports.deserializeUser = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        console.log('No authorization header present.');
        return next();
    }

    const token = authHeader.split(' ')[1]; // Get the token part

    if (!token) {
        console.log('No token found in authorization header.');
        return next();
    }

    const { payload, expired } = VerifyJWT(token);

    if (payload) {
        req.user = payload; // Set the user object on the request
        console.log('User deserialized:', req.user);
        return next();
    }

    if (expired) {
        console.log('Token expired.');
        return next(); // Optionally, handle token expiration (e.g., refresh token flow)
    }

    console.log('Invalid token.');
    return next(); // No valid payload, proceed without setting req.user
};
