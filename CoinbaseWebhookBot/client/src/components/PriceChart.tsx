import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

interface PricePoint {
  time: string;
  price: number;
}

// Generate simulated historical data for each trading pair
const generateHistoricalData = (
  currentPrice: number, 
  volatility: number, 
  dataPoints: number
): PricePoint[] => {
  const data: PricePoint[] = [];
  let price = currentPrice;
  
  // Generate data points for the last 24 hours (hourly data)
  for (let i = dataPoints; i >= 0; i--) {
    // Random price movement based on volatility
    const change = (Math.random() - 0.5) * volatility * currentPrice / 100;
    price = price + change;
    
    // Calculate the time X hours ago
    const date = new Date();
    date.setHours(date.getHours() - i);
    
    data.push({
      time: i === 0 ? 'Now' : `${date.getHours()}:00`,
      price: Number(price.toFixed(2))
    });
  }
  
  return data;
};

const HISTORICAL_DATA: Record<string, PricePoint[]> = {
  'BTC-USD': generateHistoricalData(64789.50, 0.5, 24),
  'ETH-USD': generateHistoricalData(3182.75, 0.7, 24),
  'SOL-USD': generateHistoricalData(142.65, 1.2, 24),
  'DOGE-USD': generateHistoricalData(0.1585, 2.0, 24),
  'AIOC-USD': generateHistoricalData(12.87, 1.5, 24)
};

interface PriceChartProps {
  symbol: string;
  currentPrice: number;
  change: number;
  height?: number;
}

const PriceChart: React.FC<PriceChartProps> = ({ 
  symbol, 
  currentPrice, 
  change,
  height = 200
}) => {
  const data = HISTORICAL_DATA[symbol] || [];
  const positiveChange = change >= 0;
  const lineColor = positiveChange ? '#10b981' : '#ef4444';
  
  // Find min and max for y-axis domain (with some padding)
  const prices = data.map(point => point.price);
  const minPrice = Math.min(...prices) * 0.998;
  const maxPrice = Math.max(...prices) * 1.002;
  
  // Custom tooltip to display price
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded text-xs">
          <p className="font-medium">{`${payload[0].payload.time}`}</p>
          <p className="text-gray-700">{`Price: $${payload[0].value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 8
          })}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="mb-2 flex justify-between items-center">
          <span className="text-sm text-gray-500">Price Chart (24h)</span>
          <span className={`text-xs font-medium ${positiveChange ? 'text-green-500' : 'text-red-500'}`}>
            {positiveChange ? '+' : ''}{change}%
          </span>
        </div>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={[minPrice, maxPrice]} 
              hide={true}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={data[0]?.price} stroke="#9ca3af" strokeDasharray="3 3" />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke={lineColor} 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-2 text-center">
          <span className="text-lg font-bold">
            ${currentPrice.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 8
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceChart;