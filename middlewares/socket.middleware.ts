import jwt, { JwtPayload } from "jsonwebtoken";
import "dotenv/config";
/**
 * Interfaces
 *
 *
 **/
interface IDecoded extends JwtPayload {
    wa_number: string;
}
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
export const socketMiddleware = (socket: any, next: any) => {
    const cookieHeader = socket.handshake.headers.cookie;
    if (!cookieHeader) return next(new Error("No cookie"));

    const cookies = Object.fromEntries(
        cookieHeader.split("; ").map((c: any) => c.split("="))
    );

    try {
        const decoded = jwt.verify(cookies.token, JWT_KEY);
        const wa_number = (decoded as IDecoded).wa_number;
        if (!wa_number) return next(new Error("No Wa Number in cookie"));

        socket.wa_number = wa_number;
        next();
    } catch (err) {
        return next(new Error("Cookie Error please login again"));
    }
};
