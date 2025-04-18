import React from 'react';
import Sidebar from "./Sidebar";
import StatusCards from "./StatusCards";
import ConfigurationPanel from "./ConfigurationPanel";
import ActivityLog from "./ActivityLog";
import WebhookTestingPanel from "./WebhookTestingPanel";
import TradingPairsPanel from "./TradingPairsPanel";
import StrategySettingsPanel from "./StrategySettingsPanel";
import TradingPairCards from "./TradingPairCards";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { Configuration } from "@/types";

const Dashboard: React.FC = () => {
  const isMobile = useIsMobile();
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const { toast } = useToast();
  
  // Get API connection status
  const { data: connectionStatus } = useQuery<{ success: boolean; message: string }>({
    queryKey: ['/api/test-connection'],
    refetchInterval: 60000, // Check connection every minute
  });
  
  // Get configuration
  const { data: config } = useQuery<Configuration>({
    queryKey: ['/api/config'],
  });
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for desktop */}
      {!isMobile && <Sidebar />}
      
      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button 
            type="button" 
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input 
                    id="search-field" 
                    className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm" 
                    placeholder="Search logs, orders..." 
                    type="search"
                  />
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              {/* System status indicator */}
              <div className="flex items-center mr-4">
                <span className={`h-2 w-2 ${connectionStatus?.success ? 'bg-green-500' : 'bg-red-500'} rounded-full mr-2`}></span>
                <span className="text-sm font-medium text-gray-800">
                  {connectionStatus?.success ? 'System Active' : 'Connection Error'}
                </span>
              </div>
              
              {/* Notification button */}
              <button 
                type="button" 
                className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => {
                  toast({
                    title: "Notifications",
                    description: "No new notifications at this time.",
                  });
                }}
              >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobile && showMobileMenu && (
          <div className="fixed inset-0 z-40 flex">
            <div className="fixed inset-0">
              <div className="absolute inset-0 bg-gray-600 opacity-75" onClick={() => setShowMobileMenu(false)}></div>
            </div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <Sidebar />
            </div>
          </div>
        )}

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-800">Webhook Bot Dashboard</h1>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Main dashboard content */}
              <div className="py-4">
                <StatusCards connectionStatus={connectionStatus} config={config} />
                
                {/* Trading Pair Cards */}
                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-2">Active Trading Pairs</h2>
                  <p className="text-sm text-gray-500 mb-4">Current market prices and trading settings for configured pairs.</p>
                  <TradingPairCards />
                </div>
                
                <ConfigurationPanel config={config} />
                <TradingPairsPanel />
                <StrategySettingsPanel />
                <ActivityLog />
                <WebhookTestingPanel />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
