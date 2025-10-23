# Analytics Proxy Examples

This directory contains example implementations demonstrating how to use the Analytics Proxy library.

## Setup

1. **Install dependencies:**

   ```bash
   cd examples
   npm install
   ```

2. **Configure environment variables (optional):**

   ```bash
   # Copy the example env file
   cp .env.example .env

   # Edit .env and add your actual API tokens
   # VITE_MIXPANEL_TOKEN=your-token-here
   # VITE_AMPLITUDE_API_KEY=your-api-key-here
   # etc.
   ```

   Note: Environment variables in Vite must be prefixed with `VITE_` to be accessible in the browser.

## Running the Examples

### Development Server

**Using Source Code (Default - Hot Reload):**

```bash
npm run dev
```

Uses the source from `../src` - any changes to source code will hot reload.

**Using Built Distribution:**

```bash
npm run dev:dist
```

Uses the compiled output from `../dist` - tests the actual build output.

From the root directory, you can also run:

```bash
# Use source (default)
npm run examples:dev

# Use dist build
npm run examples:dev:dist
```

This will start a local server at `http://localhost:3000` with hot module replacement.

### Build for Production

Build the examples:

```bash
npm run build
```

### Preview Production Build

Preview the production build:

```bash
npm run preview
```

## Available Examples

### 1. `basic-usage.ts`

Basic TypeScript usage example showing core features:

- Provider initialization
- Event tracking
- User identification
- Provider toggling

### 2. `react-usage.tsx`

React integration examples:

- Context provider pattern
- Custom hooks
- Component lifecycle integration
- State management with analytics

### 3. `react-dynamic-loading.tsx`

Advanced React example with dynamic script loading:

- Lazy loading analytics scripts
- Script loading hooks
- Loading states and error handling
- Conditional provider initialization

### 4. `demo.html`

Standalone HTML example:

- Vanilla JavaScript usage
- Direct browser integration
- No build tools required

## Notes

- Replace placeholder API keys and tokens with your actual credentials
- The examples use the source code from `../src` during development
- Check the browser console for analytics tracking logs when debug mode is enabled
- For production use, install the package from npm instead of using local source

## Analytics Provider Setup

To test with real analytics providers, you'll need:

1. **Mixpanel**: Get your project token from [mixpanel.com](https://mixpanel.com)
2. **Google Analytics 4**: Get your Measurement ID from [analytics.google.com](https://analytics.google.com)
3. **LogRocket**: Get your App ID from [logrocket.com](https://logrocket.com)
4. **Amplitude**: Get your API key from [amplitude.com](https://amplitude.com)

Replace the placeholder values in the example files with your actual credentials.
