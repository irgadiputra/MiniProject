"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = void 0;
class HttpError extends Error {
    constructor(status, message) {
        super(message); // Call the parent constructor with the error message
        this.status = status;
        // Set the prototype explicitly to maintain the correct prototype chain in TypeScript
        Object.setPrototypeOf(this, HttpError.prototype);
        // Capture the stack trace for better debugging in V8 engines (Node.js)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, HttpError);
        }
    }
}
exports.HttpError = HttpError;
