import { WebSocket, WebSocketServer } from "ws";
import { wsArcjet } from "../arcjet.js";

// Helper for single socket
function sendJson(socket, payload) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
}

// Fixed Broadcast: Sends to everyone
function broadcast(wss, payload) {
  const message = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
  });

  wss.on("connection", async (socket, req) => {
    if (wsArcjet) {
      try {
        const decision = await wsArcjet.protect(req);
        if (decision.isDenied()) {
          const code = decision.reason.isRateLimit() ? 1013 : 1008;
          const reason = decision.reason.isRateLimit()
            ? "Rate limit exceeded"
            : "Forbidden";
          socket.close(code, reason);
          return;
        }
      } catch (error) {
        console.error("Ws connection error", error);
        socket.close(1011, "Internal error");
        return;
      }
    }
    socket.isAlive = true;
    socket.on("pong", () => (socket.isAlive = true));

    sendJson(socket, { message: "Welcome to the Sportz WebSocket server!" });
    socket.on("error", console.error);
  });

  const interval = setInterval(() => {
    wss.clients.forEach((socket) => {
      if (!socket.isAlive) return socket.terminate();
      socket.isAlive = false;
      socket.ping();
    });
  }, 30000);

  wss.on("close", () => clearInterval(interval));

  // RETURN this function so the rest of your app can use it!
  function broadcastMatchCreated(match) {
    broadcast(wss, { type: "matchCreated", data: match });
  }
  return { broadcastMatchCreated };
}
