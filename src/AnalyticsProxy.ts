import { 
  AnalyticsProxyConfig, 
  AnalyticsEvent, 
  AnalyticsUser, 
  AnalyticsPageView, 
  ProviderName,
  IAnalyticsProvider 
} from './types';
import { MixpanelProvider } from './providers/MixpanelProvider';
import { GA4Provider } from './providers/GA4Provider';
import { LogRocketProvider } from './providers/LogRocketProvider';
import { AmplitudeProvider } from './providers/AmplitudeProvider';

export class AnalyticsProxy {
  private providers: Map<ProviderName, IAnalyticsProvider> = new Map();
  private config: AnalyticsProxyConfig;
  private globalProperties: Record<string, any> = {};

  constructor(config: AnalyticsProxyConfig) {
    this.config = config;
    this.initializeProviders();
    this.setGlobalProperties(config.globalProperties || {});
  }

  private initializeProviders(): void {
    // Initialize Mixpanel
    if (this.config.providers.mixpanel?.enabled && this.config.providers.mixpanel.token) {
      const mixpanelProvider = new MixpanelProvider(
        this.config.providers.mixpanel.token,
        this.config.providers.mixpanel.debug || false,
        this.config.providers.mixpanel.options || {}
      );
      this.providers.set('mixpanel', mixpanelProvider);
    }

    // Initialize GA4
    if (this.config.providers.ga4?.enabled && this.config.providers.ga4.measurementId) {
      const ga4Provider = new GA4Provider(
        this.config.providers.ga4.measurementId,
        this.config.providers.ga4.debugMode || false,
        this.config.providers.ga4.options || {}
      );
      this.providers.set('ga4', ga4Provider);
    }

    // Initialize LogRocket
    if (this.config.providers.logrocket?.enabled && this.config.providers.logrocket.appId) {
      const logrocketProvider = new LogRocketProvider(
        this.config.providers.logrocket.appId,
        this.config.providers.logrocket.options || {}
      );
      this.providers.set('logrocket', logrocketProvider);
    }

    // Initialize Amplitude
    if (this.config.providers.amplitude?.enabled && this.config.providers.amplitude.apiKey) {
      const amplitudeProvider = new AmplitudeProvider(
        this.config.providers.amplitude.apiKey,
        this.config.providers.amplitude.options || {}
      );
      this.providers.set('amplitude', amplitudeProvider);
    }

    if (this.config.enableDebug) {
      console.log('AnalyticsProxy initialized with providers:', Array.from(this.providers.keys()));
    }
  }

  /**
   * Track an event across all enabled providers
   */
  public trackEvent(event: AnalyticsEvent): void {
    this.providers.forEach((provider) => {
      if (provider.isEnabled()) {
        provider.trackEvent(event);
      }
    });
  }

  /**
   * Identify a user across all enabled providers
   */
  public identifyUser(user: AnalyticsUser): void {
    this.providers.forEach((provider) => {
      if (provider.isEnabled()) {
        provider.identifyUser(user);
      }
    });
  }

  /**
   * Track a page view across all enabled providers
   */
  public trackPageView(pageView: AnalyticsPageView): void {
    this.providers.forEach((provider) => {
      if (provider.isEnabled()) {
        provider.trackPageView(pageView);
      }
    });
  }

  /**
   * Set global properties that will be included in all events
   */
  public setGlobalProperties(properties: Record<string, any>): void {
    this.globalProperties = { ...this.globalProperties, ...properties };
    
    this.providers.forEach((provider) => {
      provider.setGlobalProperties(properties);
    });
  }

  /**
   * Enable a specific provider
   */
  public enableProvider(providerName: ProviderName): void {
    const provider = this.providers.get(providerName);
    if (provider) {
      provider.enable();
      if (this.config.enableDebug) {
        console.log(`Provider ${providerName} enabled`);
      }
    } else {
      console.warn(`Provider ${providerName} not found`);
    }
  }

  /**
   * Disable a specific provider
   */
  public disableProvider(providerName: ProviderName): void {
    const provider = this.providers.get(providerName);
    if (provider) {
      provider.disable();
      if (this.config.enableDebug) {
        console.log(`Provider ${providerName} disabled`);
      }
    } else {
      console.warn(`Provider ${providerName} not found`);
    }
  }

  /**
   * Enable all providers
   */
  public enableAllProviders(): void {
    this.providers.forEach((provider) => {
      provider.enable();
    });
    if (this.config.enableDebug) {
      console.log('All providers enabled');
    }
  }

  /**
   * Disable all providers
   */
  public disableAllProviders(): void {
    this.providers.forEach((provider) => {
      provider.disable();
    });
    if (this.config.enableDebug) {
      console.log('All providers disabled');
    }
  }

  /**
   * Get the status of all providers
   */
  public getProviderStatus(): Record<ProviderName, boolean> {
    const status: Record<ProviderName, boolean> = {} as Record<ProviderName, boolean>;
    
    this.providers.forEach((provider, name) => {
      status[name] = provider.isEnabled();
    });

    return status;
  }

  /**
   * Get a specific provider instance
   */
  public getProvider(providerName: ProviderName): IAnalyticsProvider | undefined {
    return this.providers.get(providerName);
  }

  /**
   * Check if a provider is enabled
   */
  public isProviderEnabled(providerName: ProviderName): boolean {
    const provider = this.providers.get(providerName);
    return provider ? provider.isEnabled() : false;
  }

  /**
   * Get all available provider names
   */
  public getAvailableProviders(): ProviderName[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Get the current configuration
   */
  public getConfig(): AnalyticsProxyConfig {
    return { ...this.config };
  }

  /**
   * Update configuration and reinitialize providers
   */
  public updateConfig(newConfig: Partial<AnalyticsProxyConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Update global properties if provided
    if (newConfig.globalProperties) {
      this.setGlobalProperties(newConfig.globalProperties);
    }

    // Reinitialize providers if provider config changed
    if (newConfig.providers) {
      this.providers.clear();
      this.initializeProviders();
    }

    if (this.config.enableDebug) {
      console.log('AnalyticsProxy configuration updated');
    }
  }
}
