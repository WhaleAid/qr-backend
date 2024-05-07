const jwt = require('jsonwebtoken');


exports.SignJWT = (payload, expiresIn) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: expiresIn });
}

exports.VerifyJWT = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return { payload: decoded, expired: false };
    } catch (error) {
        return { payload: null, expired: error.message === 'jwt expired' };
    }
}