import { BaseProvider } from './BaseProvider';
import { AnalyticsEvent, AnalyticsUser, AnalyticsPageView } from '../types';
import { ScriptLoader } from '../utils/scriptLoader';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export class GA4Provider extends BaseProvider {
  private measurementId: string;
  private debugMode: boolean;
  private options: Record<string, any>;

  constructor(measurementId: string, debugMode: boolean = false, options: Record<string, any> = {}) {
    super('GA4');
    this.measurementId = measurementId;
    this.debugMode = debugMode;
    this.options = options;
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        window.gtag = function() {
          window.dataLayer.push(arguments);
        };

        // Dynamically load GA4 script
        await ScriptLoader.loadScript({
          src: `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`,
          async: true,
          onLoad: () => {
            // GA4 needs a moment to set up after script loads
            this.initializeGA4();
          },
          onError: (error) => {
            this.log('Error loading GA4 script', error);
          }
        });
      } catch (error) {
        this.log('Failed to initialize GA4', error);
      }
    }
  }

  private initializeGA4(): void {
    // Poll for gtag availability
    const checkGA4 = (attempts = 0) => {
      if (typeof window.gtag === 'function') {
        try {
          // Configure GA4
          window.gtag('js', new Date());
          window.gtag('config', this.measurementId, {
            debug_mode: this.debugMode,
            send_page_view: false, // We'll handle page views manually
          });
          this.enable();
          this.log('GA4 initialized successfully');
        } catch (error) {
          this.log('Error initializing GA4', error);
        }
      } else if (attempts < 10) {
        setTimeout(() => checkGA4(attempts + 1), 100);
      } else {
        this.log('GA4 failed to initialize after multiple attempts');
      }
    };

    checkGA4();
  }

  protected trackEventInternal(event: AnalyticsEvent): void {
    if (typeof window !== 'undefined' && window.gtag) {
      try {
        window.gtag('event', event.name, {
          event_category: 'custom',
          event_label: event.name,
          ...event.properties,
        });
        this.log('Event tracked successfully', event);
      } catch (error) {
        this.log('Error tracking event', error);
      }
    }
  }

  protected identifyUserInternal(user: AnalyticsUser): void {
    if (typeof window !== 'undefined' && window.gtag) {
      try {
        // Set user ID for GA4
        window.gtag('config', this.measurementId, {
          user_id: user.id,
        });

        // Set user properties if available
        if (user.properties) {
          window.gtag('set', 'user_properties', user.properties);
        }

        this.log('User identified successfully', user);
      } catch (error) {
        this.log('Error identifying user', error);
      }
    }
  }

  protected trackPageViewInternal(pageView: AnalyticsPageView): void {
    if (typeof window !== 'undefined' && window.gtag) {
      try {
        window.gtag('config', this.measurementId, {
          page_title: pageView.title,
          page_location: pageView.url,
          ...pageView.properties,
        });
        this.log('Page view tracked successfully', pageView);
      } catch (error) {
        this.log('Error tracking page view', error);
      }
    }
  }

  public enable(): void {
    super.enable();
    this.log('GA4 tracking enabled');
  }

  public disable(): void {
    super.disable();
    this.log('GA4 tracking disabled');
  }
}
