import type { Response } from "express";

type TData<T> = {
    statusCode: number;
    success: boolean;
    message: string;
    data?: any;
    error?: any;
}

const sendResponse = <T>(res: Response, data: TData<T>) => {
    res.status(data.statusCode).json({
        success: data.success,
        message: data.message,
        data: data.data,
        error: data.error
    });
}

export default sendResponse;