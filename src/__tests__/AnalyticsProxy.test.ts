import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnalyticsProxy } from '../AnalyticsProxy';

// Mock window object for testing
const mockWindow = {
  mixpanel: {
    init: vi.fn(),
    track: vi.fn(),
    identify: vi.fn(),
    people: {
      set: vi.fn(),
    },
    opt_in_tracking: vi.fn(),
    opt_out_tracking: vi.fn(),
  },
  gtag: vi.fn(),
  dataLayer: [],
  LogRocket: {
    init: vi.fn(),
    track: vi.fn(),
    identify: vi.fn(),
  },
  amplitude: {
    getInstance: vi.fn(() => ({
      init: vi.fn(),
      logEvent: vi.fn(),
      setUserId: vi.fn(),
      setUserProperties: vi.fn(),
    })),
  },
};

// Mock document for testing
const mockDocument = {
  head: {
    appendChild: vi.fn(),
  },
  createElement: vi.fn(() => ({
    async: true,
    src: '',
    onload: null,
  })),
  referrer: 'https://example.com',
};

// Mock console for testing
const mockConsole = {
  log: vi.fn(),
  warn: vi.fn(),
};

// Setup global mocks
Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
});

Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true,
});

Object.defineProperty(global, 'console', {
  value: mockConsole,
  writable: true,
});

Object.defineProperty(global, 'process', {
  value: { env: { NODE_ENV: 'test' } },
  writable: true,
});

describe('AnalyticsProxy', () => {
  let analytics: AnalyticsProxy;

  beforeEach(() => {
    vi.clearAllMocks();
    analytics = new AnalyticsProxy({
      providers: {
        mixpanel: {
          enabled: true,
          token: 'test-token',
          debug: false,
        },
        ga4: {
          enabled: true,
          measurementId: 'G-TEST123',
          debugMode: false,
        },
        logrocket: {
          enabled: true,
          appId: 'test-app-id',
        },
        amplitude: {
          enabled: true,
          apiKey: 'test-api-key',
        },
      },
      enableDebug: true,
    });
  });

  describe('Initialization', () => {
    it('should initialize with all enabled providers', () => {
      expect(analytics.getAvailableProviders()).toHaveLength(4);
      expect(analytics.getProviderStatus()).toEqual({
        mixpanel: true,
        ga4: true,
        logrocket: true,
        amplitude: true,
      });
    });

    it('should initialize with only enabled providers', () => {
      const limitedAnalytics = new AnalyticsProxy({
        providers: {
          mixpanel: {
            enabled: true,
            token: 'test-token',
          },
          ga4: {
            enabled: false,
            measurementId: 'G-TEST123',
          },
        },
      });

      expect(limitedAnalytics.getAvailableProviders()).toHaveLength(1);
      expect(limitedAnalytics.getAvailableProviders()).toContain('mixpanel');
    });
  });

  describe('Provider Management', () => {
    it('should enable and disable individual providers', () => {
      analytics.disableProvider('mixpanel');
      expect(analytics.isProviderEnabled('mixpanel')).toBe(false);

      analytics.enableProvider('mixpanel');
      expect(analytics.isProviderEnabled('mixpanel')).toBe(true);
    });

    it('should enable and disable all providers', () => {
      analytics.disableAllProviders();
      expect(analytics.getProviderStatus()).toEqual({
        mixpanel: false,
        ga4: false,
        logrocket: false,
        amplitude: false,
      });

      analytics.enableAllProviders();
      expect(analytics.getProviderStatus()).toEqual({
        mixpanel: true,
        ga4: true,
        logrocket: true,
        amplitude: true,
      });
    });
  });

  describe('Event Tracking', () => {
    it('should track events across enabled providers', () => {
      const event = {
        name: 'Test Event',
        properties: { test: 'value' },
      };

      analytics.trackEvent(event);
      
      // Verify Mixpanel was called
      expect(mockWindow.mixpanel.track).toHaveBeenCalledWith(
        'Test Event',
        expect.objectContaining({ test: 'value' })
      );
      
      // Verify GA4 was called
      expect(mockWindow.gtag).toHaveBeenCalled();
    });

    it('should not track events when providers are disabled', () => {
      analytics.disableAllProviders();
      
      vi.clearAllMocks();
      
      const event = {
        name: 'Test Event',
        properties: { test: 'value' },
      };

      analytics.trackEvent(event);
      
      // Verify no tracking occurred
      expect(mockWindow.mixpanel.track).not.toHaveBeenCalled();
      expect(mockWindow.gtag).not.toHaveBeenCalled();
    });

    it('should include global properties in tracked events', () => {
      analytics.setGlobalProperties({ 
        appVersion: '1.0.0',
        environment: 'test' 
      });
      
      vi.clearAllMocks();
      
      analytics.trackEvent({
        name: 'Button Click',
        properties: { buttonId: 'submit' },
      });
      
      // Verify global properties were included
      expect(mockWindow.mixpanel.track).toHaveBeenCalledWith(
        'Button Click',
        expect.objectContaining({
          buttonId: 'submit',
          appVersion: '1.0.0',
          environment: 'test',
        })
      );
    });
  });

  describe('User Identification', () => {
    it('should identify users across enabled providers', () => {
      const user = {
        id: 'test-user-123',
        properties: { 
          name: 'Test User',
          email: 'test@example.com',
        },
      };

      analytics.identifyUser(user);
      
      // Verify Mixpanel was called
      expect(mockWindow.mixpanel.identify).toHaveBeenCalledWith('test-user-123');
      expect(mockWindow.mixpanel.people.set).toHaveBeenCalledWith(
        expect.objectContaining({
          $name: 'Test User',      // Mapped to Mixpanel format
          $email: 'test@example.com', // Mapped to Mixpanel format
        })
      );
      
      // Verify Amplitude was called
      const amplitudeInstance = mockWindow.amplitude.getInstance();
      expect(amplitudeInstance.setUserId).toHaveBeenCalledWith('test-user-123');
    });

    it('should map standard properties to provider-specific format', () => {
      const user = {
        id: 'user-456',
        properties: {
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      analytics.identifyUser(user);
      
      // Verify Mixpanel received mapped properties
      expect(mockWindow.mixpanel.people.set).toHaveBeenCalledWith(
        expect.objectContaining({
          $email: 'john@example.com',
          $first_name: 'John',
          $last_name: 'Doe',
        })
      );
    });
  });

  describe('Page View Tracking', () => {
    it('should track page views across enabled providers', () => {
      const pageView = {
        url: '/test-page',
        title: 'Test Page',
        properties: { referrer: 'test.com' },
      };

      analytics.trackPageView(pageView);
      
      // Verify Mixpanel tracked as event
      expect(mockWindow.mixpanel.track).toHaveBeenCalledWith(
        'Page View',
        expect.objectContaining({
          url: '/test-page',
          title: 'Test Page',
          referrer: 'test.com',
        })
      );
      
      // Verify GA4 config was called
      expect(mockWindow.gtag).toHaveBeenCalled();
    });
  });

  describe('Configuration Management', () => {
    it('should update configuration at runtime', () => {
      const newConfig = {
        providers: {
          mixpanel: {
            enabled: false,
            token: 'test-token',
          },
        },
        globalProperties: {
          appVersion: '2.0.0',
        },
      };

      analytics.updateConfig(newConfig);
      expect(analytics.isProviderEnabled('mixpanel')).toBe(false);
    });

    it('should set global properties', () => {
      const properties = { global: 'property' };
      analytics.setGlobalProperties(properties);
      
      // Verify global properties are set
      const config = analytics.getConfig();
      expect(config.globalProperties).toEqual(properties);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing providers gracefully', () => {
      expect(() => {
        analytics.disableProvider('nonexistent' as any);
      }).not.toThrow();
    });

    it('should return undefined for non-existent providers', () => {
      const provider = analytics.getProvider('nonexistent' as any);
      expect(provider).toBeUndefined();
    });

    it('should handle errors in provider methods gracefully', () => {
      // Make a provider method throw
      mockWindow.mixpanel.track = vi.fn(() => {
        throw new Error('Provider error');
      });

      // Should not throw - errors are caught and logged
      expect(() => {
        analytics.trackEvent({ name: 'Test', properties: {} });
      }).not.toThrow();
    });
  });

  describe('API Usage', () => {
    it('should only expose AnalyticsProxy to consumers', () => {
      // This test documents that providers are not exported
      // Consumers should only use AnalyticsProxy
      expect(analytics).toBeInstanceOf(AnalyticsProxy);
      expect(analytics.getAvailableProviders()).toBeDefined();
      expect(analytics.trackEvent).toBeDefined();
      expect(analytics.identifyUser).toBeDefined();
      expect(analytics.trackPageView).toBeDefined();
    });

    it('should provide a unified interface for all providers', () => {
      // Test that the same API works regardless of which providers are enabled
      const mixpanelOnly = new AnalyticsProxy({
        providers: {
          mixpanel: { enabled: true, token: 'test' },
        },
      });

      expect(() => {
        mixpanelOnly.trackEvent({ name: 'Test', properties: {} });
        mixpanelOnly.identifyUser({ id: 'user-1', properties: {} });
        mixpanelOnly.trackPageView({ url: '/test', title: 'Test' });
      }).not.toThrow();
    });
  });
});
