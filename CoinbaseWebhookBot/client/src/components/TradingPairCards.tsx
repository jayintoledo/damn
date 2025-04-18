import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { TradingPair } from '@/types';
import PriceChart from './PriceChart';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ArrowUp, 
  ArrowDown,
  DollarSign,
  Percent
} from 'lucide-react';

// Simulated price data (in a real app, this would come from an API)
const MOCK_PRICES = {
  'BTC-USD': { 
    price: 64789.50, 
    change: 2.3, 
    high24h: 65100.20, 
    low24h: 63200.75 
  },
  'ETH-USD': { 
    price: 3182.75, 
    change: -0.8, 
    high24h: 3250.60, 
    low24h: 3140.25 
  },
  'SOL-USD': { 
    price: 142.65, 
    change: 5.2, 
    high24h: 145.30, 
    low24h: 135.20 
  },
  'DOGE-USD': { 
    price: 0.1585, 
    change: -1.9, 
    high24h: 0.1620, 
    low24h: 0.1547 
  },
  'AIOC-USD': { 
    price: 12.87, 
    change: 8.4, 
    high24h: 13.25, 
    low24h: 11.76 
  }
};

interface TradingPairCardProps {
  pair: TradingPair;
}

const TradingPairCard: React.FC<TradingPairCardProps> = ({ pair }) => {
  // In a real app, this would be real data from an API
  const priceData = MOCK_PRICES[pair.symbol as keyof typeof MOCK_PRICES] || {
    price: 0,
    change: 0,
    high24h: 0,
    low24h: 0
  };

  const isPositiveChange = priceData.change > 0;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold">{pair.symbol}</h3>
                <Badge variant={pair.status ? "default" : "outline"}>
                  {pair.status ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">{pair.name}</p>
            </div>
            
            <div className="flex items-center">
              {isPositiveChange ? (
                <TrendingUp className="h-5 w-5 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500 mr-1" />
              )}
              <span 
                className={`text-sm font-semibold ${
                  isPositiveChange ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {isPositiveChange ? '+' : ''}{priceData.change}%
              </span>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-bold">
                ${typeof priceData.price === 'number' ? priceData.price.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 8
                }) : priceData.price}
              </span>
              <div className="flex flex-col items-end">
                <div className="flex items-center text-xs text-gray-500">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  <span>24h High: ${priceData.high24h.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 8
                  })}</span>
                </div>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <ArrowDown className="h-3 w-3 mr-1" />
                  <span>24h Low: ${priceData.low24h.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 8
                  })}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="bg-gray-100 p-2 rounded">
              <div className="flex items-center text-xs text-gray-500">
                <DollarSign className="h-3 w-3 mr-1" />
                <span>Order Size</span>
              </div>
              <div className="font-medium">{pair.orderSize}</div>
            </div>
            
            <div className="bg-gray-100 p-2 rounded">
              <div className="flex items-center text-xs text-gray-500">
                <AlertTriangle className="h-3 w-3 mr-1" />
                <span>Risk Management</span>
              </div>
              <div className="font-medium">SL: {pair.stopLossPercent}%</div>
            </div>
            
            <div className="bg-gray-100 p-2 rounded">
              <div className="flex items-center text-xs text-gray-500">
                <Percent className="h-3 w-3 mr-1" />
                <span>TP Level</span>
              </div>
              <div className="font-medium">{pair.takeProfitPercent}%</div>
            </div>
            
            <div className="bg-gray-100 p-2 rounded">
              <div className="flex items-center text-xs text-gray-500">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>Potential Return</span>
              </div>
              <div className="font-medium">
                ${(parseFloat(pair.orderSize) * priceData.price * parseFloat(pair.takeProfitPercent) / 100).toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Price Chart */}
      <PriceChart 
        symbol={pair.symbol}
        currentPrice={priceData.price}
        change={priceData.change}
        height={240}
      />
    </div>
  );
};

const TradingPairCards: React.FC = () => {
  const { data: tradingPairs, isLoading } = useQuery<TradingPair[]>({
    queryKey: ['/api/trading-pairs'],
  });
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 animate-pulse rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-200 animate-pulse rounded mb-4 w-1/2"></div>
                <div className="h-10 bg-gray-200 animate-pulse rounded mb-4"></div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-12 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-12 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-12 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-12 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 animate-pulse rounded mb-2 w-1/3"></div>
                <div className="h-[200px] bg-gray-200 animate-pulse rounded"></div>
                <div className="h-6 bg-gray-200 animate-pulse rounded mt-2 w-1/4 mx-auto"></div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6">
      {tradingPairs && tradingPairs.map((pair) => (
        <TradingPairCard key={pair.symbol} pair={pair} />
      ))}
    </div>
  );
};

export default TradingPairCards;