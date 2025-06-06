"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
/**
 * Configuration
 *
 *
 **/
const JWT_KEY = process.env.JWT_KEY || "";
/**
 * Middleware
 *
 *
 **/
const socketMiddleware = (socket, next) => {
    const cookieHeader = socket.handshake.headers.cookie;
    if (!cookieHeader)
        return next(new Error("No cookie"));
    const cookies = Object.fromEntries(cookieHeader.split("; ").map((c) => c.split("=")));
    try {
        const decoded = jsonwebtoken_1.default.verify(cookies.token, JWT_KEY);
        const wa_number = decoded.wa_number;
        if (!wa_number)
            return next(new Error("No Wa Number in cookie"));
        socket.wa_number = wa_number;
        next();
    }
    catch (err) {
        return next(new Error("Cookie Error please login again"));
    }
};
exports.socketMiddleware = socketMiddleware;
