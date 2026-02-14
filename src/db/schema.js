import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  pgEnum,
  jsonb,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Define the Match Status Enum
// This ensures data integrity for the match lifecycle.
export const matchStatusEnum = pgEnum("match_status", [
  "scheduled",
  "live",
  "finished",
]);

// 2. Matches Table
// Tracks the high-level state of every fixture.
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  sport: varchar("sport", { length: 50 }).notNull(), // e.g., 'soccer', 'basketball'
  homeTeam: varchar("home_team", { length: 255 }).notNull(),
  awayTeam: varchar("away_team", { length: 255 }).notNull(),
  status: matchStatusEnum("status").default("scheduled").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  homeScore: integer("home_score").default(0).notNull(),
  awayScore: integer("away_score").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Commentary Table
// Designed for high-frequency inserts and rich-text event descriptions.
export const commentary = pgTable("commentary", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id")
    .references(() => matches.id, { onDelete: "cascade" })
    .notNull(),
  minute: integer("minute"), // Current game minute
  sequence: integer("sequence").notNull(), // To ensure correct order within the same minute
  period: varchar("period", { length: 50 }), // e.g., '1st Half', 'Quarter 3'
  eventType: varchar("event_type", { length: 100 }), // e.g., 'goal', 'foul', 'substitution'
  actor: varchar("actor", { length: 255 }), // Player name or official involved
  team: varchar("team", { length: 255 }), // Team associated with the event
  message: text("message").notNull(), // The actual commentary text
  metadata: jsonb("metadata"), // Sport-specific data (e.g., coordinates, impact stats)
  tags: text("tags").array(), // Searchable tags like ['highlight', 'var']
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Relations (Drizzle-specific)
// This enables easy joining: db.query.matches.findMany({ with: { commentary: true } })
export const matchesRelations = relations(matches, ({ many }) => ({
  commentaries: many(commentary),
}));

export const commentaryRelations = relations(commentary, ({ one }) => ({
  match: one(matches, {
    fields: [commentary.matchId],
    references: [matches.id],
  }),
}));
