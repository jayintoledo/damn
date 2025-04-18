import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { ActivityLog, Configuration } from '@/types';

interface StatusCardsProps {
  connectionStatus?: { success: boolean };
  config?: Configuration;
}

const StatusCards: React.FC<StatusCardsProps> = ({ connectionStatus, config }) => {
  // Get activity logs to count orders
  const { data: logs } = useQuery<ActivityLog[]>({
    queryKey: ['/api/logs'],
  });
  
  // Count orders today
  const countOrdersToday = () => {
    if (!logs) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return (
        (log.type === 'buy_order' || log.type === 'sell_order') && 
        logDate >= today
      );
    }).length;
  };
  
  // Count failed orders today
  const countFailedOrdersToday = () => {
    if (!logs) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return (
        log.type === 'error' && 
        log.message.includes('order') &&
        logDate >= today
      );
    }).length;
  };
  
  const ordersToday = countOrdersToday();
  const failedOrders = countFailedOrdersToday();
  
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Server Status Card */}
      <Card className="overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-50 rounded-md p-3">
              <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">
                  Server Status
                </dt>
                <dd className="flex items-center">
                  <div className="text-lg font-semibold text-gray-900">
                    Running
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <Badge variant="success">
                      Healthy
                    </Badge>
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-4 sm:px-6">
          <div className="text-sm">
            <a href="#" className="font-medium text-blue-600 hover:text-blue-800">
              View details
            </a>
          </div>
        </div>
      </Card>

      {/* API Connection Card */}
      <Card className="overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-50 rounded-md p-3">
              <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">
                  Coinbase API Connection
                </dt>
                <dd className="flex items-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {connectionStatus?.success ? 'Connected' : 'Disconnected'}
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <Badge variant={connectionStatus?.success ? 'success' : 'error'}>
                      {connectionStatus?.success ? 'Authenticated' : 'Error'}
                    </Badge>
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-4 sm:px-6">
          <div className="text-sm">
            <button 
              className="font-medium text-blue-600 hover:text-blue-800" 
              onClick={() => {
                window.location.href = "/api/test-connection";
              }}
            >
              Test connection
            </button>
          </div>
        </div>
      </Card>

      {/* Orders Today Card */}
      <Card className="overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-50 rounded-md p-3">
              <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">
                  Orders Today
                </dt>
                <dd className="flex items-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {ordersToday}
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <Badge variant={failedOrders > 0 ? 'warning' : 'success'}>
                      {failedOrders > 0 ? `${failedOrders} Failed` : 'All Successful'}
                    </Badge>
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-4 sm:px-6">
          <div className="text-sm">
            <a href="#" className="font-medium text-blue-600 hover:text-blue-800">
              View all orders
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StatusCards;
