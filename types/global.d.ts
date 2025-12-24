/**
 * Global type declarations for window extensions
 */

interface Window {
  pegasus?: {
    parallaxScroll?: (elem: HTMLElement, speed?: number) => void;
    [key: string]: any;
  };
  __pegasusComponentsReady?: boolean;
  __alpineStartQueue?: Array<() => void>;
  __startAlpine?: () => void;
  __alpineInstance?: any;
  Alpine?: any;
}
