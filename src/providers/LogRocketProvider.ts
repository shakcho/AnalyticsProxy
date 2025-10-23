import { BaseProvider } from './BaseProvider';
import { AnalyticsEvent, AnalyticsUser, AnalyticsPageView } from '../types';
import { ScriptLoader } from '../utils/scriptLoader';

declare global {
  interface Window {
    LogRocket: any;
  }
}

export class LogRocketProvider extends BaseProvider {
  private appId: string;
  private options: Record<string, any>;

  constructor(appId: string, options: Record<string, any> = {}) {
    super('LogRocket');
    this.appId = appId;
    this.options = options;
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        // Dynamically load LogRocket script
        await ScriptLoader.loadScript({
          src: 'https://cdn.lr-ingest.com/LogRocket.min.js',
          async: true,
          onLoad: () => {
            // LogRocket needs a moment to set up after script loads
            this.initializeLogRocket();
          },
          onError: (error) => {
            this.log('Error loading LogRocket script', error);
          }
        });
      } catch (error) {
        this.log('Failed to initialize LogRocket', error);
      }
    }
  }

  private initializeLogRocket(): void {
    // Poll for LogRocket availability
    const checkLogRocket = (attempts = 0) => {
      if (window.LogRocket && typeof window.LogRocket.init === 'function') {
        try {
          window.LogRocket.init(this.appId, this.options);
          this.enable();
          this.log('LogRocket initialized successfully');
        } catch (error) {
          this.log('Error initializing LogRocket', error);
        }
      } else if (attempts < 10) {
        setTimeout(() => checkLogRocket(attempts + 1), 100);
      } else {
        this.log('LogRocket failed to initialize after multiple attempts');
      }
    };

    checkLogRocket();
  }

  protected trackEventInternal(event: AnalyticsEvent): void {
    if (typeof window !== 'undefined' && window.LogRocket) {
      try {
        window.LogRocket.track(event.name, event.properties);
        this.log('Event tracked successfully', event);
      } catch (error) {
        this.log('Error tracking event', error);
      }
    }
  }

  protected identifyUserInternal(user: AnalyticsUser): void {
    if (typeof window !== 'undefined' && window.LogRocket) {
      try {
        window.LogRocket.identify(user.id, user.properties);
        this.log('User identified successfully', user);
      } catch (error) {
        this.log('Error identifying user', error);
      }
    }
  }

  protected trackPageViewInternal(pageView: AnalyticsPageView): void {
    if (typeof window !== 'undefined' && window.LogRocket) {
      try {
        // LogRocket automatically tracks page views, but we can add custom properties
        if (pageView.properties) {
          window.LogRocket.track('Page View', {
            url: pageView.url,
            title: pageView.title,
            ...pageView.properties,
          });
        }
        this.log('Page view tracked successfully', pageView);
      } catch (error) {
        this.log('Error tracking page view', error);
      }
    }
  }

  public enable(): void {
    super.enable();
    this.log('LogRocket tracking enabled');
  }

  public disable(): void {
    super.disable();
    this.log('LogRocket tracking disabled');
  }
}
