interface Window {
  gtag: (
    command: 'config' | 'set' | 'event',
    targetId: string,
    config?: Record<string, unknown> | undefined
  ) => void;
  dataLayer: unknown[];
} 