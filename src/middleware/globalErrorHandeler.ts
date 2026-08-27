import type { NextFunction, Request, Response } from "express";

// Global Error Handling Middleware
const globalErrorHandler = ((err: any, req: Request, res: Response, next: NextFunction) => {

    res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

export default globalErrorHandler