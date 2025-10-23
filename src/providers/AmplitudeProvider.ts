import { BaseProvider } from './BaseProvider';
import { AnalyticsEvent, AnalyticsUser, AnalyticsPageView } from '../types';
import { ScriptLoader } from '../utils/scriptLoader';

declare global {
  interface Window {
    amplitude: any;
  }
}

export class AmplitudeProvider extends BaseProvider {
  private apiKey: string;
  private options: Record<string, any>;

  constructor(apiKey: string, options: Record<string, any> = {}) {
    super('Amplitude');
    this.apiKey = apiKey;
    this.options = options;
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        // Dynamically load Amplitude script
        await ScriptLoader.loadScript({
          src: 'https://cdn.amplitude.com/libs/amplitude-8.0.0-min.gz.js',
          async: true,
          onLoad: () => {
            // Amplitude needs a moment to set up after script loads
            this.initializeAmplitude();
          },
          onError: (error) => {
            this.log('Error loading Amplitude script', error);
          }
        });
      } catch (error) {
        this.log('Failed to initialize Amplitude', error);
      }
    }
  }

  private initializeAmplitude(): void {
    // Poll for Amplitude availability
    const checkAmplitude = (attempts = 0) => {
      if (window.amplitude && typeof window.amplitude.getInstance === 'function') {
        try {
          window.amplitude.getInstance().init(this.apiKey, undefined, this.options);
          this.enable();
          this.log('Amplitude initialized successfully');
        } catch (error) {
          this.log('Error initializing Amplitude', error);
        }
      } else if (attempts < 10) {
        setTimeout(() => checkAmplitude(attempts + 1), 100);
      } else {
        this.log('Amplitude failed to initialize after multiple attempts');
      }
    };

    checkAmplitude();
  }

  protected trackEventInternal(event: AnalyticsEvent): void {
    if (typeof window !== 'undefined' && window.amplitude) {
      try {
        window.amplitude.getInstance().logEvent(event.name, event.properties);
        this.log('Event tracked successfully', event);
      } catch (error) {
        this.log('Error tracking event', error);
      }
    }
  }

  protected identifyUserInternal(user: AnalyticsUser): void {
    if (typeof window !== 'undefined' && window.amplitude) {
      try {
        window.amplitude.getInstance().setUserId(user.id);
        if (user.properties) {
          window.amplitude.getInstance().setUserProperties(user.properties);
        }
        this.log('User identified successfully', user);
      } catch (error) {
        this.log('Error identifying user', error);
      }
    }
  }

  protected trackPageViewInternal(pageView: AnalyticsPageView): void {
    if (typeof window !== 'undefined' && window.amplitude) {
      try {
        // Track page view as a custom event
        window.amplitude.getInstance().logEvent('Page View', {
          url: pageView.url,
          title: pageView.title,
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
    this.log('Amplitude tracking enabled');
  }

  public disable(): void {
    super.disable();
    this.log('Amplitude tracking disabled');
  }
}
