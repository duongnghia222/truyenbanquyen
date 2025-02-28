interface Window {
  gtag: (
    command: 'config' | 'set' | 'event',
    targetId: string,
    config?: Record<string, any> | undefined
  ) => void;
  dataLayer: any[];
} 