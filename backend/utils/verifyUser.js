import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js'; // Adjust the import path as needed

/**
 * Middleware to verify the JWT token.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token; // Assumes token is stored in cookies

    if (!token) return next(errorHandler(401, 'You are not authenticated!'));

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return next(errorHandler(403, 'Token is not valid!'));

        req.user = user;
        next();
    });
};

/**
 * Middleware to check if the user is authenticated and has the required role.
 * @param {Array} roles - An array of roles that are allowed to access the route.
 * @returns {Function} - A middleware function.
 */
export const verifyRole = (roles) => (req, res, next) => {
    const { user } = req;

    if (!user) return next(errorHandler(401, 'You are not authenticated!'));

    if (!roles.includes(user.role)) return next(errorHandler(403, 'You do not have permission to access this resource!'));

    next();
};
