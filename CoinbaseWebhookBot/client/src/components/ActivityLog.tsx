import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { ActivityLog as ActivityLogType } from '@/types';

const ActivityLog: React.FC = () => {
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch activity logs
  const { data: logs, isLoading } = useQuery<ActivityLogType[]>({
    queryKey: ['/api/logs'],
  });
  
  // Clear logs mutation
  const clearLogsMutation = useMutation({
    mutationFn: () => {
      return apiRequest('POST', '/api/logs/clear', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/logs'] });
      toast({
        title: "Logs Cleared",
        description: "All activity logs have been cleared successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to clear logs: " + String(error),
        variant: "destructive",
      });
    }
  });
  
  // Filter logs based on selection
  const getFilteredLogs = () => {
    if (!logs) return [];
    
    switch (filter) {
      case 'buy':
        return logs.filter(log => log.type === 'buy_order');
      case 'sell':
        return logs.filter(log => log.type === 'sell_order');
      case 'errors':
        return logs.filter(log => log.type === 'error');
      default:
        return logs;
    }
  };
  
  const filteredLogs = getFilteredLogs();
  
  // Get appropriate icon for log type
  const getLogIcon = (type: string) => {
    switch (type) {
      case 'buy_order':
        return (
          <span className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </span>
        );
      case 'sell_order':
        return (
          <span className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </span>
        );
      case 'webhook':
        return (
          <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        );
      case 'error':
        return (
          <span className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </span>
        );
      case 'system':
        return (
          <span className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        );
      default:
        return (
          <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        );
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
  };
  
  return (
    <Card className="mt-6">
      <CardHeader className="border-b border-gray-200 flex flex-row justify-between items-center">
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Most recent webhook activities and executed orders.</CardDescription>
        </div>
        <div>
          <Select 
            value={filter} 
            onValueChange={setFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter logs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="buy">Buy Orders</SelectItem>
              <SelectItem value="sell">Sell Orders</SelectItem>
              <SelectItem value="errors">Errors</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">Loading logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No activity logs found.</div>
        ) : (
          <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {filteredLogs.map((log) => (
              <li key={log.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getLogIcon(log.type)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-800">
                        {log.message}
                      </div>
                      <div className="text-sm text-gray-500">
                        {log.details && log.details.length < 50 ? log.details : log.details?.substring(0, 50) + "..."}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {log.orderId && (
                      <div className="text-sm text-gray-500 mr-4">Order ID: {log.orderId.substring(0, 8)}...</div>
                    )}
                    {log.errorCode && (
                      <div className="text-sm text-gray-500 mr-4">Error Code: {log.errorCode}</div>
                    )}
                    {log.ipAddress && (
                      <div className="text-sm text-gray-500 mr-4">IP: {log.ipAddress}</div>
                    )}
                    <div className="text-sm text-gray-500">{formatTimestamp(log.timestamp)}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200 flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={() => clearLogsMutation.mutate()}
          disabled={clearLogsMutation.isPending}
        >
          {clearLogsMutation.isPending ? 'Clearing...' : 'Clear Log'}
        </Button>
        <a href="#" className="font-medium text-blue-600 hover:text-blue-800">
          View Full Logs →
        </a>
      </CardFooter>
    </Card>
  );
};

export default ActivityLog;
