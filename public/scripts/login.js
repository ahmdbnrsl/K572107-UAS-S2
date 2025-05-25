login_form.addEventListener("submit", async e => {
    e.preventDefault();
    const wa_number = login_input.value;
    if (wa_number === "") return;
    await fetch("/sendotp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            wa_number,
            created_at: Date.now(),
            expired_at: Date.now() + 100000
        })
    });
});
