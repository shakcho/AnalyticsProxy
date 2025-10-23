import { IAnalyticsProvider, AnalyticsEvent, AnalyticsUser, AnalyticsPageView } from '../types';

export abstract class BaseProvider implements IAnalyticsProvider {
  public name: string;
  protected enabled: boolean = false;
  protected globalProperties: Record<string, any> = {};

  constructor(name: string) {
    this.name = name;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public enable(): void {
    this.enabled = true;
    this.log('Provider enabled');
  }

  public disable(): void {
    this.enabled = false;
    this.log('Provider disabled');
  }

  public setGlobalProperties(properties: Record<string, any>): void {
    this.globalProperties = { ...this.globalProperties, ...properties };
    this.log('Global properties updated', properties);
  }

  public trackEvent(event: AnalyticsEvent): void {
    if (!this.enabled) {
      this.log('Provider is disabled, skipping event', event);
      return;
    }

    // Merge global properties with event properties
    const enrichedEvent = {
      ...event,
      properties: {
        ...this.globalProperties,
        ...event.properties,
      },
    };

    this.log('Tracking event', enrichedEvent);
    this.trackEventInternal(enrichedEvent);
  }

  public identifyUser(user: AnalyticsUser): void {
    if (!this.enabled) {
      this.log('Provider is disabled, skipping user identification', user);
      return;
    }

    this.log('Identifying user', user);
    this.identifyUserInternal(user);
  }

  public trackPageView(pageView: AnalyticsPageView): void {
    if (!this.enabled) {
      this.log('Provider is disabled, skipping page view', pageView);
      return;
    }

    // Merge global properties with page view properties
    const enrichedPageView = {
      ...pageView,
      properties: {
        ...this.globalProperties,
        ...pageView.properties,
      },
    };

    this.log('Tracking page view', enrichedPageView);
    this.trackPageViewInternal(enrichedPageView);
  }

  protected log(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${this.name}] ${message}`, data);
    }
  }

  protected abstract trackEventInternal(event: AnalyticsEvent): void;
  protected abstract identifyUserInternal(user: AnalyticsUser): void;
  protected abstract trackPageViewInternal(pageView: AnalyticsPageView): void;
}
