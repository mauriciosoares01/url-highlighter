import browser from 'webextension-polyfill';
import type { ExtensionConfig } from './types';

export const SCHEMA_VERSION = 1;

export const DEFAULT_CONFIG: ExtensionConfig = {
  schemaVersion: SCHEMA_VERSION,
  globalEnabled: true,
  rules: [],
};

export async function getConfig(): Promise<ExtensionConfig> {
  const stored = await browser.storage.local.get('config');
  return (stored.config as ExtensionConfig | undefined) ?? DEFAULT_CONFIG;
}

export async function setConfig(config: ExtensionConfig): Promise<void> {
  await browser.storage.local.set({ config });
}

export function onConfigChanged(callback: (config: ExtensionConfig) => void): void {
  browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local' || !changes.config) {
      return;
    }
    callback(changes.config.newValue as ExtensionConfig);
  });
}

export async function seedDefaultConfigIfEmpty(): Promise<void> {
  const stored = await browser.storage.local.get('config');
  if (stored.config === undefined) {
    await setConfig(DEFAULT_CONFIG);
  }
}
