import browser from 'webextension-polyfill';
import {
  DEFAULT_CONFIG,
  getConfig,
  onConfigChanged,
  seedDefaultConfigIfEmpty,
  setConfig,
} from '../shared/storage';
import { matchRule } from '../shared/rule-matcher';

console.log('[url-highlighter] background ativo');

browser.runtime.onInstalled.addListener(async () => {
  await seedDefaultConfigIfEmpty();
  console.log('[url-highlighter] config atual:', await getConfig());
});

async function updateBadgeForTab(tabId: number, url: string | undefined): Promise<void> {
  if (!url || !/^https?:\/\//.test(url)) {
    await browser.action.setBadgeText({ tabId, text: '' });
    return;
  }

  const config = await getConfig();
  const rule = config.globalEnabled ? matchRule(url, config.rules) : null;

  if (rule) {
    await browser.action.setBadgeBackgroundColor({ tabId, color: rule.highlight.color });
    await browser.action.setBadgeText({ tabId, text: '●' });
  } else {
    await browser.action.setBadgeText({ tabId, text: '' });
  }
}

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    void updateBadgeForTab(tabId, tab.url);
  }
});

browser.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await browser.tabs.get(tabId);
  await updateBadgeForTab(tabId, tab.url);
});

onConfigChanged(async () => {
  const tabs = await browser.tabs.query({});
  for (const tab of tabs) {
    if (tab.id !== undefined) {
      await updateBadgeForTab(tab.id, tab.url);
    }
  }
});

Object.assign(self, { __uh: { getConfig, setConfig, DEFAULT_CONFIG } });
