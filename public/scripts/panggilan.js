const wa_number = window.localStorage.getItem("wa_number");
const target = document.URL.split("/").pop();
const socket = io("http://localhost:8000", {
    withCredentials: true
});

const fetchContactInfo = async (wa_number, save) => {
    const response = await fetch("/api/contactinfo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            wa_number,
            save
        })
    });
    if (!response?.ok) {
        return false;
    } else {
        const contactInfo = await response.json();
        return contactInfo.contactInfo;
    }
};

socket.on("connect", async () => {
    socket.emit("join");

    const contactInfo = await fetchContactInfo(target, wa_number);

    if (!contactInfo) {
        alert("Terjadi kesalahan");
        window.location.href = "/beranda";
    } else {
        const targetInfo = {
            from: wa_number,
            to: target,
            as_name: contactInfo.save ? contactInfo.as_name : ""
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

    socket.on("target-in-another-call", info => {
        if (info.to != target) {
            alert("Nomor yang anda tuju sedang dalam panggilan lain");
            window.location.href = "/beranda";
        }
    });

    socket.on("call-accepted", async info => {
        if ([info.to, info.from].includes(wa_number)) {
            const contactInfo = await fetchContactInfo(wa_number, target);
            if (!contactInfo) {
                alert("Terjadi kesalahan");
                window.location.href = "/beranda";
            } else {
                users.innerText = contactInfo.save;
            }
        }
    });
});

socket.on("connect_error", err => {
    console.error("Connect error:", err.message);
});

socket.on("error", err => {
    console.error("Socket error:", err);
});
