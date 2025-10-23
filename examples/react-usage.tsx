import React, { useEffect, useState } from 'react';
import { AnalyticsProxy } from 'analytics-proxy';

// Analytics context
const AnalyticsContext = React.createContext<AnalyticsProxy | null>(null);

// Analytics provider component
export const AnalyticsProvider: React.FC<{
  children: React.ReactNode;
  config: any;
}> = ({ children, config }) => {
  const [analytics] = useState(() => new AnalyticsProxy(config));

  useEffect(() => {
    // Set global properties when component mounts
    analytics.setGlobalProperties({
      appVersion: '1.0.0',
      environment: process.env.NODE_ENV,
      platform: 'web',
    });
  }, [analytics]);

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
};

// Custom hook to use analytics
export const useAnalytics = () => {
  const analytics = React.useContext(AnalyticsContext);
  if (!analytics) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return analytics;
};

// Example component using analytics
const UserProfile: React.FC = () => {
  const analytics = useAnalytics();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Simulate user login
    const mockUser = {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
    };
    setUser(mockUser);

    // Identify user in analytics
    analytics.identifyUser({
      id: mockUser.id,
      properties: {
        name: mockUser.name,
        email: mockUser.email,
      },
    });

    // Track page view
    analytics.trackPageView({
      url: '/profile',
      title: 'User Profile',
      properties: {
        referrer: document.referrer,
      },
    });
  }, [analytics]);

  const handleProfileUpdate = () => {
    analytics.trackEvent({
      name: 'Profile Updated',
      properties: {
        userId: user?.id,
        timestamp: Date.now(),
      },
    });
  };

  const handleLogout = () => {
    analytics.trackEvent({
      name: 'User Logout',
      properties: {
        userId: user?.id,
        sessionDuration: Date.now() - (user?.loginTime || Date.now()),
      },
    });
  };

  return (
    <div>
      <h1>User Profile</h1>
      {user && (
        <div>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
          <button onClick={handleProfileUpdate}>Update Profile</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
};

// Example component for toggling analytics providers
const AnalyticsControls: React.FC = () => {
  const analytics = useAnalytics();
  const [providerStatus, setProviderStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setProviderStatus(analytics.getProviderStatus());
  }, [analytics]);

  const toggleProvider = (providerName: string) => {
    if (analytics.isProviderEnabled(providerName as any)) {
      analytics.disableProvider(providerName as any);
    } else {
      analytics.enableProvider(providerName as any);
    }
    setProviderStatus(analytics.getProviderStatus());
  };

  const toggleAllProviders = (enable: boolean) => {
    if (enable) {
      analytics.enableAllProviders();
    } else {
      analytics.disableAllProviders();
    }
    setProviderStatus(analytics.getProviderStatus());
  };

  return (
    <div>
      <h2>Analytics Controls</h2>
      <div>
        <button onClick={() => toggleAllProviders(true)}>Enable All</button>
        <button onClick={() => toggleAllProviders(false)}>Disable All</button>
      </div>
      <div>
        {Object.entries(providerStatus).map(([provider, enabled]) => (
          <label key={provider}>
            <input
              type="checkbox"
              checked={enabled}
              onChange={() => toggleProvider(provider)}
            />
            {provider}
          </label>
        ))}
      </div>
    </div>
  );
};

// Main app component
const App: React.FC = () => {
  const analyticsConfig = {
    providers: {
      mixpanel: {
        enabled: true,
        token: 'your-mixpanel-token',
        debug: process.env.NODE_ENV === 'development',
      },
      ga4: {
        enabled: true,
        measurementId: 'G-XXXXXXXXXX',
        debugMode: process.env.NODE_ENV === 'development',
      },
      logrocket: {
        enabled: false,
        appId: 'your-logrocket-app-id',
      },
      amplitude: {
        enabled: true,
        apiKey: 'your-amplitude-api-key',
      },
    },
    enableDebug: process.env.NODE_ENV === 'development',
  };

  return (
    <AnalyticsProvider config={analyticsConfig}>
      <div>
        <h1>Analytics Proxy Demo</h1>
        <AnalyticsControls />
        <UserProfile />
      </div>
    </AnalyticsProvider>
  );
};

export default App;
