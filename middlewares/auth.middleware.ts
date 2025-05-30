import jwt from "jsonwebtoken";
import "dotenv/config";
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
export function authMiddleware(req: any, res: any, next: any) {
    const token = req.cookies.token;
    const path = req.path;

    if (path === "/masuk") {
        if (token) {
            try {
                jwt.verify(token, JWT_KEY);
                return res.redirect("/beranda");
            } catch {
                res.clearCookie("token");
            }
        }
        return next();
    }

    if (!token) {
        return res.redirect("/masuk");
    }

    try {
        const decoded = jwt.verify(token, JWT_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        res.clearCookie("token");
        return res.redirect("/masuk");
    }
}
