import React, { useEffect, useState } from 'react';
import { AnalyticsProxy } from 'analytics-proxy';

/**
 * Example React component demonstrating automatic script loading by providers
 * Each provider automatically loads its required script when initialized
 */
export const DynamicAnalyticsExample: React.FC = () => {
  const [analyticsProxy, setAnalyticsProxy] = useState<AnalyticsProxy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Configure analytics providers
        // Each provider will automatically load its script when initialized!
        // Vite exposes env vars via import.meta.env
        // Prefix with VITE_ to make them available in the browser
        // e.g., VITE_MIXPANEL_TOKEN, VITE_LOGROCKET_APP_ID, etc.
        const config = {
          enableDebug: true,
          globalProperties: {
            app_version: '1.0.0',
            environment: 'production'
          },
          providers: {
            mixpanel: {
              enabled: true,
              token: import.meta.env.VITE_MIXPANEL_TOKEN || 'your-mixpanel-token',
              debug: false,
              options: {
                autocapture: true,
                record_sessions_percent: 100
              }
            },
            logrocket: {
              enabled: true,
              appId: import.meta.env.VITE_LOGROCKET_APP_ID || 'your-logrocket-app-id',
            },
            amplitude: {
              enabled: true,
              apiKey: import.meta.env.VITE_AMPLITUDE_API_KEY || 'your-amplitude-api-key',
              options: {
                logLevel: 'INFO',
              },
            }
          }
        };

        // Initialize analytics proxy
        // Scripts are loaded automatically by each provider!
        const proxy = new AnalyticsProxy(config);
        setAnalyticsProxy(proxy);

        // Track initial page view
        proxy.trackPageView({
          url: window.location.href,
          title: document.title,
          properties: {
            referrer: document.referrer,
            user_agent: navigator.userAgent
          }
        });

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize analytics');
        setLoading(false);
      }
    };

    initializeAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  const handleTrackEvent = () => {
    if (analyticsProxy) {
      analyticsProxy.trackEvent({
        name: 'button_click_x',
        properties: {
          button_id: 'dynamic_example_button',
          timestamp: Date.now()
        }
      });
    }
  };

  const handleIdentifyUser = () => {
    if (analyticsProxy) {
      analyticsProxy.identifyUser({
        id: 'user_125',
        properties: {
          name: 'Sakti Test Email',
          email: 'sakti.test.email@gmail.com',
          plan: 'premium'
        }
      });
    }
  };

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Automatic Analytics Script Loading</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Each provider automatically loads its script when initialized. No manual script loading needed!
      </p>
      

      <div style={{ marginBottom: '20px' }}>
        <h3>Analytics Actions:</h3>
        <button 
          onClick={handleTrackEvent}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Track Event
        </button>
        
        <button 
          onClick={handleIdentifyUser}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Identify User
        </button>
      </div>

      <div>
        <h3>Provider Status:</h3>
        {analyticsProxy && (
          <pre style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '10px', 
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            {JSON.stringify(analyticsProxy.getProviderStatus(), null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default DynamicAnalyticsExample;
