export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
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
