import browser from 'webextension-polyfill';
import { getConfig, setConfig } from '../shared/storage';
import { matchRule } from '../shared/rule-matcher';
import type { ExtensionConfig } from '../shared/types';

const statusEl = document.getElementById('status') as HTMLDivElement;
const toggle = document.getElementById('global-toggle') as HTMLInputElement;
const createRuleButton = document.getElementById('create-rule-btn') as HTMLButtonElement;
const openOptionsButton = document.getElementById('open-options-btn') as HTMLButtonElement;

let activeTabUrl: string | undefined;

function renderStatus(config: ExtensionConfig): void {
  statusEl.innerHTML = '';

  if (!config.globalEnabled) {
    statusEl.textContent = 'Highlights desativados globalmente';
    return;
  }

  const rule = activeTabUrl ? matchRule(activeTabUrl, config.rules) : null;
  if (!rule) {
    statusEl.textContent = 'Nenhuma regra ativa para esta aba';
    return;
  }

  const swatch = document.createElement('span');
  swatch.className = 'color-swatch';
  swatch.style.background = rule.highlight.color;

  const label = document.createElement('span');
  label.textContent = rule.name;

  statusEl.append(swatch, label);
}

async function init(): Promise<void> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  activeTabUrl = tab?.url;

  const config = await getConfig();
  toggle.checked = config.globalEnabled;
  renderStatus(config);
}

toggle.addEventListener('change', () => {
  void (async () => {
    const config = await getConfig();
    const updated = { ...config, globalEnabled: toggle.checked };
    await setConfig(updated);
    renderStatus(updated);
  })();
});

createRuleButton.addEventListener('click', () => {
  if (!activeTabUrl) return;
  const hostname = new URL(activeTabUrl).hostname;
  const pattern = `*://${hostname}/*`;
  void browser.tabs.create({
    url: browser.runtime.getURL('options.html') + '?prefillPattern=' + encodeURIComponent(pattern),
  });
});

openOptionsButton.addEventListener('click', () => {
  void browser.runtime.openOptionsPage();
});

void init();
