const { io } = require("socket.io-client");
const socket = io("http://localhost:4000");

socket.on("connect", () => {
  console.log("Connected:", socket.id);
  socket.emit("join_poll", { studentId: "test", role: "student" });
});

socket.on("error_message", (msg) => {
  console.log("error_message:", msg);
});

socket.on("poll_started", (poll) => {
  console.log("poll_started:", poll.question);
});

socket.on("timer_sync", (time) => {
  console.log("timer_sync:", time);
});

setTimeout(() => {
  console.log("Timeout 3s");
  process.exit(0);
}, 3000);
