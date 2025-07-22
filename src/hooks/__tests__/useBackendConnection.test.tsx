// Testes para useBackendConnection hook
import React from 'react';
import {renderHook, act, waitFor} from '@testing-library/react-native';
import {useBackendConnection} from '../useBackendConnection';
import {apiClient} from '@services/apiClient';
import {authService} from '@services/authService';
import {videoService} from '@services/videoService';
import {analysisService} from '@services/analysisService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock dependencies
jest.mock('@services/apiClient');
jest.mock('@services/authService');
jest.mock('@services/videoService');
jest.mock('@services/analysisService');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('@utils/toastConfig');

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockedAuthService = authService as jest.Mocked<typeof authService>;
const mockedVideoService = videoService as jest.Mocked<typeof videoService>;
const mockedAnalysisService = analysisService as jest.Mocked<
  typeof analysisService
>;
const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// Mock timers
jest.useFakeTimers();

describe('useBackendConnection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();

    // Default mock responses
    mockedApiClient.get.mockResolvedValue({
      data: {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: 3600,
        environment: 'development',
        version: '1.0.0',
      },
    });

    mockedAuthService.initialize.mockResolvedValue();
    mockedAuthService.isAuthenticated.mockResolvedValue(true);
    mockedAuthService.isTokenExpired.mockResolvedValue(false);

    mockedVideoService.getVideos.mockResolvedValue({
      videos: [],
      total: 0,
      hasMore: false,
    });

    mockedAnalysisService.getAnalyses.mockResolvedValue([]);
    mockedAsyncStorage.setItem.mockResolvedValue();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initial Connection', () => {
    it('should initialize and connect to backend on mount', async () => {
      const {result} = renderHook(() => useBackendConnection());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isConnected).toBe(false);

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockedApiClient.get).toHaveBeenCalledWith('/health', {
        timeout: 10000,
      });
      expect(mockedAuthService.initialize).toHaveBeenCalled();
    });

    it('should handle backend health check failure', async () => {
      mockedApiClient.get.mockRejectedValueOnce(new Error('Connection failed'));

      const {result} = renderHook(() => useBackendConnection());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe('Connection failed');
      });
    });

    it('should handle unhealthy backend status', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: {status: 'ERROR'},
      });

      const {result} = renderHook(() => useBackendConnection());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
        expect(result.current.error).toContain('Backend não está saudável');
      });
    });
  });

  describe('Authentication Testing', () => {
    it('should test authentication for authenticated users', async () => {
      mockedAuthService.isAuthenticated.mockResolvedValueOnce(true);
      mockedAuthService.isTokenExpired.mockResolvedValueOnce(false);

      const {result} = renderHook(() => useBackendConnection());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      expect(mockedAuthService.isAuthenticated).toHaveBeenCalled();
      expect(mockedAuthService.isTokenExpired).toHaveBeenCalled();
    });

    it('should refresh token when expired', async () => {
      mockedAuthService.isAuthenticated.mockResolvedValueOnce(true);
      mockedAuthService.isTokenExpired.mockResolvedValueOnce(true);
      mockedAuthService.refreshToken.mockResolvedValueOnce('new-token');

      const {result} = renderHook(() => useBackendConnection());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      expect(mockedAuthService.refreshToken).toHaveBeenCalled();
    });

    it('should handle authentication failure', async () => {
      mockedAuthService.isAuthenticated.mockRejectedValueOnce(
        new Error('Auth failed'),
      );

      const {result} = renderHook(() => useBackendConnection());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true); // Still connected, just not authenticated
      });

      // Should continue with connection even if auth fails
    });
  });

  describe('Core Features Testing', () => {
    it('should test video and analysis services when authenticated', async () => {
      mockedAuthService.isAuthenticated.mockResolvedValueOnce(true);

      const {result} = renderHook(() => useBackendConnection());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      expect(mockedVideoService.getVideos).toHaveBeenCalledWith(1, 1);
      expect(mockedAnalysisService.getAnalyses).toHaveBeenCalledWith({
        page: 1,
        limit: 1,
      });
    });

    it('should handle service failures gracefully', async () => {
      mockedAuthService.isAuthenticated.mockResolvedValueOnce(true);
      mockedVideoService.getVideos.mockRejectedValueOnce(
        new Error('Video service failed'),
      );
      mockedAnalysisService.getAnalyses.mockRejectedValueOnce(
        new Error('Analysis service failed'),
      );

      const {result} = renderHook(() => useBackendConnection());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Should still be connected despite service failures
      expect(result.current.isConnected).toBe(true);
    });

    it('should skip core features test when not authenticated', async () => {
      mockedAuthService.isAuthenticated.mockResolvedValueOnce(false);

      const {result} = renderHook(() => useBackendConnection());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Core features should not be tested
      expect(mockedVideoService.getVideos).not.toHaveBeenCalled();
      expect(mockedAnalysisService.getAnalyses).not.toHaveBeenCalled();
    });
  });

  describe('Auto-Reconnection', () => {
    it('should attempt reconnection after connection failure', async () => {
      mockedApiClient.get
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockResolvedValueOnce({
          data: {status: 'OK', version: '1.0.0'},
        });

      const {result} = renderHook(() => useBackendConnection());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
        expect(result.current.retryCount).toBe(1);
      });

      // Fast-forward timers to trigger reconnection
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
        expect(result.current.retryCount).toBe(0);
      });
    });

    it('should stop reconnecting after max retries', async () => {
      mockedApiClient.get.mockRejectedValue(
        new Error('Persistent connection failed'),
      );

      const {result} = renderHook(() => useBackendConnection());

      // Wait for initial failure
      await waitFor(() => {
        expect(result.current.retryCount).toBe(1);
      });

      // Fast-forward through all retries
      for (let i = 0; i < 5; i++) {
        act(() => {
          jest.advanceTimersByTime(30000); // Max delay
        });

        await waitFor(() => {
          expect(result.current.retryCount).toBe(Math.min(i + 2, 5));
        });
      }

      // Should stop at max retries
      expect(result.current.retryCount).toBe(5);
      expect(result.current.isConnected).toBe(false);
    });

    it('should use exponential backoff for retries', async () => {
      mockedApiClient.get
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValueOnce({
          data: {status: 'OK'},
        });

      const {result} = renderHook(() => useBackendConnection());

      await waitFor(() => {
        expect(result.current.retryCount).toBe(1);
      });

      // First retry after 5s
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(result.current.retryCount).toBe(2);
      });

      // Second retry after 10s (exponential backoff)
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
        expect(result.current.retryCount).toBe(0);
      });
    });
  });

  describe('Periodic Health Checks', () => {
    it('should perform periodic health checks when connected', async () => {
      const {result} = renderHook(() => useBackendConnection());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Clear initial health check call
      mockedApiClient.get.mockClear();

      // Fast-forward to trigger periodic check
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      expect(mockedApiClient.get).toHaveBeenCalledWith('/health', {
        timeout: 10000,
      });
    });

    it('should trigger reconnection if periodic health check fails', async () => {
      const {result} = renderHook(() => useBackendConnection());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Mock health check failure
      mockedApiClient.get.mockRejectedValueOnce(
        new Error('Health check failed'),
      );

      act(() => {
        jest.advanceTimersByTime(30000);
      });

      // Should trigger reconnection attempt
      await waitFor(() => {
        expect(result.current.retryCount).toBeGreaterThan(0);
      });
    });

    it('should not perform health checks when disconnected', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Never connects'));

      const {result} = renderHook(() => useBackendConnection());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
      });

      // Clear any calls from initial connection attempt
      mockedApiClient.get.mockClear();

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(60000);
      });

      // Should not have called health check since not connected
      expect(mockedApiClient.get).not.toHaveBeenCalled();
    });
  });

  describe('Manual Actions', () => {
    it('should allow manual connection', async () => {
      const {result} = renderHook(() => useBackendConnection());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      await act(async () => {
        const success = await result.current.connectToBackend();

        expect(success).toBe(true);
      });
    });

    it('should allow manual disconnection', async () => {
      mockedAuthService.logout.mockResolvedValue();
      mockedAsyncStorage.removeItem.mockResolvedValue();

      const {result} = renderHook(() => useBackendConnection());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      await act(async () => {
        await result.current.disconnectFromBackend();
      });

      expect(result.current.isConnected).toBe(false);
      expect(mockedAuthService.logout).toHaveBeenCalled();
      expect(mockedAsyncStorage.removeItem).toHaveBeenCalledWith(
        'backend_connection_info',
      );
    });

    it('should allow manual health check', async () => {
      const {result} = renderHook(() => useBackendConnection());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      await act(async () => {
        const isHealthy = await result.current.checkBackendHealth();

        expect(isHealthy).toBe(true);
      });
    });
  });

  describe('Connection Details', () => {
    it('should provide backend health information', async () => {
      const mockHealth = {
        status: 'OK',
        timestamp: '2023-01-01T00:00:00.000Z',
        uptime: 3600,
        environment: 'development',
        version: '1.0.0',
      };

      mockedApiClient.get.mockResolvedValueOnce({data: mockHealth});

      const {result} = renderHook(() => useBackendConnection());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
        expect(result.current.backendHealth).toEqual(mockHealth);
        expect(result.current.connectionDetails.backendVersion).toBe('1.0.0');
        expect(result.current.connectionDetails.backendEnvironment).toBe(
          'development',
        );
        expect(result.current.connectionDetails.uptime).toBe(3600);
      });
    });

    it('should track connection timing', async () => {
      const {result} = renderHook(() => useBackendConnection());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
        expect(result.current.lastChecked).toBeInstanceOf(Date);
      });
    });

    it('should save connection info to storage', async () => {
      const {result} = renderHook(() => useBackendConnection());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        'backend_connection_info',
        expect.stringContaining('connectedAt'),
      );
    });
  });

  describe('Error Scenarios', () => {
    it('should handle storage errors gracefully', async () => {
      mockedAsyncStorage.setItem.mockRejectedValueOnce(
        new Error('Storage full'),
      );

      const {result} = renderHook(() => useBackendConnection());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Should still be connected despite storage error
      expect(result.current.isConnected).toBe(true);
    });

    it('should handle auth service errors gracefully', async () => {
      mockedAuthService.initialize.mockRejectedValueOnce(
        new Error('Auth init failed'),
      );

      const {result} = renderHook(() => useBackendConnection());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Should still connect despite auth initialization failure
      expect(result.current.isConnected).toBe(true);
    });

    it('should cleanup intervals on unmount', async () => {
      const {result, unmount} = renderHook(() => useBackendConnection());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Unmount component
      unmount();

      // Clear any pending intervals
      act(() => {
        jest.advanceTimersByTime(60000);
      });

      // Should not perform any more health checks
      const healthCheckCalls = mockedApiClient.get.mock.calls.filter(
        call => call[0] === '/health',
      ).length;

      // Should have only the initial health checks, no periodic ones
      expect(healthCheckCalls).toBeLessThanOrEqual(2);
    });
  });
});
