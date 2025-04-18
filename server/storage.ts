import {
  users, type User, type InsertUser,
  activityLogs, type ActivityLog, type InsertActivityLog,
  configurations, type Configuration, type InsertConfiguration,
  tradingPairs, type TradingPair, type InsertTradingPair
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Activity log methods
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(limit?: number, type?: string): Promise<ActivityLog[]>;
  clearActivityLogs(): Promise<void>;
  
  // Configuration methods
  getConfiguration(): Promise<Configuration>;
  updateConfiguration(config: Partial<Configuration>): Promise<Configuration>;
  
  // Trading pairs methods
  getTradingPairs(): Promise<TradingPair[]>;
  getTradingPair(symbol: string): Promise<TradingPair | undefined>;
  createTradingPair(pair: InsertTradingPair): Promise<TradingPair>;
  updateTradingPair(symbol: string, pair: Partial<TradingPair>): Promise<TradingPair>;
  deleteTradingPair(symbol: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private activityLogs: ActivityLog[];
  private configuration: Configuration;
  private tradingPairs: Map<string, TradingPair>;
  private currentUserId: number;
  private currentLogId: number;
  private currentTradingPairId: number;
  
  constructor() {
    this.users = new Map();
    this.activityLogs = [];
    this.tradingPairs = new Map();
    this.currentUserId = 1;
    this.currentLogId = 1;
    this.currentTradingPairId = 1;
    
    // Initialize with default configuration
    this.configuration = {
      id: 1,
      tradingPair: "BTC-USD",
      orderSize: "0.01",
      webhookEndpoint: "/webhook",
      testMode: true,
      enableAdxFilter: true,
      adxThreshold: 20,
      enableVolumeFilter: true,
      stopLossPercent: "2.0",
      takeProfitPercent: "3.0",
      trailingStopPercent: "1.5",
      enableTrailingStop: true,
      updatedAt: new Date()
    };
    
    // Initialize with default trading pairs
    this.initDefaultTradingPairs();
  }
  
  private initDefaultTradingPairs() {
    const defaultPairs = [
      {
        id: this.currentTradingPairId++,
        symbol: "BTC-USD",
        name: "Bitcoin",
        status: true,
        orderSize: "0.01",
        stopLossPercent: "2.0",
        takeProfitPercent: "3.0",
        createdAt: new Date()
      },
      {
        id: this.currentTradingPairId++,
        symbol: "ETH-USD",
        name: "Ethereum",
        status: true,
        orderSize: "0.1",
        stopLossPercent: "2.5",
        takeProfitPercent: "4.0",
        createdAt: new Date()
      },
      {
        id: this.currentTradingPairId++,
        symbol: "SOL-USD",
        name: "Solana",
        status: true,
        orderSize: "1.0",
        stopLossPercent: "3.0",
        takeProfitPercent: "5.0",
        createdAt: new Date()
      },
      {
        id: this.currentTradingPairId++,
        symbol: "DOGE-USD",
        name: "Dogecoin",
        status: true,
        orderSize: "100",
        stopLossPercent: "4.0",
        takeProfitPercent: "6.0",
        createdAt: new Date()
      },
      {
        id: this.currentTradingPairId++,
        symbol: "AIOC-USD",
        name: "AI Open Compute",
        status: true,
        orderSize: "50",
        stopLossPercent: "2.5",
        takeProfitPercent: "5.0",
        createdAt: new Date()
      }
    ];
    
    for (const pair of defaultPairs) {
      this.tradingPairs.set(pair.symbol, pair);
    }
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Activity log methods
  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const id = this.currentLogId++;
    const createdAt = new Date();
    const timestamp = log.timestamp || createdAt;
    
    const activityLog: ActivityLog = {
      id,
      message: log.message,
      type: log.type,
      details: log.details || null,
      timestamp: timestamp,
      ipAddress: log.ipAddress || null,
      orderData: log.orderData || null,
      orderId: log.orderId || null,
      errorCode: log.errorCode || null,
      createdAt
    };
    
    this.activityLogs.unshift(activityLog); // Add to the beginning to maintain reverse chronological order
    return activityLog;
  }
  
  async getActivityLogs(limit: number = 100, type?: string): Promise<ActivityLog[]> {
    let logs = [...this.activityLogs];
    
    if (type) {
      logs = logs.filter(log => log.type === type);
    }
    
    return logs.slice(0, limit);
  }
  
  async clearActivityLogs(): Promise<void> {
    this.activityLogs = [];
  }
  
  // Configuration methods
  async getConfiguration(): Promise<Configuration> {
    return { ...this.configuration };
  }
  
  async updateConfiguration(config: Partial<Configuration>): Promise<Configuration> {
    this.configuration = {
      ...this.configuration,
      ...config,
      updatedAt: new Date()
    };
    
    return { ...this.configuration };
  }
  
  // Trading pairs methods
  async getTradingPairs(): Promise<TradingPair[]> {
    return Array.from(this.tradingPairs.values());
  }
  
  async getTradingPair(symbol: string): Promise<TradingPair | undefined> {
    return this.tradingPairs.get(symbol);
  }
  
  async createTradingPair(pair: InsertTradingPair): Promise<TradingPair> {
    const id = this.currentTradingPairId++;
    const newPair: TradingPair = {
      id,
      symbol: pair.symbol,
      name: pair.name,
      status: pair.status ?? true,
      orderSize: pair.orderSize,
      stopLossPercent: pair.stopLossPercent || "2.0",
      takeProfitPercent: pair.takeProfitPercent || "3.0",
      createdAt: new Date()
    };
    
    this.tradingPairs.set(pair.symbol, newPair);
    return { ...newPair };
  }
  
  async updateTradingPair(symbol: string, updates: Partial<TradingPair>): Promise<TradingPair> {
    const pair = this.tradingPairs.get(symbol);
    
    if (!pair) {
      throw new Error(`Trading pair ${symbol} not found`);
    }
    
    const updatedPair: TradingPair = {
      ...pair,
      ...updates,
      // Ensure these fields cannot be modified
      id: pair.id,
      symbol: pair.symbol,
      createdAt: pair.createdAt
    };
    
    this.tradingPairs.set(symbol, updatedPair);
    return { ...updatedPair };
  }
  
  async deleteTradingPair(symbol: string): Promise<void> {
    if (!this.tradingPairs.has(symbol)) {
      throw new Error(`Trading pair ${symbol} not found`);
    }
    
    this.tradingPairs.delete(symbol);
  }
}

export const storage = new MemStorage();
