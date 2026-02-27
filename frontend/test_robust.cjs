const { io } = require("socket.io-client");
const socket = io("http://localhost:4000");

socket.on("connect", () => {
  console.log("Connected:", socket.id);
  socket.emit("join_poll", { studentId: "test_robust", role: "student" });
});

socket.on("poll_started", (poll) => {
  console.log("poll_started:", poll);
  process.exit(0);
});

socket.on("error_message", (err) => {
  console.error("Socket error:", err);
  process.exit(1);
});

setTimeout(() => {
  console.log("Timeout 5s");
  process.exit(1);
}, 5000);
