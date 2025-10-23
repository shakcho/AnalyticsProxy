import { BaseProvider } from './BaseProvider';
import { AnalyticsEvent, AnalyticsUser, AnalyticsPageView } from '../types';

declare global {
  interface Window {
    mixpanel: any;
  }
}

export class MixpanelProvider extends BaseProvider {
  private token: string;
  private debug: boolean;
  private options: Record<string, any>;
  constructor(token: string, debug: boolean = false, options: Record<string, any> = {}) {
    super('Mixpanel');
    this.token = token;
    this.debug = debug;
    this.options = options;
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        // Check if Mixpanel is already loaded
        if (window.mixpanel && typeof window.mixpanel.init === 'function') {
          this.initializeMixpanel();
          return;
        }

        // Inject the official Mixpanel snippet
        this.injectMixpanelSnippet();
        
        // Initialize Mixpanel with token and options
        this.initializeMixpanel();
      } catch (error) {
        this.log('Failed to initialize Mixpanel', error);
      }
    }
  }

  private injectMixpanelSnippet(): void {
    /**
     * Official Mixpanel snippet (v1.2)
     * This creates a stub object that queues calls until the library loads,
     * then automatically loads the full Mixpanel library from CDN
     */
    (function(document: any, mixpanel: any) {
      // Only inject once
      if (!mixpanel.__SV) {
        let methods: string;
        let methodIndex: number;
        
        // Set up the global mixpanel object
        window.mixpanel = mixpanel;
        mixpanel._i = [];
        
        // Define the init function that will be called with token
        mixpanel.init = function(token: string, config: any, name: any) {
          // Helper to create stub methods that queue calls
          function createStubMethod(obj: any, methodName: any) {
            const parts = methodName.split(".");
            if (parts.length === 2) {
              obj = obj[parts[0]];
              methodName = parts[1];
            }
            obj[methodName] = function() {
              obj.push([methodName].concat(Array.prototype.slice.call(arguments, 0)));
            };
          }
          
          // Determine the instance to initialize
          let instance = mixpanel;
          if (typeof name !== "undefined") {
            instance = mixpanel[name] = [];
          } else {
            name = "mixpanel";
          }
          
          // Set up people tracking
          instance.people = instance.people || [];
          
          // toString methods for debugging
          instance.toString = function(includeStub: any) {
            let str = "mixpanel";
            if (name !== "mixpanel") {
              str += "." + name;
            }
            if (!includeStub) {
              str += " (stub)";
            }
            return str;
          };
          
          instance.people.toString = function() {
            return instance.toString(1) + ".people (stub)";
          };
          
          // List of all Mixpanel methods to stub
          methods = "disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders start_session_recording stop_session_recording people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove";
          
          const methodList = methods.split(" ");
          for (methodIndex = 0; methodIndex < methodList.length; methodIndex++) {
            createStubMethod(instance, methodList[methodIndex]);
          }
          
          // Set up group tracking methods
          const groupMethods = "set set_once union unset remove delete".split(" ");
          instance.get_group = function() {
            function addGroupMethod(methodName: any) {
              groupObj[methodName] = function() {
                instance.push([groupArgs, [methodName].concat(Array.prototype.slice.call(arguments, 0))]);
              };
            }
            
            const groupObj: any = {};
            const groupArgs = ["get_group"].concat(Array.prototype.slice.call(arguments, 0));
            
            for (let i = 0; i < groupMethods.length; i++) {
              addGroupMethod(groupMethods[i]);
            }
            
            return groupObj;
          };
          
          // Store initialization data
          mixpanel._i.push([token, config, name]);
        };
        
        // Version marker - required by Mixpanel
        mixpanel.__SV = 1.2;
        
        // Create and inject the script tag
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.async = true;
        
        // Use custom URL if defined, otherwise use CDN
        script.src = typeof (window as any).MIXPANEL_CUSTOM_LIB_URL !== "undefined"
          ? (window as any).MIXPANEL_CUSTOM_LIB_URL
          : (document.location.protocol === "file:" && 
             "//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//))
            ? "https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js"
            : "//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";
        
        // Insert script before the first existing script tag
        const firstScript = document.getElementsByTagName("script")[0];
        firstScript.parentNode.insertBefore(script, firstScript);
      }
    })(document, window.mixpanel || []);
  }

  private initializeMixpanel(): void {
    try {
      if (window.mixpanel && typeof window.mixpanel.init === 'function') {
        // Initialize Mixpanel with token and options
        window.mixpanel.init(this.token, {
          debug: this.debug,
          track_pageview: false, // We'll handle page views manually
          autocapture: this.options.autocapture !== undefined ? this.options.autocapture : true,
          record_sessions_percent: this.options.record_sessions_percent !== undefined 
            ? this.options.record_sessions_percent 
            : 100,
        });
        this.enable();
        this.log('Mixpanel initialized successfully');
      } else {
        this.log('Mixpanel object not available for initialization');
      }
    } catch (error) {
      this.log('Error initializing Mixpanel', error);
    }
  }

  protected trackEventInternal(event: AnalyticsEvent): void {
    if (typeof window !== 'undefined' && window.mixpanel) {
      try {
        window.mixpanel.track(event.name, event.properties);
        this.log('Event tracked successfully', event);
      } catch (error) {
        this.log('Error tracking event', error);
      }
    }
  }

  protected identifyUserInternal(user: AnalyticsUser): void {
    if (typeof window !== 'undefined' && window.mixpanel) {
      try {
        // Identify the user
        window.mixpanel.identify(user.id);
        
        if (user.properties) {
          // Map standard properties to Mixpanel's reserved properties (prefixed with $)
          const mixpanelProperties = this.mapToMixpanelProperties(user.properties);
          
          // Set user properties
          window.mixpanel.people.set(mixpanelProperties);
        }
        
        this.log('User identified successfully', user);
      } catch (error) {
        this.log('Error identifying user', error);
      }
    }
  }

  /**
   * Maps standard property names to Mixpanel's reserved property names
   * Mixpanel uses $ prefix for standard profile properties
   * https://docs.mixpanel.com/docs/data-structure/user-profiles#reserved-user-properties
   */
  private mapToMixpanelProperties(properties: Record<string, any>): Record<string, any> {
    const mapped: Record<string, any> = {};
    
    // Map of common property names to Mixpanel reserved properties
    const propertyMap: Record<string, string> = {
      'email': '$email',
      'name': '$name',
      'firstName': '$first_name',
      'first_name': '$first_name',
      'lastName': '$last_name',
      'last_name': '$last_name',
      'phone': '$phone',
      'avatar': '$avatar',
      'created': '$created',
      'city': '$city',
      'region': '$region',
      'country': '$country',
      'timezone': '$timezone',
    };
    
    // Map properties
    for (const [key, value] of Object.entries(properties)) {
      // Use mapped name if it exists, otherwise use original key
      const mappedKey = propertyMap[key] || key;
      mapped[mappedKey] = value;
    }
    
    return mapped;
  }

  protected trackPageViewInternal(pageView: AnalyticsPageView): void {
    if (typeof window !== 'undefined' && window.mixpanel) {
      try {
        // Track page view as a custom event
        window.mixpanel.track('Page View', {
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
    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.opt_in_tracking();
    }
  }

  public disable(): void {
    super.disable();
    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.opt_out_tracking();
    }
  }
}
