import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  // Store wallet sessions and cached profile data
  walletSessions: defineTable({
    walletAddress: v.string(),
    lastSeen: v.number(),
    cachedElement: v.optional(v.number()),
    cachedLevel: v.optional(v.number()),
    cachedXp: v.optional(v.number()),
    cachedEnergy: v.optional(v.number()),
    cachedLuckyNumber: v.optional(v.number()),
    cachedWinStreak: v.optional(v.number()),
    cachedLastFortune: v.optional(v.number()),
    hasProfile: v.boolean(),
  }).index("by_wallet", ["walletAddress"]),

  // Store match results for display
  matchResults: defineTable({
    walletAddress: v.string(),
    matchedWith: v.string(),
    compatibility: v.number(),
    timestamp: v.number(),
  }).index("by_wallet", ["walletAddress"]),

  // Activity log for real-time updates
  activityLog: defineTable({
    walletAddress: v.string(),
    action: v.string(),
    details: v.string(),
    timestamp: v.number(),
  }).index("by_wallet", ["walletAddress"]).index("by_time", ["timestamp"]),
});
