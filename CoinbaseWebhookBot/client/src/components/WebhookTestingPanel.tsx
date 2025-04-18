import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const WebhookTestingPanel: React.FC = () => {
  const [webhookPayload, setWebhookPayload] = useState<string>('{"action": "buy", "symbol": "BTC-USD", "amount": 0.01}');
  const [requestType, setRequestType] = useState<string>('buy');
  const [testMode, setTestMode] = useState<boolean>(true);
  const { toast } = useToast();
  
  // Update webhook payload when request type changes
  useEffect(() => {
    if (requestType === 'buy') {
      setWebhookPayload('{"action": "buy", "symbol": "BTC-USD", "amount": 0.01}');
    } else if (requestType === 'sell') {
      setWebhookPayload('{"action": "sell", "symbol": "BTC-USD", "amount": 0.01}');
    } else if (requestType === 'custom') {
      setWebhookPayload('{"action": "custom", "params": {}}');
    }
  }, [requestType]);
  
  // Send test webhook mutation
  const sendWebhookMutation = useMutation({
    mutationFn: (payload: object) => {
      return apiRequest('POST', '/api/webhook', payload);
    },
    onSuccess: (data) => {
      toast({
        title: "Webhook Sent",
        description: "Test webhook sent successfully: " + JSON.stringify(data),
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send webhook: " + String(error),
        variant: "destructive",
      });
    }
  });
  
  const handleSendWebhook = () => {
    try {
      const payload = JSON.parse(webhookPayload);
      
      // If test mode is enabled, make sure the backend knows this
      if (testMode) {
        payload.testMode = true;
      }
      
      sendWebhookMutation.mutate(payload);
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "The webhook payload contains invalid JSON.",
        variant: "destructive",
      });
    }
  };
  
  const handleResetPayload = () => {
    setRequestType('buy');
    setWebhookPayload('{"action": "buy", "symbol": "BTC-USD", "amount": 0.01}');
  };
  
  return (
    <Card className="mt-6">
      <CardHeader className="border-b border-gray-200">
        <CardTitle>Webhook Testing</CardTitle>
        <CardDescription>Test webhook functionality without executing real orders.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <div className="mb-4">
              <Label htmlFor="webhook-payload">JSON Payload</Label>
              <div className="mt-1">
                <Textarea 
                  id="webhook-payload" 
                  value={webhookPayload}
                  onChange={(e) => setWebhookPayload(e.target.value)}
                  rows={5} 
                  className="font-mono text-sm"
                  placeholder='{"action": "buy", "symbol": "BTC-USD", "amount": 0.01}'
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Enter a JSON payload to simulate a webhook request.
              </p>
            </div>
          </div>

          <div>
            <div className="mb-4">
              <span className="block text-sm font-medium text-gray-800">Request Type</span>
              <div className="mt-2">
                <RadioGroup 
                  value={requestType} 
                  onValueChange={setRequestType}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="buy" id="request-buy" />
                    <Label htmlFor="request-buy">Buy Order</Label>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <RadioGroupItem value="sell" id="request-sell" />
                    <Label htmlFor="request-sell">Sell Order</Label>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <RadioGroupItem value="custom" id="request-custom" />
                    <Label htmlFor="request-custom">Custom Request</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="test-mode" 
                  checked={testMode}
                  onCheckedChange={(checked) => setTestMode(checked as boolean)}
                />
                <div>
                  <Label htmlFor="test-mode" className="font-medium">Test Mode</Label>
                  <p className="text-sm text-gray-500">Don't execute actual orders on Coinbase.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
        <Button 
          onClick={handleSendWebhook}
          disabled={sendWebhookMutation.isPending}
        >
          {sendWebhookMutation.isPending ? 'Sending...' : 'Send Test Webhook'}
        </Button>
        <Button 
          variant="outline" 
          onClick={handleResetPayload} 
          className="ml-3"
        >
          Reset Payload
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WebhookTestingPanel;
