import express, { Request, Response } from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { coinbaseClient } from "./coinbase";
import { logger } from "./logger";
import { webhookPayloadSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize system and log startup
  await initializeSystem();
  
  // API routes
  const apiRouter = express.Router();
  
  // Webhook endpoint for receiving trading signals
  apiRouter.post("/webhook", async (req: Request, res: Response) => {
    try {
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      
      // Log the webhook request
      await logger.webhook(
        "Webhook request received", 
        req.body, 
        typeof ipAddress === 'string' ? ipAddress : ipAddress?.[0]
      );
      
      // Validate webhook payload
      const payload = webhookPayloadSchema.parse(req.body);
      
      // Get current configuration
      const config = await storage.getConfiguration();
      
      // Check if testMode is explicitly set in payload, otherwise use config
      const isTestMode = payload.testMode !== undefined ? payload.testMode : config.testMode;
      
      // Determine which trading pair to use
      const symbol = payload.symbol || config.tradingPair;
      
      // Try to get specific trading pair config, fall back to default if not found
      let tradingPair;
      let orderSize;
      
      try {
        tradingPair = await storage.getTradingPair(symbol);
        if (tradingPair && tradingPair.status) {
          orderSize = payload.amount?.toString() || tradingPair.orderSize;
        } else {
          orderSize = payload.amount?.toString() || config.orderSize;
        }
      } catch (error) {
        // If trading pair not found, use default from global config
        orderSize = payload.amount?.toString() || config.orderSize;
      }
      
      if (isTestMode) {
        // In test mode, log but don't execute actual orders
        await logger.system(`Test mode: Simulated ${payload.action.toUpperCase()} order for ${symbol}`);
        
        // Log stop loss and take profit if provided
        if (payload.stopLoss) {
          await logger.system(`Test mode: Stop loss set at ${payload.stopLoss}`);
        }
        
        if (payload.takeProfit) {
          await logger.system(`Test mode: Take profit set at ${payload.takeProfit}`);
        }
        
        return res.status(200).json({
          success: true,
          message: `Test mode: ${payload.action.toUpperCase()} order simulated for ${symbol}`,
          testMode: true,
          details: {
            symbol,
            orderSize,
            price: payload.price,
            stopLoss: payload.stopLoss,
            takeProfit: payload.takeProfit
          }
        });
      }
      
      // Execute the order based on the action
      if (payload.action === "buy") {
        const response = await coinbaseClient.executeMarketOrder(
          symbol,
          "BUY",
          orderSize
        );
        
        // Log the order details including any stop loss or take profit
        const orderDetails = {
          ...response,
          stopLoss: payload.stopLoss,
          takeProfit: payload.takeProfit,
          strategy: {
            enableAdxFilter: config.enableAdxFilter,
            adxThreshold: config.adxThreshold,
            enableVolumeFilter: config.enableVolumeFilter
          }
        };
        
        await logger.buyOrder(
          `BUY Order Executed for ${orderSize} of ${symbol}`,
          response.order_id,
          orderDetails
        );
        
        return res.status(200).json({
          success: true,
          message: "Buy order executed successfully",
          orderId: response.order_id,
          symbol,
          orderSize,
          price: payload.price,
          stopLoss: payload.stopLoss,
          takeProfit: payload.takeProfit
        });
      } else if (payload.action === "sell") {
        const response = await coinbaseClient.executeMarketOrder(
          symbol,
          "SELL",
          orderSize
        );
        
        // Log the order details
        const orderDetails = {
          ...response,
          stopLoss: payload.stopLoss,
          takeProfit: payload.takeProfit,
          strategy: {
            enableAdxFilter: config.enableAdxFilter,
            adxThreshold: config.adxThreshold,
            enableVolumeFilter: config.enableVolumeFilter
          }
        };
        
        await logger.sellOrder(
          `SELL Order Executed for ${orderSize} of ${symbol}`,
          response.order_id,
          orderDetails
        );
        
        return res.status(200).json({
          success: true,
          message: "Sell order executed successfully",
          orderId: response.order_id,
          symbol,
          orderSize,
          price: payload.price,
          stopLoss: payload.stopLoss,
          takeProfit: payload.takeProfit
        });
      }
      
      return res.status(400).json({
        success: false,
        message: "Invalid action specified"
      });
    } catch (error) {
      // Handle validation errors
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        await logger.error("Webhook validation error", validationError);
        
        return res.status(400).json({
          success: false,
          message: "Invalid webhook payload",
          error: validationError.message
        });
      }
      
      // Handle other errors
      await logger.error("Error processing webhook", error);
      
      return res.status(500).json({
        success: false,
        message: "Failed to process webhook request"
      });
    }
  });
  
  // Get configuration
  apiRouter.get("/config", async (req: Request, res: Response) => {
    try {
      const config = await storage.getConfiguration();
      res.status(200).json(config);
    } catch (error) {
      await logger.error("Error fetching configuration", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch configuration"
      });
    }
  });
  
  // Update configuration
  apiRouter.post("/config", async (req: Request, res: Response) => {
    try {
      const config = await storage.updateConfiguration(req.body);
      await logger.system("Configuration updated", config);
      res.status(200).json(config);
    } catch (error) {
      await logger.error("Error updating configuration", error);
      res.status(500).json({
        success: false,
        message: "Failed to update configuration"
      });
    }
  });
  
  // Test connection to Coinbase API
  apiRouter.get("/test-connection", async (req: Request, res: Response) => {
    try {
      // In development mode, simulate a successful connection
      if (process.env.NODE_ENV === 'development') {
        await logger.system("Development mode - simulating successful Coinbase API connection");
        res.status(200).json({
          success: true,
          message: "Connected to Coinbase API successfully (Development Mode)"
        });
        return;
      }
      
      const connected = await coinbaseClient.testConnection();
      if (connected) {
        await logger.system("Coinbase API connection test successful");
        res.status(200).json({
          success: true,
          message: "Connected to Coinbase API successfully"
        });
      } else {
        await logger.error("Coinbase API connection test failed", "Connection failed");
        res.status(500).json({
          success: false,
          message: "Failed to connect to Coinbase API"
        });
      }
    } catch (error) {
      await logger.error("Error testing Coinbase API connection", error);
      res.status(500).json({
        success: false,
        message: "Error testing Coinbase API connection"
      });
    }
  });
  
  // Get activity logs
  apiRouter.get("/logs", async (req: Request, res: Response) => {
    try {
      let { limit = 20, type } = req.query;
      const logs = await storage.getActivityLogs(
        Number(limit),
        typeof type === 'string' ? type : undefined
      );
      res.status(200).json(logs);
    } catch (error) {
      await logger.error("Error fetching activity logs", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch activity logs"
      });
    }
  });
  
  // Clear logs
  apiRouter.post("/logs/clear", async (req: Request, res: Response) => {
    try {
      await storage.clearActivityLogs();
      await logger.system("Activity logs cleared");
      res.status(200).json({
        success: true,
        message: "Activity logs cleared successfully"
      });
    } catch (error) {
      await logger.error("Error clearing activity logs", error);
      res.status(500).json({
        success: false,
        message: "Failed to clear activity logs"
      });
    }
  });
  
  // Trading Pairs endpoints
  apiRouter.get("/trading-pairs", async (req: Request, res: Response) => {
    try {
      const pairs = await storage.getTradingPairs();
      res.status(200).json(pairs);
    } catch (error) {
      await logger.error("Failed to get trading pairs", error);
      res.status(500).json({ success: false, message: "Failed to get trading pairs" });
    }
  });
  
  apiRouter.get("/trading-pairs/:symbol", async (req: Request, res: Response) => {
    try {
      const { symbol } = req.params;
      const pair = await storage.getTradingPair(symbol);
      
      if (!pair) {
        return res.status(404).json({ success: false, message: `Trading pair ${symbol} not found` });
      }
      
      res.status(200).json(pair);
    } catch (error) {
      await logger.error(`Failed to get trading pair ${req.params.symbol}`, error);
      res.status(500).json({ success: false, message: "Failed to get trading pair" });
    }
  });
  
  apiRouter.post("/trading-pairs", async (req: Request, res: Response) => {
    try {
      const pair = await storage.createTradingPair(req.body);
      await logger.system(`Created new trading pair: ${pair.symbol}`);
      res.status(201).json(pair);
    } catch (error) {
      await logger.error("Failed to create trading pair", error);
      res.status(500).json({ success: false, message: "Failed to create trading pair" });
    }
  });
  
  apiRouter.put("/trading-pairs/:symbol", async (req: Request, res: Response) => {
    try {
      const { symbol } = req.params;
      const pair = await storage.updateTradingPair(symbol, req.body);
      await logger.system(`Updated trading pair: ${pair.symbol}`);
      res.status(200).json(pair);
    } catch (error) {
      await logger.error(`Failed to update trading pair ${req.params.symbol}`, error);
      res.status(500).json({ success: false, message: "Failed to update trading pair" });
    }
  });
  
  apiRouter.delete("/trading-pairs/:symbol", async (req: Request, res: Response) => {
    try {
      const { symbol } = req.params;
      await storage.deleteTradingPair(symbol);
      await logger.system(`Deleted trading pair: ${symbol}`);
      res.status(200).json({ success: true, message: `Trading pair ${symbol} deleted` });
    } catch (error) {
      await logger.error(`Failed to delete trading pair ${req.params.symbol}`, error);
      res.status(500).json({ success: false, message: "Failed to delete trading pair" });
    }
  });
  
  // Strategy configuration endpoint
  apiRouter.get("/strategy", async (req: Request, res: Response) => {
    try {
      const config = await storage.getConfiguration();
      
      // Extract only the strategy-specific parameters
      const strategyConfig = {
        enableAdxFilter: config.enableAdxFilter,
        adxThreshold: config.adxThreshold,
        enableVolumeFilter: config.enableVolumeFilter,
        stopLossPercent: config.stopLossPercent,
        takeProfitPercent: config.takeProfitPercent,
        trailingStopPercent: config.trailingStopPercent,
        enableTrailingStop: config.enableTrailingStop
      };
      
      res.status(200).json(strategyConfig);
    } catch (error) {
      await logger.error("Failed to get strategy configuration", error);
      res.status(500).json({ success: false, message: "Failed to get strategy configuration" });
    }
  });
  
  apiRouter.post("/strategy", async (req: Request, res: Response) => {
    try {
      const config = await storage.updateConfiguration(req.body);
      await logger.system("Updated strategy configuration");
      
      // Extract only the strategy-specific parameters for the response
      const strategyConfig = {
        enableAdxFilter: config.enableAdxFilter,
        adxThreshold: config.adxThreshold,
        enableVolumeFilter: config.enableVolumeFilter,
        stopLossPercent: config.stopLossPercent,
        takeProfitPercent: config.takeProfitPercent,
        trailingStopPercent: config.trailingStopPercent,
        enableTrailingStop: config.enableTrailingStop
      };
      
      res.status(200).json(strategyConfig);
    } catch (error) {
      await logger.error("Failed to update strategy configuration", error);
      res.status(500).json({ success: false, message: "Failed to update strategy configuration" });
    }
  });
  
  // Register all API routes with /api prefix
  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  return httpServer;
}

async function initializeSystem() {
  try {
    // Create default configuration if it doesn't exist
    const config = await storage.getConfiguration();
    
    // In development mode, skip the actual API connection test
    if (process.env.NODE_ENV === 'development') {
      await logger.system("Bot started - Development mode simulating Coinbase API connection");
      return;
    }
    
    // Test Coinbase API connection
    const connected = await coinbaseClient.testConnection();
    if (connected) {
      await logger.system("Bot started - Connected to Coinbase API");
    } else {
      await logger.error(
        "Bot started - Failed to connect to Coinbase API", 
        "Check API key and network connection"
      );
    }
  } catch (error) {
    await logger.error("Error initializing system", error);
  }
}
