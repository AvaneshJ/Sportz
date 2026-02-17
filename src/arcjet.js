import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node";

const arcjet_key = process.env.ARCJET_KEY;
const arcjet_mode = process.env.ARCJET_MODE === "DRY_RUN" ? "DRY_RUN" : "LIVE";
if (!arcjet_key) {
  throw new Error("ARCJET_KEY is not set in environment variables");
}

export const httpArcjet = arcjet_key
  ? arcjet({
      key: arcjet_key,
      rules: [
        shield({ mode: arcjet_mode }),
        detectBot({
          mode: arcjet_mode,
          allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
        }),
        slidingWindow({ mode: arcjet_mode, interval: "10s", max: 50 }),
      ],
    })
  : null;
export const wsArcjet = arcjet_key
  ? arcjet({
      key: arcjet_key,
      rules: [
        shield({ mode: arcjet_mode }),
        detectBot({
          mode: arcjet_mode,
          allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
        }),
        slidingWindow({ mode: arcjet_mode, interval: "2s", max: 5 }),
      ],
    })
  : null;

export function securityMiddleware() {
  return async (req, res, next) => {
    if (!httpArcjet) {
      return next();
    }
    try {
      const decision = await httpArcjet.protect(req);
      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          return res.status(429).json({ error: "Too Many Requests" });
        }
        return res.status(403).json({ error: "Forbidden" });
      }
    } catch (error) {
      console.log("Arcjet error:", error);
      return res.status(503).json({ error: "Service Unavailable" });
    }
    next();
  };
}
