import exp, { Request } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
/** middleware **/
import { authMiddleware } from "./middlewares/auth.middleware";
/** controller **/
import { sendAndStoreOTP, verifyOTP } from "./controllers/auth.controller";
import {
    getAllContacts,
    addContact,
    deleteContact
} from "./controllers/contact.controller";
/**
 * Interface
 *
 *
 **/
interface ISendAndStoreOTPParams {
    wa_number: string;
    created_at: number;
    expired_at: number;
}

interface IVerifyOTPParams {
    wa_number: string;
    otp_code: string;
    now: number;
}

interface Req extends Request {
    user: { wa_number: string; serial_id: string };
}
/**
 * Init and Configuration
 *
 *
 **/
const app = exp();
const JWT_KEY = process.env.JWT_KEY || "";
app.use(exp.json());
app.use(cookieParser());
app.use(exp.urlencoded({ extended: true }));
app.use(exp.static(path.join(process.cwd(), "public")));
/**
 * Static page
 *
 *
 **/
app.get("/:page", authMiddleware, (req, res) => {
    const listPage = ["masuk", "beranda"];
    const params = req.params.page;
    if (listPage.includes(params)) {
        const pathFile = path.join(
            process.cwd(),
            "public/pages",
            `${params}.html`
        );
        res.sendFile(pathFile);
    } else {
        res.sendFile(path.join(process.cwd(), "public/pages", `404.html`));
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
    const params: ISendAndStoreOTPParams = req.body;
    params.created_at = Number(params.created_at);
    params.expired_at = Number(params.expired_at);
    const result = await sendAndStoreOTP(params);

    if (result) {
        res.status(200).json({
            status: true,
            code: 200,
            message: "Berhasil mengirim otp"
        });
    } else {
        res.status(500).json({
            status: true,
            code: 500,
            message: "Internal server error"
        });
    }
});

app.post("/api/login", async (req, res) => {
    console.log("POST API /api/login ...");
    const params: IVerifyOTPParams = req.body;
    params.now = Number(params.now);
    const result = await verifyOTP(params);

    if (result) {
        const token = jwt.sign(
            { wa_number: result.wa_number, serial_id: result.serial_id },
            JWT_KEY,
            { expiresIn: "30d" }
        );

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
    } else {
        res.status(500).json({
            status: true,
            code: 500,
            message: "Internal server error"
        });
    }
});
/*Contact API*/
app.get("/api/contacts", authMiddleware, async (req, res) => {
    console.log("POST API /api/contacts ...");
    const wa_number = (req as Req).user.wa_number;
    const contacts = await getAllContacts(wa_number);

    if (contacts) {
        res.json({
            status: true,
            code: 200,
            message: "Berhasil mendapatkan data kontak",
            contacts
        });
    } else {
        res.status(500).json({
            status: false,
            code: 500,
            message: "Interval server error"
        });
    }
});

app.post("/api/addcontact", authMiddleware, async (req, res) => {
    console.log("POST API /api/addcontact ...");
    const params = req.body;
    params.wa_number = (req as Req).user.wa_number;

    const add = await addContact(params);
    if (add) {
        res.status(200).json({
            status: true,
            code: 200,
            message: "Berhasil menambahkan kontak"
        });
    } else {
        res.status(400).json({
            status: false,
            code: 400,
            message: "Kontak sudah ditambahkan sebelumnya"
        });
    }
});

app.delete("/api/deletecontact", authMiddleware, async (req, res) => {
    console.log("POST API /api/deletecontact ...");
    const params = req.body;
    params.wa_number = (req as Req).user.wa_number;

    const del = await deleteContact(params);
    if (del) {
        res.status(200).json({
            status: true,
            code: 200,
            message: "Berhasil menghapus kontak"
        });
    } else {
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

app.listen(8000, () => {
    console.log("app is running...");
});
