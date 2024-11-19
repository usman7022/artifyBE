const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const HttpError = require('../helpers/http-error');
module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        next();
    }
    const token = req.cookies.access_token;
    if (!token) {
        return next(new HttpError('Authentication failed', 401));
    }
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_KEY);
        req.userId = decodedToken.userId;
        req.email = decodedToken.email;
        req.role = decodedToken.role;
        next();
    } catch (err) {
        console.log(err);
        return next(new HttpError('Authentication failed', 401));
    }
};



