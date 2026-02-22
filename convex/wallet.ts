import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsertSession = mutation({
  args: {
    walletAddress: v.string(),
    hasProfile: v.boolean(),
    cachedElement: v.optional(v.number()),
    cachedLevel: v.optional(v.number()),
    cachedXp: v.optional(v.number()),
    cachedEnergy: v.optional(v.number()),
    cachedLuckyNumber: v.optional(v.number()),
    cachedWinStreak: v.optional(v.number()),
    cachedLastFortune: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("walletSessions")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress.toLowerCase()))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastSeen: Date.now(),
        hasProfile: args.hasProfile,
        cachedElement: args.cachedElement,
        cachedLevel: args.cachedLevel,
        cachedXp: args.cachedXp,
        cachedEnergy: args.cachedEnergy,
        cachedLuckyNumber: args.cachedLuckyNumber,
        cachedWinStreak: args.cachedWinStreak,
        cachedLastFortune: args.cachedLastFortune,
      });
      return existing._id;
    }

    return await ctx.db.insert("walletSessions", {
      walletAddress: args.walletAddress.toLowerCase(),
      lastSeen: Date.now(),
      hasProfile: args.hasProfile,
      cachedElement: args.cachedElement,
      cachedLevel: args.cachedLevel,
      cachedXp: args.cachedXp,
      cachedEnergy: args.cachedEnergy,
      cachedLuckyNumber: args.cachedLuckyNumber,
      cachedWinStreak: args.cachedWinStreak,
      cachedLastFortune: args.cachedLastFortune,
    });
  },
});

export const getSession = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("walletSessions")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress.toLowerCase()))
      .first();
  },
});

export const logActivity = mutation({
  args: {
    walletAddress: v.string(),
    action: v.string(),
    details: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activityLog", {
      walletAddress: args.walletAddress.toLowerCase(),
      action: args.action,
      details: args.details,
      timestamp: Date.now(),
    });
  },
});

export const getRecentActivity = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("activityLog")
      .withIndex("by_time")
      .order("desc")
      .take(20);
  },
});

export const saveMatchResult = mutation({
  args: {
    walletAddress: v.string(),
    matchedWith: v.string(),
    compatibility: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("matchResults", {
      walletAddress: args.walletAddress.toLowerCase(),
      matchedWith: args.matchedWith.toLowerCase(),
      compatibility: args.compatibility,
      timestamp: Date.now(),
    });
  },
});

export const getMatchResults = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("matchResults")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress.toLowerCase()))
      .order("desc")
      .take(10);
  },
});
