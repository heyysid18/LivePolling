"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const socket_io_1 = require("socket.io");
const socket_1 = __importDefault(require("./socket"));
const PORT = process.env.PORT || 4000;
// Create HTTP server
const server = http_1.default.createServer(app_1.default);
// Initialize Socket.io
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*', // For dev, allow all
        methods: ['GET', 'POST']
    }
});
// Setup socket events
(0, socket_1.default)(io);
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map