🏆 Sportz WebSocket Server
A high-performance, real-time sports updates server built with Node.js, WebSockets, and Drizzle ORM. This server handles live match creation alerts and granular, match-specific commentary broadcasting.

🚀 Features
Real-time Subscriptions: Clients can subscribe to specific match IDs to receive live commentary.

Global Broadcasts: Instant notification to all connected clients when a new match is created.

Security & Rate Limiting: Integrated with Arcjet to protect against bot attacks and socket exhaustion.

Heartbeat System: Built-in Ping/Pong mechanism to prune dead connections and maintain server health.

Type-Safe Database: Managed by Drizzle ORM with PostgreSQL.

🛠️ Tech Stack
Runtime: Node.js

WebSocket Library: ws

Database: PostgreSQL + Drizzle ORM

Validation: Zod

Security: Arcjet

📦 Getting Started

1. Prerequisites
   Node.js (v20+ recommended)

PostgreSQL database instance

2. Environment Setup
   Create a .env file in the root directory:

Code snippet

DATABASE_URL=postgres://user:password@localhost:5432/sportz
ARCJET_KEY=aj_your_key_here
PORT=8000 3. Installation
Bash

npm install 4. Database Migration
Bash

npx drizzle-kit push
🔌 WebSocket API
Endpoint: ws://localhost:8000/ws

Client Actions
Subscribe to a Match
Listen for updates for a specific match.

JSON

{
"type": "subscribe",
"matchId": 101
}
Unsubscribe from a Match
JSON

{
"type": "unsubscribe",
"matchId": 101
}
Server Events
matchCreated (Broadcast to all)
JSON

{
"type": "matchCreated",
"data": {
"id": 1,
"sport": "soccer",
"homeTeam": "Arsenal",
"awayTeam": "Manchester City"
}
}
commentaryUpdate (Match subscribers only)
JSON

{
"type": "commentaryUpdate",
"data": {
"minute": 42,
"eventType": "goal",
"message": "GOAL! Powerful finish from the edge of the box."
}
}
🛣️ HTTP API
Create a Match
POST /matches

Payload:

JSON

{
"sport": "soccer",
"homeTeam": "Arsenal",
"awayTeam": "Manchester City",
"status": "scheduled",
"startTime": "2026-02-20T19:00:00.000Z"
}
Add Commentary
POST /matches/:id/commentary

Payload:

JSON

{
"minute": 45,
"period": "1st half",
"eventType": "yellow_card",
"actor": "Bukayo Saka",
"message": "Late challenge results in a booking."
}
🛡️ Security
This project uses Arcjet for connection security.

Rate Limiting: Prevents single IPs from flooding the server with socket connections.

Bot Protection: Detects and blocks automated scrapers.

Fingerprinting: Identifies clients across reconnects to ensure fair usage.

📜 License
MIT
