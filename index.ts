import exp from "express";
import path from "path";
import { sendAndStoreOTP } from "./controllers/otp.controller";
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
/**
 * Init and Configuration
 *
 *
 **/
const app = exp();
app.use(exp.json());
app.use(exp.urlencoded({ extended: true }));
app.use(exp.static(path.join(process.cwd(), "public")));
/**
 * Static page
 *
 *
 **/
app.get("/:page", (req, res) => {
    const listPage = ["login"];
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
app.post("/sendotp", async (req, res) => {
    const params: ISendAndStoreOTPParams = req.body;
    params.created_at = Number(params.created_at);
    params.expired_at = Number(params.expired_at);
    const result = await sendAndStoreOTP(params);
    res.json({ valid: true });
});

app.listen(8000, () => {
    console.log("app is running...");
});
