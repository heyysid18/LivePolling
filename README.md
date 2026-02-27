# 📊 Resilient Live Polling System

> A robust, real-time polling architecture built with React, Node.js, Socket.IO, and MongoDB, engineered for high concurrency, fault tolerance, and seamless state recovery.

[![Deployed Application](https://img.shields.io/badge/Live_Demo-Coming_Soon-blue.svg)](#)

## 🚀 Features
- **Real-Time Synchronization**: Instantaneous voting updates and timer syncing across all connected clients via WebSockets.
- **Role-Based Access Control**: Distinct Teacher (Create/End Polls) and Student (Vote/View Results) workflows.
- **Optimistic UI Updates**: Immediate UI feedback for students upon voting, masked with zero-latency visual confirmation before server validation.
- **Complete State Recovery**: Bulletproof hydration that gracefully survives browser refreshes, accidental tab closures, and even total backend server restarts.
- **Atomic Race-Condition Protection**: Strict MongoDB transactions and dual-factor compound indexing completely eliminate duplicate voting logic vulnerabilities, even against malicious API spam.

## 🛠 Tech Stack

**Frontend:**
- **Core**: React 18, TypeScript, Vite
- **State/Routing**: React Context API, React Router DOM
- **Real-Time**: Socket.IO-Client
- **Styling UI/UX**: Vanilla CSS (Strict Figma design adherence), Lucide React, React Hot Toast

**Backend:**
- **Core**: Node.js, Express.js, TypeScript
- **Real-Time**: Socket.IO
- **Database**: MongoDB (Mongoose)

## 🏗 Architecture Overview

The system utilizes a decoupled Client-Server architecture heavily reliant on bidirectional event-driven communication (Socket.IO) backed by a REST API for initial state hydration.

```mermaid
graph TD
    Client[React Frontend] <-->|Socket.IO (Events)| Server[Node.js Backend]
    Client -->|REST GET /api/polls/active| Server
    Server <-->|Mongoose Transactions| DB[(MongoDB Replica Set)]
```

### The Resilience Engine

1. **REST Pre-Hydration Barrier:**
   When a user connects, the React `SocketContext` immediately halts the app's `react-router` execution by displaying a `<Loader2>` while it executes a synchronous REST `GET /api/polls/active` call. This guarantees the UI does not suffer from premature unauthenticated redirects before the WebSocket connection formally establishes.
2. **Backend Timer Durability:**
   Instead of relying on fragile client-side countdowns, the backend calculates absolute time relative to the Database `startTime`. Furthermore, if the Node server completely crashes, a `resumeActivePolls` boot-routine scans the DB, mathematically deduces the missing seconds, and resumes the broadcast timer instantly without freezing active clients.

### Race Condition & API Spam Prevention

To combat malicious users executing concurrent HTTP requests or modifying frontend JavaScript to vote twice:
- **Dual-Factor DB Constraints**: The `Vote` model enforces a `Unique Compound Index` combining `pollId` + `studentName`. This operates natively at the bare-metal persistence layer.
- **Mongoose Atomic Transactions**: The `castVote` service executes purely within an isolated `mongoose.startSession()` block. The DB processes the optimistic read barrier (`findOne`), performs the vote insertion, and triggers the Poll total `$inc` (Atomic Increment). If a concurrent request beats the read-barrier by milliseconds, the Compound Index instantly triggers a fatal MongoDB `11000 Duplicate Key` code. The transaction intelligently intercepts error `11000`, rolls back the `$inc` to preserve data integrity, and kicks back a safe socket error.

## 📂 Folder Structure

```
📦 LivePollingSystem
 ┣ 📂 backend
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 config       # MongoDB connection logic
 ┃ ┃ ┣ 📂 controllers  # REST API business logic wrappers
 ┃ ┃ ┣ 📂 middleware   # Error handling & validation
 ┃ ┃ ┣ 📂 models       # Mongoose Schemas (Poll, Vote)
 ┃ ┃ ┣ 📂 routes       # Express API routes
 ┃ ┃ ┣ 📂 services     # Core logic (PollService, Atomic Transactions)
 ┃ ┃ ┗ 📂 socket       # Socket.io event receivers and emitters
 ┃ ┣ 📜 app.ts         # Express server setup
 ┃ ┗ 📜 server.ts      # HTTP and Socket server initialization
 ┣ 📂 frontend
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 contexts     # React Context (SocketProvider, State Recovery)
 ┃ ┃ ┣ 📂 hooks        # Extracted logic (useSocket, usePoll, usePollTimer)
 ┃ ┃ ┣ 📂 pages        # Domain-driven UI components
 ┃ ┃ ┃ ┣ 📂 student    # NameEntry, PollQuestion, LiveResults
 ┃ ┃ ┃ ┗ 📂 teacher    # CreatePoll, LiveDashboard, PollHistory
 ┃ ┃ ┣ 📜 App.tsx      # Routing and Load Blockers
 ┃ ┃ ┗ 📜 main.tsx     # React DOM entry point
 ┗ 📜 .gitignore
```

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB running as a Replica Set for transactions)

### 1. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory:
```env
PORT=4000
MONGODB_URI=mongodb://<username>:<password>@cluster0-shard-00-00.mongodb.net:27017,cluster0-shard-00-01.mongodb.net:27017,cluster0-shard-00-02.mongodb.net:27017/poll_db?ssl=true&replicaSet=atlas-xxxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
FRONTEND_URL=http://localhost:3000
```
Run the backend:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend/` directory:
```env
VITE_BACKEND_URL=http://localhost:4000
```
Run the frontend:
```bash
npm run dev
```

## 🌐 Deployment
*Links coming soon...*
- **Frontend Live URL:** [Deployment Link](#)
- **Backend API URL:** [Base URL](#)
