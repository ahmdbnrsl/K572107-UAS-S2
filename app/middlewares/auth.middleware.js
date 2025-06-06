"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
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
function authMiddleware(req, res, next) {
    const token = req.cookies.token;
    const path = req.path;
    if (path === "/masuk" || path === "/") {
        if (path === "/" && !token)
            return res.redirect("/beranda");
        if (token) {
            try {
                jsonwebtoken_1.default.verify(token, JWT_KEY);
                return res.redirect("/beranda");
            }
            catch (_a) {
                res.clearCookie("token");
            }
        }
        return next();
    }
    if (!token) {
        return res.redirect("/masuk");
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_KEY);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.clearCookie("token");
        return res.redirect("/masuk");
    }
}
