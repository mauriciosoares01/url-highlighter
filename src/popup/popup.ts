import browser from 'webextension-polyfill';
import { getConfig, setConfig } from '../shared/storage';
import { matchRule } from '../shared/rule-matcher';
import type { ExtensionConfig } from '../shared/types';

const statusEl = document.getElementById('status') as HTMLDivElement;
const toggle = document.getElementById('global-toggle') as HTMLButtonElement;
const createRuleButton = document.getElementById('create-rule-btn') as HTMLButtonElement;
const openOptionsButton = document.getElementById('open-options-btn') as HTMLButtonElement;

let activeTabUrl: string | undefined;

function initTheme(): void {
  const stored = localStorage.getItem('uh_theme');
  const isDark = stored === 'dark' || (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);
}

function setToggleChecked(checked: boolean): void {
  toggle.classList.toggle('checked', checked);
  toggle.setAttribute('aria-checked', String(checked));
}

function renderStatus(config: ExtensionConfig): void {
  statusEl.innerHTML = '';

  if (!config.globalEnabled) {
    statusEl.textContent = 'Highlights desativados globalmente';
    return;
  }

  const rule = activeTabUrl ? matchRule(activeTabUrl, config.rules) : null;
  if (!rule) {
    statusEl.textContent = 'Nenhum destaque ativo para essa página';
    return;
  }

  const swatch = document.createElement('span');
  swatch.className = 'color-swatch';
  swatch.style.background = rule.highlight.color;

  const label = document.createElement('span');
  label.className = 'rule-name';
  label.textContent = rule.name;

  statusEl.append(swatch, label);
}

async function init(): Promise<void> {
  initTheme();

  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  activeTabUrl = tab?.url;

  const config = await getConfig();
  setToggleChecked(config.globalEnabled);
  renderStatus(config);
}

toggle.addEventListener('click', () => {
  void (async () => {
    const config = await getConfig();
    const updated = { ...config, globalEnabled: !config.globalEnabled };
    await setConfig(updated);
    setToggleChecked(updated.globalEnabled);
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
