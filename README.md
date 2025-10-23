# Analytics Proxy

A TypeScript frontend library that acts as a proxy for multiple analytics providers, allowing developers to easily toggle providers on/off and configure them during instantiation.

## Features

- **Multi-Provider Support**: Built-in support for Mixpanel, Google Analytics 4 (GA4), LogRocket, and Amplitude
- **Automatic Script Loading**: Each provider automatically loads its required script when initialized - no manual script tags needed!
- **Easy Toggle**: Enable/disable individual providers or all providers at once
- **Unified Interface**: Single API for tracking events, user identification, and page views across all providers
- **TypeScript Support**: Full TypeScript support with comprehensive type definitions
- **Flexible Configuration**: Configure providers during instantiation with runtime updates
- **Global Properties**: Set properties that are automatically included in all events
- **Debug Mode**: Built-in debugging and logging capabilities
- **Framework Agnostic**: Works with any JavaScript framework (React, Vue, Angular, vanilla JS, etc.)
- **Zero Dependencies**: No runtime dependencies, providers load via CDN dynamically

## Supported Providers

- **Mixpanel**: Event tracking, user identification, and custom properties
- **Google Analytics 4**: Event tracking, user properties, and page views
- **LogRocket**: Session recording, error tracking, and user identification
- **Amplitude**: Event tracking, user properties, and behavioral analytics

## Installation

```bash
npm install analytics-proxy
```

The library has **zero runtime dependencies**. Analytics providers (Mixpanel, Amplitude, GA4, LogRocket) are loaded dynamically via script tags and accessed through their global APIs.

### Optional Peer Dependencies

- **React** `>=16.8.0` - Only required if using the `useScriptLoader` hook
- Analytics provider SDKs are optional and loaded dynamically at runtime

## Quick Start

### Basic Usage

```typescript
import { AnalyticsProxy } from "analytics-proxy";

// Configure your analytics providers
const config = {
  providers: {
    mixpanel: {
      enabled: true,
      token: "your-mixpanel-token",
      debug: true,
    },
    ga4: {
      enabled: true,
      measurementId: "G-XXXXXXXXXX",
      debugMode: false,
    },
    logrocket: {
      enabled: false, // Disabled by default
      appId: "your-logrocket-app-id",
    },
    amplitude: {
      enabled: true,
      apiKey: "your-amplitude-api-key",
    },
  },
  globalProperties: {
    appVersion: "1.0.0",
    environment: "production",
  },
  enableDebug: true,
};

// Initialize the analytics proxy
// Each enabled provider will automatically load its script!
const analytics = new AnalyticsProxy(config);

// Track events
analytics.trackEvent({
  name: "Button Clicked",
  properties: {
    buttonId: "signup-button",
    page: "homepage",
  },
});

// Identify users
analytics.identifyUser({
  id: "user-123",
  properties: {
    name: "John Doe",
    email: "john@example.com",
  },
});

// Track page views
analytics.trackPageView({
  url: "/dashboard",
  title: "Dashboard",
});
```

### Toggle Providers

```typescript
// Disable a specific provider
analytics.disableProvider("mixpanel");

// Enable a provider
analytics.enableProvider("logrocket");

// Disable all providers
analytics.disableAllProviders();

// Enable all providers
analytics.enableAllProviders();

// Check provider status
const status = analytics.getProviderStatus();
console.log(status); // { mixpanel: false, ga4: true, logrocket: true, amplitude: true }
```

### Update Configuration

```typescript
// Update configuration at runtime
analytics.updateConfig({
  providers: {
    mixpanel: {
      enabled: false, // Disable Mixpanel
      token: "your-mixpanel-token",
    },
  },
  globalProperties: {
    appVersion: "1.1.0", // Update app version
  },
});
```

## React Integration

### Automatic Script Loading

The library automatically loads required scripts for each enabled provider. You don't need to manually load scripts!

```tsx
import React, { useEffect, useState } from "react";
import { AnalyticsProxy } from "analytics-proxy";

const AnalyticsExample = () => {
  const [analyticsProxy, setAnalyticsProxy] = useState<AnalyticsProxy | null>(
    null
  );

  useEffect(() => {
    // Simply initialize - scripts load automatically!
    const proxy = new AnalyticsProxy({
      providers: {
        amplitude: {
          enabled: true,
          apiKey: "your-api-key",
        },
        mixpanel: {
          enabled: true,
          token: "your-token",
        },
        ga4: {
          enabled: true,
          measurementId: "G-XXXXXXXXXX",
        },
      },
    });

    setAnalyticsProxy(proxy);
  }, []);

  return (
    <div>
      {/* Your component content */}
      {analyticsProxy && <p>Analytics ready!</p>}
    </div>
  );
};
```

### Manual Script Loading (Optional)

If you need fine-grained control over script loading, you can use the `ScriptLoader` utility:

```tsx
import { useScriptLoader } from "analytics-proxy";

const ManualLoadingExample = () => {
  const { loadScript, isScriptLoaded } = useScriptLoader();

  // Load scripts manually if needed
  useEffect(() => {
    loadScript({
      src: "https://example.com/custom-script.js",
      async: true,
    });
  }, []);

  return <div>Script loaded: {isScriptLoaded("...") ? "Yes" : "No"}</div>;
};
```

### Using the Analytics Provider

```tsx
import React from "react";
import { AnalyticsProvider, useAnalytics } from "analytics-proxy";

const App = () => {
  const config = {
    providers: {
      mixpanel: {
        enabled: true,
        token: "your-mixpanel-token",
      },
      ga4: {
        enabled: true,
        measurementId: "G-XXXXXXXXXX",
      },
    },
  };

  return (
    <AnalyticsProvider config={config}>
      <YourApp />
    </AnalyticsProvider>
  );
};

const YourComponent = () => {
  const analytics = useAnalytics();

  const handleClick = () => {
    analytics.trackEvent({
      name: "Button Clicked",
      properties: { buttonId: "my-button" },
    });
  };

  return <button onClick={handleClick}>Click Me</button>;
};
```

## Configuration Options

### Provider Configuration

Each provider can be configured with the following options:

#### Mixpanel

```typescript
mixpanel: {
  enabled: boolean;
  token: string;
  debug?: boolean;
}
```

#### Google Analytics 4

```typescript
ga4: {
  enabled: boolean;
  measurementId: string;
  debugMode?: boolean;
}
```

#### LogRocket

```typescript
logrocket: {
  enabled: boolean;
  appId: string;
  options?: Record<string, any>;
}
```

#### Amplitude

```typescript
amplitude: {
  enabled: boolean;
  apiKey: string;
  options?: Record<string, any>;
}
```

### Global Configuration

```typescript
{
  providers: { /* provider configs */ };
  globalProperties?: Record<string, any>; // Properties included in all events
  enableDebug?: boolean; // Enable debug logging
}
```

## API Reference

### Core Methods

#### `trackEvent(event: AnalyticsEvent)`

Track a custom event across all enabled providers.

```typescript
analytics.trackEvent({
  name: "Purchase Completed",
  properties: {
    amount: 99.99,
    currency: "USD",
    productId: "prod-123",
  },
  userId: "user-456",
  timestamp: Date.now(),
});
```

#### `identifyUser(user: AnalyticsUser)`

Identify a user across all enabled providers.

```typescript
analytics.identifyUser({
  id: "user-123",
  properties: {
    name: "John Doe",
    email: "john@example.com",
    plan: "premium",
  },
});
```

#### `trackPageView(pageView: AnalyticsPageView)`

Track a page view across all enabled providers.

```typescript
analytics.trackPageView({
  url: "/dashboard",
  title: "Dashboard",
  properties: {
    referrer: "google.com",
    utm_source: "email",
  },
});
```

### Provider Management

#### `enableProvider(providerName: ProviderName)`

Enable a specific analytics provider.

#### `disableProvider(providerName: ProviderName)`

Disable a specific analytics provider.

#### `enableAllProviders()`

Enable all configured analytics providers.

#### `disableAllProviders()`

Disable all analytics providers.

#### `isProviderEnabled(providerName: ProviderName): boolean`

Check if a specific provider is enabled.

#### `getProviderStatus(): Record<ProviderName, boolean>`

Get the status of all providers.

#### `getAvailableProviders(): ProviderName[]`

Get a list of all available provider names.

### Configuration Management

#### `setGlobalProperties(properties: Record<string, any>)`

Set global properties that will be included in all events.

#### `updateConfig(newConfig: Partial<AnalyticsProxyConfig>)`

Update the configuration at runtime.

#### `getConfig(): AnalyticsProxyConfig`

Get the current configuration.

### Script Loading Utilities

#### `ScriptLoader`

Utility class for dynamically loading external scripts with caching and error handling.

```typescript
import { ScriptLoader } from "analytics-proxy";

// Load a script
await ScriptLoader.loadScript({
  src: "https://example.com/script.js",
  async: true,
  onLoad: () => console.log("Script loaded"),
  onError: (error) => console.error("Script failed to load", error),
});

// Check if script is loaded
const isLoaded = ScriptLoader.isScriptLoaded("https://example.com/script.js");

// Get loading promise
const promise = ScriptLoader.getLoadingPromise("https://example.com/script.js");
```

#### `useScriptLoader()`

React hook for script loading functionality.

```typescript
import { useScriptLoader } from "analytics-proxy";

const MyComponent = () => {
  const { loadScript, isScriptLoaded } = useScriptLoader();

  // Use the hook methods
};
```

## TypeScript Support

The library is built with TypeScript and provides comprehensive type definitions:

```typescript
import type {
  AnalyticsEvent,
  AnalyticsUser,
  AnalyticsPageView,
  AnalyticsProxyConfig,
  ProviderName,
  IAnalyticsProvider,
} from "analytics-proxy";
```

## Error Handling

The library includes built-in error handling and logging:

- All provider operations are wrapped in try-catch blocks
- Errors are logged to the console in development mode
- Failed operations don't break the application flow
- Debug mode provides detailed logging for troubleshooting

## Browser Compatibility

- Modern browsers (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
- ES2020 support required
- DOM APIs for script loading and page view tracking

## Development

This project uses [Vite](https://vitejs.dev/) for fast building and development.

### Building the Library

```bash
npm run build
```

Builds the library for production using Vite. Outputs ES modules (`.mjs`) and CommonJS (`.cjs`) formats with TypeScript declarations.

### Development Mode

```bash
npm run dev
```

Runs Vite in watch mode for development, automatically rebuilding on file changes.

### Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

Tests are powered by [Vitest](https://vitest.dev/), a blazing fast unit test framework.

### Linting

```bash
# Check for linting issues
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

### Type Checking

```bash
npm run type-check
```

Runs TypeScript compiler to check for type errors without emitting files.

## Examples

The `examples/` directory contains working examples with their own dependencies. To run the examples:

```bash
cd examples
npm install
npm run dev
```

This will start a development server with live examples you can interact with. See [examples/README.md](examples/README.md) for more details.

## Dependency Structure

This project follows a clean dependency structure:

### Main Library (`package.json`)

- **Runtime dependencies**: None
- **Peer dependencies**: `react` (optional, for hooks)
- **Dev dependencies**: Build tools, testing frameworks, TypeScript types

### Examples (`examples/package.json`)

- **Dependencies**: React, analytics provider SDKs (Mixpanel, Amplitude, etc.)
- **Dev dependencies**: Vite, React plugins

This separation ensures:

- The library bundle stays minimal (no external dependencies bundled)
- Examples can use actual analytics SDKs for testing
- Users only install what they need

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions, please open an issue on GitHub or contact the maintainers.
