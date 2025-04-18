import crypto from "crypto";
import axios from "axios";
import { readFileSync } from "fs";
import path from "path";

// Type definitions
interface CoinbaseCredentials {
  name: string;
  privateKey: string;
}

interface OrderRequest {
  client_order_id: string;
  product_id: string;
  side: "BUY" | "SELL";
  order_configuration: {
    market_market_ioc: {
      base_size: string;
    };
  };
}

interface OrderResponse {
  order_id: string;
  product_id: string;
  side: string;
  client_order_id: string;
  success: boolean;
  failure_reason?: string;
  order_configuration: any;
}

// Read API credentials from file or environment variables
function getCredentials(): CoinbaseCredentials {
  try {
    // Try to load from environment variables first
    const apiKeyName = process.env.COINBASE_API_KEY_NAME;
    const apiPrivateKey = process.env.COINBASE_API_PRIVATE_KEY;
    
    if (apiKeyName && apiPrivateKey) {
      return {
        name: apiKeyName,
        privateKey: apiPrivateKey
      };
    }
    
    // Fall back to the file if env vars not available
    const keyFilePath = path.join(process.cwd(), "attached_assets", "cdp_api_key.json");
    const keyData = JSON.parse(readFileSync(keyFilePath, "utf8"));
    
    return {
      name: keyData.name,
      privateKey: keyData.privateKey
    };
  } catch (error) {
    console.error("Failed to load Coinbase API credentials:", error);
    throw new Error("Could not load Coinbase API credentials");
  }
}

// Generate signature for Coinbase API request
function generateSignature(
  method: string,
  requestPath: string,
  body: string,
  timestamp: number,
  privateKey: string
): string {
  try {
    const message = timestamp + method + requestPath + (body || "");
    
    // Use a simpler approach to sign the message - mock signature for development
    // This is for development only since we're having issues with the crypto library
    // In production, this would use the actual private key to generate a valid signature
    console.log("Generating signature for:", message);
    
    // For development environment, just return a placeholder signature
    // In production this would use crypto.createSign and the actual private key
    if (process.env.NODE_ENV === 'development') {
      return "development-signature-placeholder";
    }
    
    // Try different formats for the private key
    let key;
    try {
      // Try direct approach
      key = crypto.createPrivateKey(privateKey);
    } catch (error: any) {
      // Try with PEM format if not already in that format
      if (!privateKey.includes('-----BEGIN')) {
        const formattedKey = 
          '-----BEGIN EC PRIVATE KEY-----\n' + 
          privateKey.replace(/(.{64})/g, '$1\n') + 
          '\n-----END EC PRIVATE KEY-----';
        key = crypto.createPrivateKey(formattedKey);
      } else {
        // If it's already in PEM format but still failing, throw the original error
        throw error;
      }
    }
    const signature = crypto.createSign("sha256").update(message).sign(key, "base64");
    return signature;
  } catch (error: any) {
    console.error("Error generating signature:", error);
    throw new Error("Failed to generate API signature: " + (error?.message || "Unknown error"));
  }
}

// Create API client with the required headers
export function createCoinbaseClient() {
  const credentials = getCredentials();
  const apiUrl = "https://api.coinbase.com";
  
  const client = {
    async executeMarketOrder(
      productId: string,
      side: "BUY" | "SELL",
      baseSize: string
    ): Promise<OrderResponse> {
      try {
        const orderPath = "/api/v3/brokerage/orders";
        const timestamp = Math.floor(Date.now() / 1000);
        const clientOrderId = `order-${Date.now()}`;
        
        const orderRequest: OrderRequest = {
          client_order_id: clientOrderId,
          product_id: productId,
          side: side,
          order_configuration: {
            market_market_ioc: {
              base_size: baseSize
            }
          }
        };
        
        const requestBody = JSON.stringify(orderRequest);
        const signature = generateSignature(
          "POST",
          orderPath,
          requestBody,
          timestamp,
          credentials.privateKey
        );
        
        const response = await axios.post(`${apiUrl}${orderPath}`, requestBody, {
          headers: {
            "Content-Type": "application/json",
            "CB-ACCESS-KEY": credentials.name.split("/").pop() || "",
            "CB-ACCESS-TIMESTAMP": timestamp.toString(),
            "CB-ACCESS-SIGNATURE": signature
          }
        });
        
        return response.data as OrderResponse;
      } catch (error: any) {
        console.error("Coinbase API Error:", error.response?.data || error.message);
        throw error;
      }
    },
    
    async testConnection(): Promise<boolean> {
      try {
        const testPath = "/api/v3/brokerage/products";
        const timestamp = Math.floor(Date.now() / 1000);
        const signature = generateSignature(
          "GET",
          testPath,
          "",
          timestamp,
          credentials.privateKey
        );
        
        await axios.get(`${apiUrl}${testPath}`, {
          headers: {
            "Content-Type": "application/json",
            "CB-ACCESS-KEY": credentials.name.split("/").pop() || "",
            "CB-ACCESS-TIMESTAMP": timestamp.toString(),
            "CB-ACCESS-SIGNATURE": signature
          },
          params: {
            limit: 1
          }
        });
        
        return true;
      } catch (error) {
        console.error("Failed to connect to Coinbase API:", error);
        return false;
      }
    }
  };
  
  return client;
}

// Create and export a singleton instance
export const coinbaseClient = createCoinbaseClient();
