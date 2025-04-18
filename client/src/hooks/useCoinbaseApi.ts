import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { ActivityLog, Configuration, WebhookPayload, OrderResponse } from '@/types';

export function useCoinbaseApi() {
  const queryClient = useQueryClient();
  
  // Get activity logs
  const useActivityLogs = (limit: number = 20, type?: string) => {
    return useQuery<ActivityLog[]>({
      queryKey: ['/api/logs', { limit, type }],
    });
  };
  
  // Get configuration
  const useConfiguration = () => {
    return useQuery<Configuration>({
      queryKey: ['/api/config'],
    });
  };
  
  // Test API connection
  const useTestConnection = () => {
    return useQuery<{ success: boolean; message: string }>({
      queryKey: ['/api/test-connection'],
      refetchInterval: 60000, // Check every minute
    });
  };
  
  // Update configuration
  const useUpdateConfiguration = () => {
    return useMutation({
      mutationFn: (newConfig: Partial<Configuration>) => {
        return apiRequest('POST', '/api/config', newConfig);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/config'] });
      },
    });
  };
  
  // Send webhook
  const useSendWebhook = () => {
    return useMutation({
      mutationFn: (payload: WebhookPayload) => {
        return apiRequest('POST', '/api/webhook', payload);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/logs'] });
      },
    });
  };
  
  // Clear logs
  const useClearLogs = () => {
    return useMutation({
      mutationFn: () => {
        return apiRequest('POST', '/api/logs/clear', {});
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/logs'] });
      },
    });
  };
  
  return {
    useActivityLogs,
    useConfiguration,
    useTestConnection,
    useUpdateConfiguration,
    useSendWebhook,
    useClearLogs,
  };
}
