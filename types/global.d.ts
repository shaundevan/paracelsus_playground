/**
 * Global type declarations for window extensions
 */

interface Window {
  pegasus?: {
    parallaxScroll?: (elem: HTMLElement, speed?: number) => void;
    [key: string]: any;
  };
}
