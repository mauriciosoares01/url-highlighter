import { getConfig, onConfigChanged } from '../shared/storage';
import { matchRule } from '../shared/rule-matcher';
import type { ExtensionConfig, HighlightRule } from '../shared/types';
import { createShadowHost, isDismissed } from './render/mount';
import { renderBar } from './render/bar';
import { renderBorder } from './render/border';
import { renderWidget } from './render/widget';
import { renderModal } from './render/modal';

let currentShadow: ShadowRoot | null = null;
let currentCleanup: (() => void) | null = null;

function unmount(): void {
  currentCleanup?.();
  currentCleanup = null;
  currentShadow?.host.remove();
  currentShadow = null;
}

function mountRule(rule: HighlightRule): void {
  const { type, color, message, icon, position, dismissible } = rule.highlight;

  if ((type === 'bar' || type === 'widget' || type === 'modal') && isDismissed(rule.id)) {
    return;
  }

  const shadow = createShadowHost('__uh-root');
  currentShadow = shadow;

  switch (type) {
    case 'bar':
      currentCleanup = renderBar(shadow, { color, message, icon, position, dismissible, ruleId: rule.id });
      break;
    case 'border':
      renderBorder(shadow, { color });
      break;
    case 'widget':
      renderWidget(shadow, { color, message, icon, dismissible, position, ruleId: rule.id });
      break;
    case 'modal':
      renderModal(shadow, { color, message, icon, dismissible, ruleId: rule.id });
      break;
  }
}

function applyConfig(config: ExtensionConfig): void {
  unmount();

  if (!config.globalEnabled) return;

  const rule = matchRule(location.href, config.rules);
  if (!rule) return;

  mountRule(rule);
}

getConfig().then(applyConfig);
onConfigChanged(applyConfig);
