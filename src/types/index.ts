export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: number;
}

export interface AnalyticsUser {
  id: string;
  properties?: Record<string, any>;
}

export interface AnalyticsPageView {
  url: string;
  title?: string;
  properties?: Record<string, any>;
}

export interface ProviderConfig {
  enabled: boolean;
  [key: string]: any;
}

export interface AnalyticsProxyConfig {
  providers: {
    mixpanel?: ProviderConfig & {
      token?: string;
      debug?: boolean;
    };
    ga4?: ProviderConfig & {
      measurementId?: string;
      debugMode?: boolean;
    };
    logrocket?: ProviderConfig & {
      appId?: string;
      options?: Record<string, any>;
    };
    amplitude?: ProviderConfig & {
      apiKey?: string;
      options?: Record<string, any>;
    };
  };
  globalProperties?: Record<string, any>;
  enableDebug?: boolean;
}

export interface IAnalyticsProvider {
  name: string;
  isEnabled(): boolean;
  enable(): void;
  disable(): void;
  trackEvent(event: AnalyticsEvent): void;
  identifyUser(user: AnalyticsUser): void;
  trackPageView(pageView: AnalyticsPageView): void;
  setGlobalProperties(properties: Record<string, any>): void;
}

export type ProviderName = 'mixpanel' | 'ga4' | 'logrocket' | 'amplitude';
