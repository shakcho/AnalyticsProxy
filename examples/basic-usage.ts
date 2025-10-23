import { AnalyticsProxy } from 'analytics-proxy';

/**
 * Basic usage example
 * 
 * Each enabled provider will automatically load its required script from CDN.
 * No manual script tags or imports needed!
 */

// Example configuration
const analyticsConfig = {
  providers: {
    mixpanel: {
      enabled: true,
      token: 'your-mixpanel-token',
      debug: true,
    },
    ga4: {
      enabled: true,
      measurementId: 'G-XXXXXXXXXX',
      debugMode: false,
    },
    logrocket: {
      enabled: false, // Disabled by default
      appId: 'your-logrocket-app-id',
      options: {
        dom: {
          inputSanitizer: false,
        },
      },
    },
    amplitude: {
      enabled: true,
      apiKey: 'your-amplitude-api-key',
      options: {
        logLevel: 'INFO',
      },
    },
  },
  globalProperties: {
    appVersion: '1.0.0',
    environment: 'production',
    platform: 'web',
  },
  enableDebug: true,
};

// Initialize the analytics proxy
// Scripts for enabled providers are loaded automatically!
const analytics = new AnalyticsProxy(analyticsConfig);

// Example: Track a custom event
analytics.trackEvent({
  name: 'Button Clicked',
  properties: {
    buttonId: 'signup-button',
    page: 'homepage',
    timestamp: Date.now(),
  },
});

// Example: Identify a user
analytics.identifyUser({
  id: 'user-123',
  properties: {
    name: 'John Doe',
    email: 'john@example.com',
    plan: 'premium',
  },
});

// Example: Track a page view
analytics.trackPageView({
  url: '/dashboard',
  title: 'Dashboard',
  properties: {
    referrer: 'google.com',
    utm_source: 'email',
  },
});

// Example: Toggle providers on/off
console.log('Provider status before:', analytics.getProviderStatus());

// Disable Mixpanel
analytics.disableProvider('mixpanel');
console.log('Mixpanel disabled:', !analytics.isProviderEnabled('mixpanel'));

// Enable LogRocket
analytics.enableProvider('logrocket');
console.log('LogRocket enabled:', analytics.isProviderEnabled('logrocket'));

// Disable all providers
analytics.disableAllProviders();
console.log('All providers disabled:', analytics.getProviderStatus());

// Enable all providers
analytics.enableAllProviders();
console.log('All providers enabled:', analytics.getProviderStatus());

// Example: Update global properties
analytics.setGlobalProperties({
  userType: 'premium',
  sessionId: 'session-456',
});

// Example: Update configuration
analytics.updateConfig({
  providers: {
    mixpanel: {
      enabled: false, // Disable Mixpanel
      token: 'your-mixpanel-token',
      debug: false,
    },
  },
  globalProperties: {
    appVersion: '1.1.0', // Update app version
    environment: 'staging', // Change environment
  },
});

// Example: Get current configuration
const currentConfig = analytics.getConfig();
console.log('Current config:', currentConfig);

// Example: Get available providers
const availableProviders = analytics.getAvailableProviders();
console.log('Available providers:', availableProviders);
