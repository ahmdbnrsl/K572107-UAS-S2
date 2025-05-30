const socket = io("http://localhost:8000", {
    withCredentials: true
});

socket.on("connect", () => {
    socket.emit("join", document.URL.split("/").pop());
    console.log("Connected to socket");
});

socket.on("connect_error", err => {
    console.error("Connect error:", err.message);
});

socket.on("error", err => {
    console.error("Socket error:", err);
});
