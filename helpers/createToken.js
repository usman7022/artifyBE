const dotenv = require('dotenv');
dotenv.config();
const jwt = require('jsonwebtoken');

const HttpError = require('./http-error');

const createToken = (options, next) => {
    let token;
    try {
        token = jwt.sign(options,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPRISE_IN });
    } catch (err) {
        console.log({ err });
        return next(new HttpError('Token error', 500));
    }

    return token;
};

module.exports = createToken;