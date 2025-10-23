// Main export - this is what consumers should use
export { AnalyticsProxy } from './AnalyticsProxy';


// Type exports for TypeScript users
export type {
  AnalyticsEvent,
  AnalyticsUser,
  AnalyticsPageView,
  ProviderConfig,
  AnalyticsProxyConfig,
  IAnalyticsProvider,
  ProviderName,
} from './types';

// Note: Individual providers (MixpanelProvider, GA4Provider, etc.) are NOT exported
// Consumers should use AnalyticsProxy which manages all providers internally
// This keeps the API simple and implementation details hidden
