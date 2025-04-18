import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Configuration } from '@/types';

interface ConfigurationPanelProps {
  config?: Configuration;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ config }) => {
  const [orderSize, setOrderSize] = useState<string>("0.01");
  const [tradingPair, setTradingPair] = useState<string>("BTC-USD");
  const [testMode, setTestMode] = useState<boolean>(true);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Load configuration data when available
  useEffect(() => {
    if (config) {
      setOrderSize(config.orderSize);
      setTradingPair(config.tradingPair);
      setTestMode(config.testMode);
    }
  }, [config]);
  
  // Update configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: (newConfig: Partial<Configuration>) => {
      return apiRequest('POST', '/api/config', newConfig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/config'] });
      toast({
        title: "Configuration Updated",
        description: "Your bot configuration has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update configuration: " + String(error),
        variant: "destructive",
      });
    }
  });
  
  const handleSaveConfig = () => {
    updateConfigMutation.mutate({
      orderSize,
      tradingPair,
      testMode
    });
  };
  
  const handleResetConfig = () => {
    setOrderSize("0.01");
    setTradingPair("BTC-USD");
    setTestMode(true);
    
    toast({
      title: "Configuration Reset",
      description: "Configuration has been reset to default values. Click Save to apply.",
    });
  };
  
  return (
    <Card className="mt-6">
      <CardHeader className="border-b border-gray-200">
        <CardTitle>Bot Configuration</CardTitle>
        <CardDescription>Configure webhook listener and trading parameters.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="webhook-endpoint">Webhook Endpoint</Label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                URL
              </span>
              <Input
                id="webhook-endpoint"
                name="webhook-endpoint"
                disabled
                value={config?.webhookEndpoint || "/webhook"}
                className="flex-1 min-w-0 rounded-none rounded-r-md bg-gray-50"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Default endpoint for receiving webhook requests.
            </p>
          </div>

          <div>
            <Label htmlFor="api-key">API Key Status</Label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                Status
              </span>
              <div className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 bg-gray-50 text-gray-800 sm:text-sm">
                <div className="flex items-center">
                  <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                  <span>API Key: f9f5894e-24c8...d848238 (Configured)</span>
                </div>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              API key credentials loaded from environment variables.
            </p>
          </div>

          <div>
            <Label htmlFor="order-size">Order Size</Label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <Input
                type="number"
                id="order-size"
                name="order-size"
                value={orderSize}
                onChange={(e) => setOrderSize(e.target.value)}
                step="0.001"
                min="0.001"
                className="flex-1 min-w-0 rounded-r-none"
              />
              <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                BTC
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Default size for BTC market orders.
            </p>
          </div>

          <div>
            <Label htmlFor="trading-pair">Trading Pair</Label>
            <Select
              value={tradingPair}
              onValueChange={setTradingPair}
            >
              <SelectTrigger id="trading-pair" className="w-full">
                <SelectValue placeholder="Select trading pair" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BTC-USD">BTC-USD</SelectItem>
                <SelectItem value="ETH-USD">ETH-USD</SelectItem>
                <SelectItem value="SOL-USD">SOL-USD</SelectItem>
                <SelectItem value="DOGE-USD">DOGE-USD</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-2 text-sm text-gray-500">
              Trading pair for market orders.
            </p>
          </div>
          
          <div className="sm:col-span-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="test-mode"
                checked={testMode}
                onChange={(e) => setTestMode(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="test-mode">Test Mode (No real orders will be executed)</Label>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
        <Button 
          onClick={handleSaveConfig}
          disabled={updateConfigMutation.isPending}
        >
          {updateConfigMutation.isPending ? 'Saving...' : 'Save Configuration'}
        </Button>
        <Button 
          variant="outline" 
          onClick={handleResetConfig} 
          className="ml-3"
        >
          Reset to Default
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConfigurationPanel;
