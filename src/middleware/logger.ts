import type { NextFunction, Request, Response } from "express";
import fs from "fs";

const logger = ((req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();

    const log = [`[${timestamp}]`, `METHOD: ${req.method}`, `URL: ${req.originalUrl}`, `IP: ${req.ip}`, `USER-AGENT: ${req.get("user-agent") || "Unknown"}`,].join(" | ");
    // console.log(log);
    fs.appendFile("./log.txt", log + "\n", "utf8", (err) => {
        if (err) console.error(err);
    });
    next();
});

export default logger