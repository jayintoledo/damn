import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Original user schema - not modified
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Activity logs for webhook requests and trading activity
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'webhook', 'buy_order', 'sell_order', 'error', 'system'
  message: text("message").notNull(),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  orderData: text("order_data"),
  orderId: text("order_id"),
  errorCode: text("error_code"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

// Configuration settings
export const configurations = pgTable("configurations", {
  id: serial("id").primaryKey(),
  tradingPair: text("trading_pair").notNull().default("BTC-USD"),
  orderSize: text("order_size").notNull().default("0.01"),
  webhookEndpoint: text("webhook_endpoint").notNull().default("/webhook"),
  testMode: boolean("test_mode").notNull().default(true),
  enableAdxFilter: boolean("enable_adx_filter").notNull().default(true),
  adxThreshold: integer("adx_threshold").notNull().default(20),
  enableVolumeFilter: boolean("enable_volume_filter").notNull().default(true),
  stopLossPercent: text("stop_loss_percent").notNull().default("2.0"),
  takeProfitPercent: text("take_profit_percent").notNull().default("3.0"),
  trailingStopPercent: text("trailing_stop_percent").notNull().default("1.5"),
  enableTrailingStop: boolean("enable_trailing_stop").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertConfigurationSchema = createInsertSchema(configurations).omit({
  id: true,
  updatedAt: true,
});

export type InsertConfiguration = z.infer<typeof insertConfigurationSchema>;
export type Configuration = typeof configurations.$inferSelect;

// Trading pairs support
export const tradingPairs = pgTable("trading_pairs", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  status: boolean("status").notNull().default(true),
  orderSize: text("order_size").notNull(),
  stopLossPercent: text("stop_loss_percent").notNull().default("2.0"),
  takeProfitPercent: text("take_profit_percent").notNull().default("3.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTradingPairSchema = createInsertSchema(tradingPairs).omit({
  id: true,
  createdAt: true,
});

export type InsertTradingPair = z.infer<typeof insertTradingPairSchema>;
export type TradingPair = typeof tradingPairs.$inferSelect;

// Define webhook payload schema
export const webhookPayloadSchema = z.object({
  action: z.enum(["buy", "sell"]),
  symbol: z.string().default("BTC-USD"),
  amount: z.number().optional(),
  price: z.number().optional(),
  stopLoss: z.number().optional(),
  takeProfit: z.number().optional(),
  params: z.record(z.any()).optional(),
  testMode: z.boolean().optional(),
});

export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;
