import express from "express";
import { matchRouter } from "./routes/matches.js";
import http from "http";
import { attachWebSocketServer } from "./ws/server.js";
import { securityMiddleware } from "./arcjet.js";
import { commentaryRouter } from "./routes/commentary.js";

const app = express();
const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || "0.0.0.0";
const server = http.createServer(app);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from sportz");
});
app.use(securityMiddleware());
app.use("/matches/:id/commentary", commentaryRouter);
app.use("/matches", matchRouter);
const { broadcastMatchCreated, broadcastCommentaryUpdate } =
  attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;
app.locals.broadcastCommentaryUpdate = broadcastCommentaryUpdate;
server.listen(PORT, HOST, () => {
  const baseUrl =
    HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`HTTP server is running on ${baseUrl}`);
  console.log(
    `Websocket server is running on ${baseUrl.replace("http://", "ws://")}/ws`,
  );
});
