import type { HighlightIcon } from '../../shared/types';
import { markDismissed } from './mount';
import { createIconImg } from './icons';

export interface WidgetOptions {
  color: string;
  message?: string;
  icon?: HighlightIcon;
  ruleId: string;
}

export function renderWidget(shadow: ShadowRoot, { color, message, icon, ruleId }: WidgetOptions): void {
  let expanded = false;

  const badge = document.createElement('div');
  badge.style.position = 'fixed';
  badge.style.bottom = '16px';
  badge.style.right = '16px';
  badge.style.zIndex = '2147483647';
  badge.style.pointerEvents = 'auto';
  badge.style.background = color;
  badge.style.color = '#fff';
  badge.style.borderRadius = '8px';
  badge.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
  badge.style.font = '14px/1.4 system-ui, sans-serif';
  badge.style.cursor = 'pointer';
  badge.style.padding = '10px 14px';
  badge.style.maxWidth = '280px';

  const summary = document.createElement('div');
  summary.style.fontWeight = 'bold';
  summary.style.display = 'flex';
  summary.style.alignItems = 'center';
  summary.style.gap = '6px';
  if (icon) {
    summary.appendChild(createIconImg(icon));
  }
  summary.appendChild(document.createTextNode(icon ? '' : '⚠'));

  const full = document.createElement('div');
  full.textContent = message ?? '';
  full.style.marginTop = '8px';
  full.style.display = 'none';

  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '4px';
  closeButton.style.right = '6px';
  closeButton.style.background = 'transparent';
  closeButton.style.border = 'none';
  closeButton.style.color = '#fff';
  closeButton.style.cursor = 'pointer';
  closeButton.style.font = '16px/1 system-ui, sans-serif';
  closeButton.style.display = 'none';

  const wrapper = document.createElement('div');
  wrapper.style.position = 'relative';
  wrapper.appendChild(summary);
  wrapper.appendChild(full);
  wrapper.appendChild(closeButton);
  badge.appendChild(wrapper);

  badge.addEventListener('click', () => {
    expanded = !expanded;
    full.style.display = expanded ? 'block' : 'none';
    closeButton.style.display = expanded ? 'block' : 'none';
  });

  closeButton.addEventListener('click', (event) => {
    event.stopPropagation();
    markDismissed(ruleId);
    badge.remove();
  });

  shadow.appendChild(badge);
}
