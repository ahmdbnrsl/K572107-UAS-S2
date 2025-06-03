const wa_number = window.localStorage.getItem("wa_number");
const target = document.URL.split("/").pop().split("?")[0];
const socket = io("/", {
    withCredentials: true
});
const config = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};
const params = new URLSearchParams(window.location.search);
const status = params.get("as");

if (!status || !["caller", "receiver"].includes(status)) {
    window.location.href = "/beranda";
}

let peerConnection;

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

    end_call.addEventListener("click", e => {
        e.preventDefault();
        socket.emit("end-call", {
            client_1: wa_number,
            client_2: target
        });
        window.location.href = "/beranda";
    });

    socket.on("end-call", () => {
        alert("Panggilan Berakhir");
        window.location.href = "/beranda";
    });

    if (status === "caller") {
        const targetInfo = await fetchContactInfo(target, wa_number);
        socket.emit("call", {
            from: wa_number,
            to: target,
            as_name: targetInfo?.as_name || ""
        });

        socket.on("target-offline", () => {
            alert("Nomor yang anda tuju sedang tidak aktif");
            window.location.href = "/beranda";
        });

        socket.on("user-in-call", () => {
            alert("Nomor yang anda tuju sedang berada di panggilan lain.");
            window.location.href = "/beranda";
        });

        socket.on("reject-call", () => {
            alert("Panggilan ditolak");
            window.location.href = "/beranda";
        });

        socket.on("receive-offer", async ({ from, offer }) => {
            try {
                target_name.style.color = "white";
                target_name.style.webkitTextStroke = "1px black;";
                target_name.innerHTML = targetInfo?.as_name || target;
                peerConnection = new RTCPeerConnection(config);

                video_call.style.display = "inline-block";

                if (window.localStream) {
                    window.localStream
                        .getTracks()
                        .forEach(track => track.stop());
                }

                const stream = await window.navigator.mediaDevices.getUserMedia(
                    {
                        video: true,
                        audio: true
                    }
                );

                localVideo.srcObject = stream;
                window.localStream = stream;

                stream.getTracks().forEach(track => {
                    peerConnection.addTrack(track, stream);
                });

                peerConnection.onicecandidate = e => {
                    if (e.candidate) {
                        socket.emit("ice-candidate", {
                            info: { from: wa_number, to: target },
                            candidate: e.candidate
                        });
                    }
                };

                peerConnection.ontrack = e => {
                    remoteVideo.srcObject = e.streams[0];
                };

                await peerConnection.setRemoteDescription(
                    new RTCSessionDescription(offer)
                );
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);

                socket.emit("send-answer", {
                    to: target,
                    from: wa_number,
                    answer
                });
            } catch (e) {
                alert(e);
            }
        });
    } else {
        try {
            const targetInfo = await fetchContactInfo(target, wa_number);

            target_name.style.color = "white";
            target_name.style.webkitTextStroke = "1px black;";
            target_name.innerHTML = targetInfo?.as_name || target;
            peerConnection = new RTCPeerConnection(config);

            video_call.style.display = "inline-block";

            if (window.localStream) {
                window.localStream.getTracks().forEach(track => track.stop());
            }

            const stream = await window.navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            localVideo.srcObject = stream;
            window.localStream = stream;

            stream.getTracks().forEach(track => {
                peerConnection.addTrack(track, stream);
            });

            peerConnection.onicecandidate = e => {
                if (e.candidate) {
                    socket.emit("ice-candidate", {
                        info: { from: wa_number, to: target },
                        candidate: e.candidate
                    });
                }
            };

            peerConnection.ontrack = e => {
                remoteVideo.srcObject = e.streams[0];
            };

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            socket.emit("send-offer", {
                from: wa_number,
                to: target,
                offer
            });

            socket.on("receive-answer", async ({ answer }) => {
                if (peerConnection) {
                    await peerConnection.setRemoteDescription(
                        new RTCSessionDescription(answer)
                    );
                }
            });
        } catch (e) {
            alert(e);
            window.location.href = "/beranda";
        }
    }

    socket.on("ice-candidate", ({ candidate }) => {
        if (peerConnection) {
            peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
    });

    socket.on("reset-call-event", () => {
        alert("Nomor yang anda tuju sedang offline");
        window.location.href = "/beranda";
    });
});

socket.on("connect_error", err => {
    console.error("Connect error:", err.message);
});

socket.on("error", err => {
    console.error("Socket error:", err);
});
