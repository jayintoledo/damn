import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { TradingPair } from '@/types';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Trash, Plus } from 'lucide-react';

const TradingPairsPanel: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPair, setCurrentPair] = useState<TradingPair | null>(null);
  
  // Form state
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState(true);
  const [orderSize, setOrderSize] = useState('');
  const [stopLossPercent, setStopLossPercent] = useState('');
  const [takeProfitPercent, setTakeProfitPercent] = useState('');
  
  // Get trading pairs
  const { data: tradingPairs, isLoading } = useQuery<TradingPair[]>({
    queryKey: ['/api/trading-pairs'],
  });
  
  // Create trading pair mutation
  const createPairMutation = useMutation({
    mutationFn: (data: Omit<TradingPair, 'id' | 'createdAt'>) => {
      return apiRequest('POST', '/api/trading-pairs', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trading-pairs'] });
      toast({
        title: "Trading Pair Created",
        description: "The trading pair was successfully created.",
      });
      closeDialog();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create trading pair: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  // Update trading pair mutation
  const updatePairMutation = useMutation({
    mutationFn: ({ symbol, data }: { symbol: string, data: Partial<TradingPair> }) => {
      return apiRequest('PUT', `/api/trading-pairs/${symbol}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trading-pairs'] });
      toast({
        title: "Trading Pair Updated",
        description: "The trading pair was successfully updated.",
      });
      closeDialog();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update trading pair: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  // Delete trading pair mutation
  const deletePairMutation = useMutation({
    mutationFn: (symbol: string) => {
      return apiRequest('DELETE', `/api/trading-pairs/${symbol}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trading-pairs'] });
      toast({
        title: "Trading Pair Deleted",
        description: "The trading pair was successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete trading pair: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  const resetForm = () => {
    setSymbol('');
    setName('');
    setStatus(true);
    setOrderSize('');
    setStopLossPercent('');
    setTakeProfitPercent('');
  };
  
  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
    setEditMode(false);
    setCurrentPair(null);
  };
  
  const openEditDialog = (pair: TradingPair) => {
    setEditMode(true);
    setCurrentPair(pair);
    setSymbol(pair.symbol);
    setName(pair.name);
    setStatus(pair.status);
    setOrderSize(pair.orderSize);
    setStopLossPercent(pair.stopLossPercent);
    setTakeProfitPercent(pair.takeProfitPercent);
    setIsDialogOpen(true);
  };
  
  const openCreateDialog = () => {
    setEditMode(false);
    resetForm();
    setIsDialogOpen(true);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symbol || !name || !orderSize) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    const pairData = {
      symbol,
      name,
      status,
      orderSize,
      stopLossPercent: stopLossPercent || "2.0",
      takeProfitPercent: takeProfitPercent || "3.0",
    };
    
    if (editMode && currentPair) {
      updatePairMutation.mutate({ 
        symbol: currentPair.symbol,
        data: pairData
      });
    } else {
      createPairMutation.mutate(pairData);
    }
  };
  
  const handleDelete = (symbol: string) => {
    if (window.confirm(`Are you sure you want to delete the trading pair ${symbol}?`)) {
      deletePairMutation.mutate(symbol);
    }
  };
  
  return (
    <Card className="mt-6">
      <CardHeader className="border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Trading Pairs</CardTitle>
            <CardDescription>Manage cryptocurrency trading pairs.</CardDescription>
          </div>
          <Button onClick={openCreateDialog} className="flex items-center space-x-1">
            <Plus className="h-4 w-4 mr-1" />
            Add Pair
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order Size</TableHead>
                  <TableHead>Stop Loss %</TableHead>
                  <TableHead>Take Profit %</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tradingPairs && tradingPairs.length > 0 ? (
                  tradingPairs.map((pair) => (
                    <TableRow key={pair.symbol}>
                      <TableCell className="font-medium">{pair.symbol}</TableCell>
                      <TableCell>{pair.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`h-2 w-2 rounded-full mr-2 ${pair.status ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          {pair.status ? 'Active' : 'Inactive'}
                        </div>
                      </TableCell>
                      <TableCell>{pair.orderSize}</TableCell>
                      <TableCell>{pair.stopLossPercent}%</TableCell>
                      <TableCell>{pair.takeProfitPercent}%</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openEditDialog(pair)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(pair.symbol)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No trading pairs found. Add your first one!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editMode ? 'Edit Trading Pair' : 'Add New Trading Pair'}</DialogTitle>
            <DialogDescription>
              {editMode 
                ? 'Update the settings for this trading pair.' 
                : 'Configure a new cryptocurrency trading pair.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input
                    id="symbol"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    disabled={editMode}
                    placeholder="BTC-USD"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Format: CRYPTO-FIAT (e.g., BTC-USD)
                  </p>
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Bitcoin"
                    className="mt-1"
                  />
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <Label htmlFor="orderSize">Default Order Size</Label>
                  <Input
                    id="orderSize"
                    type="text"
                    value={orderSize}
                    onChange={(e) => setOrderSize(e.target.value)}
                    placeholder="0.01"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Base currency amount for market orders
                  </p>
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <Label htmlFor="status">Status</Label>
                  <div className="flex items-center space-x-2 mt-3">
                    <Switch
                      id="status"
                      checked={status}
                      onCheckedChange={setStatus}
                    />
                    <Label htmlFor="status">
                      {status ? 'Active' : 'Inactive'}
                    </Label>
                  </div>
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <Label htmlFor="stopLoss">Stop Loss %</Label>
                  <Input
                    id="stopLoss"
                    type="text"
                    value={stopLossPercent}
                    onChange={(e) => setStopLossPercent(e.target.value)}
                    placeholder="2.0"
                    className="mt-1"
                  />
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <Label htmlFor="takeProfit">Take Profit %</Label>
                  <Input
                    id="takeProfit"
                    type="text"
                    value={takeProfitPercent}
                    onChange={(e) => setTakeProfitPercent(e.target.value)}
                    placeholder="3.0"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={closeDialog}>
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createPairMutation.isPending || updatePairMutation.isPending}
              >
                {createPairMutation.isPending || updatePairMutation.isPending 
                  ? 'Saving...' 
                  : editMode ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TradingPairsPanel;