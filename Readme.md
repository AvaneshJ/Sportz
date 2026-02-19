# 🏆 Sportz WebSocket Server

A high-performance, real-time sports updates server built with **Node.js**, **WebSockets**, and **Drizzle ORM**. This server handles live match creation alerts and granular, match-specific commentary broadcasting.

---

## 🚀 Features

- **Real-time Subscriptions:** Clients can subscribe to specific match IDs to receive live commentary.
- **Global Broadcasts:** Instant notification to all connected clients when a new match is created.
- **Security & Rate Limiting:** Integrated with **Arcjet** to protect against bot attacks and socket exhaustion.
- **Heartbeat System:** Built-in Ping/Pong mechanism to prune dead connections and maintain server health.
- **Type-Safe Database:** Managed by **Drizzle ORM** with PostgreSQL.

---

## 🛠️ Tech Stack

| Tool            | Purpose                     |
| :-------------- | :-------------------------- |
| **Node.js**     | Server Runtime              |
| **ws**          | WebSocket Implementation    |
| **Drizzle ORM** | Database Layer (PostgreSQL) |
| **Zod**         | Schema Validation           |
| **Arcjet**      | Security & Rate Limiting    |

---

## 📦 Getting Started

### 1. Prerequisites

- Node.js (v20+ recommended)
- PostgreSQL database instance

### 2. Environment Setup

Create a `.env` file in the root directory:

````env
DATABASE_URL=postgres://user:password@localhost:5432/sportz
ARCJET_KEY=aj_your_key_here
PORT=8000```

### 3. Installation and Dependencies

npm install
npx drizzle-kit push

---
#🔌 WebSocket API
Endpoint: ws://localhost:8000/ws

Client Actions
Subscribe: {"type": "subscribe", "matchId": 101}

Unsubscribe: {"type": "unsubscribe", "matchId": 101}

Server Events
matchCreated: Sent to all clients when a new match is added.

commentaryUpdate: Sent only to clients subscribed to that specific matchId.

🛡️ Security
This project uses Arcjet for connection security:

Rate Limiting: Prevents single IPs from flooding the server.

Bot Protection: Blocks automated scrapers.

Health Checks: Prunes inactive "zombie" connections every 30 seconds.

📜 License
MIT
````
