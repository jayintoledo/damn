import { storage } from "./storage";
import { InsertActivityLog } from "@shared/schema";

// Log types
export type LogType = "webhook" | "buy_order" | "sell_order" | "error" | "system";

// Format current timestamp for logging
const formatTimestamp = (): string => {
  return new Date().toISOString();
};

// Create a logger that writes to console and storage
export const logger = {
  /**
   * Log webhook requests
   */
  webhook: async (message: string, details: any, ipAddress?: string): Promise<void> => {
    const timestamp = formatTimestamp();
    console.log(`[${timestamp}] [WEBHOOK] ${message}`);
    
    const logEntry: InsertActivityLog = {
      type: "webhook",
      message,
      details: JSON.stringify(details),
      timestamp: new Date(),
      ipAddress
    };
    
    await storage.createActivityLog(logEntry);
  },
  
  /**
   * Log buy orders
   */
  buyOrder: async (message: string, orderId: string, orderData: any): Promise<void> => {
    const timestamp = formatTimestamp();
    console.log(`[${timestamp}] [BUY ORDER] ${message} | Order ID: ${orderId}`);
    
    const logEntry: InsertActivityLog = {
      type: "buy_order",
      message,
      details: message,
      timestamp: new Date(),
      orderId,
      orderData: JSON.stringify(orderData)
    };
    
    await storage.createActivityLog(logEntry);
  },
  
  /**
   * Log sell orders
   */
  sellOrder: async (message: string, orderId: string, orderData: any): Promise<void> => {
    const timestamp = formatTimestamp();
    console.log(`[${timestamp}] [SELL ORDER] ${message} | Order ID: ${orderId}`);
    
    const logEntry: InsertActivityLog = {
      type: "sell_order",
      message,
      details: message,
      timestamp: new Date(),
      orderId,
      orderData: JSON.stringify(orderData)
    };
    
    await storage.createActivityLog(logEntry);
  },
  
  /**
   * Log errors
   */
  error: async (message: string, error: any, errorCode?: string): Promise<void> => {
    const timestamp = formatTimestamp();
    console.error(`[${timestamp}] [ERROR] ${message}`, error);
    
    const logEntry: InsertActivityLog = {
      type: "error",
      message,
      details: JSON.stringify(error),
      timestamp: new Date(),
      errorCode
    };
    
    await storage.createActivityLog(logEntry);
  },
  
  /**
   * Log system messages
   */
  system: async (message: string, details?: any): Promise<void> => {
    const timestamp = formatTimestamp();
    console.log(`[${timestamp}] [SYSTEM] ${message}`);
    
    const logEntry: InsertActivityLog = {
      type: "system",
      message,
      details: details ? JSON.stringify(details) : undefined,
      timestamp: new Date()
    };
    
    await storage.createActivityLog(logEntry);
  }
};
