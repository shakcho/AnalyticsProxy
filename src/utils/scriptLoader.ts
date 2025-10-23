/**
 * Utility for dynamically loading external scripts using React's dynamic import pattern
 */

export interface ScriptConfig {
  src: string;
  async?: boolean;
  defer?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export class ScriptLoader {
  private static loadedScripts: Set<string> = new Set();
  private static loadingPromises: Map<string, Promise<void>> = new Map();

  /**
   * Dynamically load a script with caching and error handling
   */
  public static async loadScript(config: ScriptConfig): Promise<void> {
    const { src, async = true, defer = false, onLoad, onError } = config;

    // Return cached promise if script is already loading
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    // Return immediately if script is already loaded
    if (this.loadedScripts.has(src)) {
      onLoad?.();
      return Promise.resolve();
    }

    const promise = new Promise<void>((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Script loading is only supported in browser environment'));
        return;
      }

      // Check if script already exists in DOM
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        this.loadedScripts.add(src);
        onLoad?.();
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = async;
      script.defer = defer;

      script.onload = () => {
        this.loadedScripts.add(src);
        onLoad?.();
        resolve();
      };

      script.onerror = (error) => {
        const errorObj = new Error(`Failed to load script: ${src}`);
        onError?.(errorObj);
        reject(errorObj);
      };

      document.head.appendChild(script);
    });

    this.loadingPromises.set(src, promise);
    return promise;
  }

  /**
   * Check if a script is already loaded
   */
  public static isScriptLoaded(src: string): boolean {
    return this.loadedScripts.has(src);
  }

  /**
   * Get the loading promise for a script
   */
  public static getLoadingPromise(src: string): Promise<void> | undefined {
    return this.loadingPromises.get(src);
  }

  /**
   * Clear the cache (useful for testing)
   */
  public static clearCache(): void {
    this.loadedScripts.clear();
    this.loadingPromises.clear();
  }
}

/**
 * React hook for dynamically loading scripts
 * Returns references to ScriptLoader static methods
 */
export function useScriptLoader() {
  // Return direct references to static methods
  // These are stable and don't change between renders
  return {
    loadScript: (config: ScriptConfig) => ScriptLoader.loadScript(config),
    isScriptLoaded: (src: string) => ScriptLoader.isScriptLoaded(src),
    getLoadingPromise: (src: string) => ScriptLoader.getLoadingPromise(src),
  };
}
