import { z } from "zod";

// Schema for listing/querying commentary (e.g., GET /matches/:id/commentary?limit=50)
export const listCommentaryQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int("Limit must be an integer")
    .positive("Limit must be greater than 0")
    .max(100, "Maximum limit is 100")
    .optional(),
});

// Schema for creating a new commentary event (e.g., POST /matches/:id/commentary)
export const createCommentarySchema = z.object({
  minute: z
    .number()
    .int("Minute must be an integer")
    .nonnegative("Minute cannot be negative"),

  sequence: z
    .number()
    .int()
    .nonnegative("Sequence must be a non-negative integer"),

  period: z
    .string()
    .trim()
    .min(1, "Period is required (e.g., '1H', '2H', 'Q1')"),

  eventType: z
    .string()
    .trim()
    .min(1, "Event type is required (e.g., 'GOAL', 'FOUL')"),

  // Actor and team are optional since some commentary (like "Half-time whistle")
  // doesn't belong to a specific player or team.
  actor: z.string().trim().optional(),
  team: z.string().trim().optional(),

  message: z.string().trim().min(1, "Commentary message is required"),

  // Record allows a flexible key-value pair object for extra data (e.g., { varChecked: true })
  metadata: z.record(z.string(), z.unknown()).optional(),

  // Array of strings for filtering or UI badges
  tags: z.array(z.string().trim()).optional(),
});
