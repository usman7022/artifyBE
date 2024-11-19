
const HttpError = require('../helpers/http-error');
module.exports = (req, res, next) => {
    const userRole =  req.role ;
    if (userRole === 'superAdminUser') {
        next();
    } else {
        return next(new HttpError('Access denied. You must be a superAdmin to access this route.', 403));
    }
};
