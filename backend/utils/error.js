// utils/error.js

/**
 * Creates an error object for handling HTTP errors.
 * @param {number} statusCode - The HTTP status code.
 * @param {string} message - The error message.
 * @returns {Object} - The error object.
 */
export const errorHandler = (statusCode, message) => {
    const error = new Error(message); // Initialize Error with the message
    error.statusCode = statusCode; // Correct property name and ensure it's lowercase
    return error;
};
