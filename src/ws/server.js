import { WebSocket, WebSocketServer } from "ws";
import { wsArcjet } from "../arcjet.js";

const matchSubscriber = new Map();

function subscribe(socket, matchId) {
  if (!matchSubscriber.has(matchId)) {
    matchSubscriber.set(matchId, new Set());
  }
  matchSubscriber.get(matchId).add(socket);
}

function unsubscribe(socket, matchId) {
  const subscribers = matchSubscriber.get(matchId);
  if (!subscribers) return;
  subscribers.delete(socket);
  if (subscribers.size === 0) return matchSubscriber.delete(matchId);
}

function cleanUpSubscriptions(socket) {
  for (const matchId of socket.subscriptions) {
    unsubscribe(socket, matchId);
  }
}

function broadcastToMatch(matchId, payload) {
  const subscribers = matchSubscriber.get(matchId);
  if (!subscribers || subscribers.size == 0) return;
  const message = JSON.stringify(payload);
  for (const client of subscribers) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

function handleMessage(socket, data) {
  let message;
  try {
    message = JSON.parse(data.toString());
  } catch (error) {
    sendJson(socket, { error: "Invalid message format" });
  }
  if (message?.type === "subscribe" && Number.isInteger(message.matchId)) {
    subscribe(socket, message.matchId);
    socket.subscriptions.add(message.matchId);
    sendJson(socket, { type: "subscribed", matchId: message.matchId });
    return;
  }
  if (message?.type === "unsubscribe" && Number.isInteger(message.matchId)) {
    unsubscribe(socket, message.matchId);
    socket.subscriptions.delete(message.matchId);
    sendJson(socket, { type: "unsubscribed", matchId: message.matchId });
    return;
  }
}
// Helper for single socket
function sendJson(socket, payload) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
}

// Fixed Broadcast: Sends to everyone
function broadcastToAll(wss, payload) {
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
    socket.subscriptions = new Set();
    sendJson(socket, { message: "Welcome to the Sportz WebSocket server!" });
    socket.on("message", (data) => handleMessage(socket, data));
    socket.on("error", () => {
      socket.terminate();
    });
    socket.on("close", () => {
      cleanUpSubscriptions(socket);
    });
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
    broadcastToAll(wss, { type: "matchCreated", data: match });
  }
  function broadcastCommentaryUpdate(matchId, commentary) {
    broadcastToMatch(matchId, { type: "commentaryUpdate", data: commentary });
  }
  return { broadcastMatchCreated, broadcastCommentaryUpdate };
}
