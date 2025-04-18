import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface StrategySettings {
  enableAdxFilter: boolean;
  adxThreshold: number;
  enableVolumeFilter: boolean;
  stopLossPercent: string;
  takeProfitPercent: string;
  trailingStopPercent: string;
  enableTrailingStop: boolean;
}

const StrategySettingsPanel: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state
  const [enableAdxFilter, setEnableAdxFilter] = useState(true);
  const [adxThreshold, setAdxThreshold] = useState(20);
  const [enableVolumeFilter, setEnableVolumeFilter] = useState(true);
  const [stopLossPercent, setStopLossPercent] = useState('2.0');
  const [takeProfitPercent, setTakeProfitPercent] = useState('3.0');
  const [trailingStopPercent, setTrailingStopPercent] = useState('1.5');
  const [enableTrailingStop, setEnableTrailingStop] = useState(true);
  
  // Get strategy settings
  const { data: strategySettings, isLoading } = useQuery<StrategySettings>({
    queryKey: ['/api/strategy'],
  });
  
  // Update settings when data is loaded
  useEffect(() => {
    if (strategySettings) {
      setEnableAdxFilter(strategySettings.enableAdxFilter);
      setAdxThreshold(strategySettings.adxThreshold);
      setEnableVolumeFilter(strategySettings.enableVolumeFilter);
      setStopLossPercent(strategySettings.stopLossPercent);
      setTakeProfitPercent(strategySettings.takeProfitPercent);
      setTrailingStopPercent(strategySettings.trailingStopPercent);
      setEnableTrailingStop(strategySettings.enableTrailingStop);
    }
  }, [strategySettings]);
  
  // Update strategy settings
  const updateSettingsMutation = useMutation({
    mutationFn: (data: StrategySettings) => {
      return apiRequest('POST', '/api/strategy', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/strategy'] });
      toast({
        title: "Strategy Settings Updated",
        description: "Your trading strategy settings have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update strategy settings: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  const handleSave = () => {
    const settings: StrategySettings = {
      enableAdxFilter,
      adxThreshold,
      enableVolumeFilter,
      stopLossPercent,
      takeProfitPercent,
      trailingStopPercent,
      enableTrailingStop,
    };
    
    updateSettingsMutation.mutate(settings);
  };
  
  const handleReset = () => {
    if (strategySettings) {
      setEnableAdxFilter(strategySettings.enableAdxFilter);
      setAdxThreshold(strategySettings.adxThreshold);
      setEnableVolumeFilter(strategySettings.enableVolumeFilter);
      setStopLossPercent(strategySettings.stopLossPercent);
      setTakeProfitPercent(strategySettings.takeProfitPercent);
      setTrailingStopPercent(strategySettings.trailingStopPercent);
      setEnableTrailingStop(strategySettings.enableTrailingStop);
    } else {
      // Default values if no settings loaded
      setEnableAdxFilter(true);
      setAdxThreshold(20);
      setEnableVolumeFilter(true);
      setStopLossPercent('2.0');
      setTakeProfitPercent('3.0');
      setTrailingStopPercent('1.5');
      setEnableTrailingStop(true);
    }
  };
  
  return (
    <Card className="mt-6">
      <CardHeader className="border-b border-gray-200">
        <CardTitle>Trading Strategy Settings</CardTitle>
        <CardDescription>Configure filters and risk management for your automated trading strategy.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* ADX Filter Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Trend Filter Settings</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="adx-filter" className="text-base">ADX Filter</Label>
                  <Switch
                    id="adx-filter"
                    checked={enableAdxFilter}
                    onCheckedChange={setEnableAdxFilter}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Filters out choppy/ranging markets using the ADX indicator.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adx-threshold" className="text-base">
                  ADX Threshold: {adxThreshold}
                </Label>
                <div className="flex items-center space-x-4">
                  <span className="text-sm">5</span>
                  <Slider
                    id="adx-threshold"
                    min={5}
                    max={50}
                    step={1}
                    value={[adxThreshold]}
                    onValueChange={(value) => setAdxThreshold(value[0])}
                    disabled={!enableAdxFilter}
                    className="flex-1"
                  />
                  <span className="text-sm">50</span>
                </div>
                <p className="text-sm text-gray-500">
                  Minimum ADX value for valid trend (higher = stronger trend required).
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="volume-filter" className="text-base">Volume Filter</Label>
                  <Switch
                    id="volume-filter"
                    checked={enableVolumeFilter}
                    onCheckedChange={setEnableVolumeFilter}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Only take trades with above-average volume for confirmation.
                </p>
              </div>
            </div>
            
            {/* Risk Management Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Risk Management</h3>
              
              <div className="space-y-2">
                <Label htmlFor="stop-loss" className="text-base">Stop Loss (%)</Label>
                <Input
                  id="stop-loss"
                  type="text"
                  value={stopLossPercent}
                  onChange={(e) => setStopLossPercent(e.target.value)}
                  placeholder="2.0"
                />
                <p className="text-sm text-gray-500">
                  Default percentage below entry (for buys) or above entry (for sells) to exit with a loss.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="take-profit" className="text-base">Take Profit (%)</Label>
                <Input
                  id="take-profit"
                  type="text"
                  value={takeProfitPercent}
                  onChange={(e) => setTakeProfitPercent(e.target.value)}
                  placeholder="3.0"
                />
                <p className="text-sm text-gray-500">
                  Default percentage above entry (for buys) or below entry (for sells) to take profit.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="trailing-stop" className="text-base">Trailing Stop Loss</Label>
                  <Switch
                    id="trailing-stop"
                    checked={enableTrailingStop}
                    onCheckedChange={setEnableTrailingStop}
                  />
                </div>
                
                <Input
                  id="trailing-stop-percent"
                  type="text"
                  value={trailingStopPercent}
                  onChange={(e) => setTrailingStopPercent(e.target.value)}
                  placeholder="1.5"
                  disabled={!enableTrailingStop}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500">
                  Set dynamic stop loss that follows price in your favor.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
        <div className="flex justify-end space-x-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button 
            type="button" 
            onClick={handleSave}
            disabled={updateSettingsMutation.isPending}
          >
            {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default StrategySettingsPanel;