import browser from 'webextension-polyfill';
import { DEFAULT_CONFIG, getConfig, seedDefaultConfigIfEmpty, setConfig } from '../shared/storage';

console.log('[url-highlighter] background ativo');

browser.runtime.onInstalled.addListener(async () => {
  await seedDefaultConfigIfEmpty();
  console.log('[url-highlighter] config atual:', await getConfig());
});

Object.assign(self, { __uh: { getConfig, setConfig, DEFAULT_CONFIG } });
