"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
require("dotenv/config");
/** middleware **/
const auth_middleware_1 = require("./middlewares/auth.middleware");
const socket_middleware_1 = require("./middlewares/socket.middleware");
/** controller **/
const auth_controller_1 = require("./controllers/auth.controller");
const contact_controller_1 = require("./controllers/contact.controller");
const users_controller_1 = require("./controllers/users.controller");
/**
 * Init and Configuration
 *
 *
 **/
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const IO = new socket_io_1.Server(server);
const users = new Map();
const JWT_KEY = process.env.JWT_KEY || "";
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static(path_1.default.join(process.cwd(), "public")));
/**
 * Static page
 *
 *
 **/
app.get("/:page", auth_middleware_1.authMiddleware, async (req, res) => {
    const listPage = ["masuk", "beranda"];
    const params = req.params.page;
    if (listPage.includes(params)) {
        const pathFile = path_1.default.join(process.cwd(), "public/pages", `${params}.html`);
        res.sendFile(pathFile);
    }
    else {
        res.sendFile(path_1.default.join(process.cwd(), "public/pages", `404.html`));
    }
});
app.get("/panggilan/:wanumber", async (req, res) => {
    const wa_number = req.params.wanumber;
    const query = req.query.as;
    if (!wa_number ||
        !query ||
        !["caller", "receiver"].includes(query)) {
        res.sendFile(path_1.default.join(process.cwd(), "public/pages", `404.html`));
    }
    else {
        const checkExist = await (0, users_controller_1.checkIfUserExist)(wa_number);
        if (!checkExist) {
            res.sendFile(path_1.default.join(process.cwd(), "public/pages", `404.html`));
        }
        else
            res.sendFile(path_1.default.join(process.cwd(), "public/pages", `panggilan.html`));
    }
});
/**
 * API ROUTE
 *
 *
 **/
/*Authentication API*/
app.post("/api/sendotp", async (req, res) => {
    console.log("POST API /api/sendotp ...");
    const params = req.body;
    params.created_at = Number(params.created_at);
    params.expired_at = Number(params.expired_at);
    const result = await (0, auth_controller_1.sendAndStoreOTP)(params);
    if (result) {
        res.status(200).json({
            status: true,
            code: 200,
            message: "Berhasil mengirim otp"
        });
    }
    else {
        res.status(500).json({
            status: true,
            code: 500,
            message: "Internal server error"
        });
    }
});
app.post("/api/login", async (req, res) => {
    console.log("POST API /api/login ...");
    const params = req.body;
    params.now = Number(params.now);
    const result = await (0, auth_controller_1.verifyOTP)(params);
    if (result) {
        const token = jsonwebtoken_1.default.sign({ wa_number: result.wa_number, serial_id: result.serial_id }, JWT_KEY, { expiresIn: "30d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000
        });
        res.status(200).json({
            status: true,
            code: 200,
            message: "Berhasil login"
        });
    }
    else {
        res.status(500).json({
            status: true,
            code: 500,
            message: "Internal server error"
        });
    }
});
/*Contact API*/
app.post("/api/contactinfo", auth_middleware_1.authMiddleware, async (req, res) => {
    console.log("POST API /api/contactinfo ...");
    const params = req.body;
    const contactInfo = await (0, contact_controller_1.getContactInfo)(params);
    if (contactInfo) {
        res.json({
            status: true,
            code: 200,
            message: "Berhasil mendapatkan data kontak",
            contactInfo
        });
    }
    else {
        res.status(500).json({
            status: false,
            code: 500,
            message: "Interval server error"
        });
    }
});
app.get("/api/contacts", auth_middleware_1.authMiddleware, async (req, res) => {
    console.log("GET API /api/contacts ...");
    const wa_number = req.user.wa_number;
    const contacts = await (0, contact_controller_1.getAllContacts)(wa_number);
    if (contacts) {
        res.json({
            status: true,
            code: 200,
            message: "Berhasil mendapatkan data kontak",
            contacts
        });
    }
    else {
        res.status(500).json({
            status: false,
            code: 500,
            message: "Interval server error"
        });
    }
});
app.post("/api/addcontact", auth_middleware_1.authMiddleware, async (req, res) => {
    console.log("POST API /api/addcontact ...");
    const params = req.body;
    params.wa_number = req.user.wa_number;
    const add = await (0, contact_controller_1.addContact)(params);
    if (add) {
        res.status(200).json({
            status: true,
            code: 200,
            message: "Berhasil menambahkan kontak"
        });
    }
    else {
        res.status(400).json({
            status: false,
            code: 400,
            message: "Kontak sudah ditambahkan sebelumnya"
        });
    }
});
app.delete("/api/deletecontact", auth_middleware_1.authMiddleware, async (req, res) => {
    console.log("DELETE API /api/deletecontact ...");
    const params = req.body;
    params.wa_number = req.user.wa_number;
    const del = await (0, contact_controller_1.deleteContact)(params);
    if (del) {
        res.status(200).json({
            status: true,
            code: 200,
            message: "Berhasil menghapus kontak"
        });
    }
    else {
        res.status(400).json({
            status: false,
            code: 400,
            message: "Kontak tidak ada"
        });
    }
});
app.use((req, res, next) => {
    res.status(404).json({
        status: false,
        code: 404,
        message: "Not Found"
    });
});
/**
 * Socket handler
 *
 *
 **/
const userOnline = new Map();
const userInCall = new Map();
IO.use(socket_middleware_1.socketMiddleware);
IO.on("connection", socket => {
    socket.on("join", () => {
        userOnline.set(socket.wa_number, socket.id);
    });
    socket.on("call", async ({ from, to, as_name }) => {
        userInCall.set(socket.wa_number, { from, to, as_name });
        const onlineUser = userOnline.get(to);
        const inCallUser = userInCall.get(to);
        if (!onlineUser) {
            socket.emit("target-offline");
        }
        else if (inCallUser &&
            inCallUser.from !== socket.wa_number &&
            inCallUser &&
            inCallUser.to !== socket.wa_number) {
            socket.emit("user-in-call");
        }
        else {
            IO.to(onlineUser).emit("incoming-call", { from, to, as_name });
            userInCall.set(to, { from, to, as_name });
        }
    });
    socket.on("reject-call", ({ from, to, as_name }) => {
        const fromId = userOnline.get(from);
        const targetId = userOnline.get(to);
        IO.to([fromId, targetId]).emit("reject-call");
    });
    socket.on("send-offer", ({ to, from, offer }) => {
        const targetSocketId = userOnline.get(to);
        if (targetSocketId) {
            IO.to(targetSocketId).emit("receive-offer", { from, offer });
            console.log(to, offer);
        }
    });
    socket.on("send-answer", ({ to, from, answer }) => {
        const targetSocketId = userOnline.get(to);
        if (targetSocketId) {
            IO.to(targetSocketId).emit("receive-answer", { from, answer });
            console.log(to, answer);
        }
    });
    socket.on("ice-candidate", ({ info, candidate }) => {
        const targetSocketId = userOnline.get(info.to);
        if (targetSocketId) {
            IO.to(targetSocketId).emit("ice-candidate", { candidate });
            console.log(info.to, candidate);
        }
    });
    socket.on("disconnect", () => {
        userOnline.delete(socket.wa_number);
    });
});
server.listen(8000, () => {
    console.log("app is running...");
});
