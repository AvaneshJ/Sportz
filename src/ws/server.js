import { WebSocket, WebSocketServer } from "ws";

function sendJson(socket, payload) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  } else {
    return;
  }
}

function broadcast(wss, payload) {
  const message = JSON.stringify(payload);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    } else {
      return;
      client.send(message);
    }
  }
}

export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
    maxPayload: 1024 * 1024, // 1MB
  });
  wss.on("connection", (socket) => {
    sendJson(socket, {
      type: "welcome",
      message: "Welcome to the WebSocket server!",
    });
    socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });
  function broadcastMatchCreated(match) {
    broadcast(wss, {
      type: "matchCreated",
      data: match,
    });
  }
  return { broadcastMatchCreated };
}
