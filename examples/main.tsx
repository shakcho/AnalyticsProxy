import React from 'react';
import ReactDOM from 'react-dom/client';
import { DynamicAnalyticsExample } from './react-dynamic-loading';

function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Analytics Proxy Examples</h1>
      <hr style={{ margin: '2rem 0' }} />
      
      <section>
        <h2>Dynamic Script Loading Example</h2>
        <DynamicAnalyticsExample />
      </section>
      
      <hr style={{ margin: '2rem 0' }} />
      
      <section>
        <p>
          <strong>Note:</strong> Check the browser console to see analytics tracking in action.
        </p>
        <p>
          For a standalone HTML example (no build tools), open <code>demo.html</code> directly in your browser.
        </p>
      </section>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

