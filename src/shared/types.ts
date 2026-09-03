export type HighlightIcon = 'alerta' | 'informacao' | 'nota' | 'perigo' | 'sucesso';

export interface HighlightRule {
  id: string;
  name: string;
  enabled: boolean;
  urlPattern: string;
  priority: number;
  highlight: {
    type: 'bar' | 'border' | 'widget' | 'modal';
    color: string;
    message?: string;
    icon?: HighlightIcon;
    position?: 'top' | 'bottom';
    dismissible?: boolean;
  };
}

export interface ExtensionConfig {
  schemaVersion: number;
  globalEnabled: boolean;
  rules: HighlightRule[];
}
