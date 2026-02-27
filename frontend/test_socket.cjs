const { io } = require("socket.io-client");
const socket = io("http://localhost:4000");

socket.on("connect", () => {
  console.log("Connected:", socket.id);
  socket.emit("create_poll", {
    question: "Test CJS Socket",
    options: [{ id: "1", text: "A" }, { id: "2", text: "B" }],
    duration: 60,
    createdBy: "TestRunner"
  });
});

socket.on("poll_started", (poll) => {
  console.log("poll_started received:", poll.question);
  process.exit(0);
});

socket.on("error_message", (err) => {
  console.error("Socket error:", err);
  process.exit(1);
});

setTimeout(() => {
  console.log("Timeout reached without receiving poll_started");
  process.exit(1);
}, 3000);
