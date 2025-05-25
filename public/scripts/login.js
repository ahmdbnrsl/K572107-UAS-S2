login_form.addEventListener("submit", async e => {
    e.preventDefault();
    const wa_number = login_input.value;
    if (wa_number === "") return;

    login_subtitle.style.color = "rgba(100, 100, 100, 1)";
    login_subtitle.innerText = "Masuk Dengan Nomor Whatsapp";
    login_loading.style.display = "flex";
    login_btn.style.display = "none";

    const sendOTP = await fetch("/api/sendotp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            wa_number,
            created_at: Date.now(),
            expired_at: Date.now() + 10000000
        })
    });

    login_loading.style.display = "none";

    if (!sendOTP?.ok) {
        login_btn.style.display = "flex";
        login_subtitle.style.color = "red";
        login_subtitle.innerText = "Nomor tidak valid atau server error";
    } else {
        login_input.style.display = "none";
        login_otp.style.display = "flex";
        login_verify_otp.style.display = "flex";
    }
});

login_verify_otp.addEventListener("click", async e => {
    e.preventDefault();
    const otp_code = login_otp.value;
    if (otp_code.length < 6) return;

    login_verify_otp.style.display = "none";
    login_loading.innerText = "Memverifikasi OTP ...";
    login_loading.style.display = "flex";

    const wa_number = login_input.value;
    const login = await fetch("/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            wa_number,
            otp_code,
            now: Date.now()
        })
    });

    login_loading.style.display = "none";

    if (!login?.ok) {
        login_subtitle.style.color = "red";
        login_subtitle.innerText =
            "OTP salah atau kadaluarsa atau server error";
        login_verify_otp.style.display = "flex";
        refresh.style.display = "flex";
    } else {
        login_verify_otp.disabled = true;
        login_verify_otp.style.display = "flex";
        window.location.href = "/beranda";
    }
});
