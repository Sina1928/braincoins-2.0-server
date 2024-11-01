export class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
export const errorHandler = (err, _req, res, _next) => {
    console.error("Error:", err);
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: "error",
            message: err.message,
        });
    }
    return res.status(500).json({
        status: "error",
        message: "Internal server error",
    });
};
//# sourceMappingURL=errorHandler.js.map