const wa_number = window.localStorage.getItem("wa_number");
const target = document.URL.split("/").pop();
const socket = io("http://localhost:8000", {
    withCredentials: true
});

socket.on("connect", async () => {
    socket.emit("join");
    const response = await fetch("/api/contactinfo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            wa_number: target,
            save: wa_number
        })
    });

    if (!response?.ok) {
        alert("Terjadi kesalahan");
        window.location.href = "/beranda";
    } else {
        const contactInfo = await response.json();
        const targetInfo = {
            from: wa_number,
            to: target,
            as_name: contactInfo.contactInfo.save
                ? contactInfo.contactInfo.as_name
                : ""
        };

        socket.emit("call", targetInfo);
    }

    socket.on("offline-target", info => {
        if (info.from === wa_number) {
            alert("Nomor yang anda tuju sedang offline");
            window.location.href = "/beranda";
        }
    });

    socket.on("call-rejected", info => {
        if (info.from === wa_number) {
            alert("Panggilan ditolak");
            window.location.href = "/beranda";
        }
    });
});

socket.on("connect_error", err => {
    console.error("Connect error:", err.message);
});

socket.on("error", err => {
    console.error("Socket error:", err);
});
