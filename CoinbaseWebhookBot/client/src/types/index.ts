export interface ActivityLog {
  id: number;
  type: string;
  message: string;
  details?: string;
  timestamp: string;
  ipAddress?: string;
  orderData?: string;
  orderId?: string;
  errorCode?: string;
  createdAt: string;
}

export interface Configuration {
  id: number;
  tradingPair: string;
  orderSize: string;
  webhookEndpoint: string;
  testMode: boolean;
  updatedAt: string;
}

export interface WebhookPayload {
  action: "buy" | "sell" | string;
  symbol?: string;
  amount?: number;
  params?: Record<string, any>;
  testMode?: boolean;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  orderId?: string;
  testMode?: boolean;
}

export interface TradingPair {
  id: number;
  symbol: string;
  name: string;
  status: boolean;
  orderSize: string;
  stopLossPercent: string;
  takeProfitPercent: string;
  createdAt: string;
}
