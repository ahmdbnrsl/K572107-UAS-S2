"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const otp_controller_1 = require("./controllers/otp.controller");
/**
 * Init and Configuration
 *
 *
 **/
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static(path_1.default.join(process.cwd(), "public")));
/**
 * Static page
 *
 *
 **/
app.get("/:page", (req, res) => {
    const listPage = ["login"];
    const params = req.params.page;
    if (listPage.includes(params)) {
        const pathFile = path_1.default.join(process.cwd(), "public/pages", `${params}.html`);
        res.sendFile(pathFile);
    }
    else {
        res.sendFile(path_1.default.join(process.cwd(), "public/pages", `404.html`));
    }
});
/**
 * API ROUTE
 *
 *
 **/
app.post("/sendotp", async (req, res) => {
    const params = req.body;
    params.created_at = Number(params.created_at);
    params.expired_at = Number(params.expired_at);
    const result = await (0, otp_controller_1.sendAndStoreOTP)(params);
    res.json({ valid: true });
});
app.listen(8000, () => {
    console.log("app is running...");
});
