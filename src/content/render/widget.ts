import type { HighlightIcon } from '../../shared/types';
import { markDismissed } from './mount';
import { createIconImg } from './icons';

export interface WidgetOptions {
  color: string;
  message?: string;
  icon?: HighlightIcon;
  dismissible?: boolean;
  position?: 'top' | 'bottom';
  ruleId: string;
}

export function renderWidget(
  shadow: ShadowRoot,
  { color, message, icon, dismissible = true, position = 'bottom', ruleId }: WidgetOptions,
): void {
  let expanded = false;

  const badge = document.createElement('div');
  badge.style.position = 'fixed';
  badge.style[position] = '16px';
  badge.style.right = '16px';
  badge.style.zIndex = '2147483647';
  badge.style.pointerEvents = 'auto';
  badge.style.background = color;
  badge.style.color = '#fff';
  badge.style.borderRadius = '13px';
  badge.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
  badge.style.font = '14px/1.4 system-ui, sans-serif';
  badge.style.cursor = 'pointer';
  badge.style.padding = '16px 22px';
  badge.style.maxWidth = '280px';

  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.alignItems = 'center';
  row.style.justifyContent = 'center';
  row.style.gap = '10px';

  const iconEl = icon
    ? createIconImg(icon, 26)
    : document.createTextNode('⚠');
  const iconWrapper = document.createElement('span');
  iconWrapper.style.display = 'flex';
  iconWrapper.style.alignItems = 'center';
  iconWrapper.style.fontSize = '22px';
  iconWrapper.style.flexShrink = '0';
  iconWrapper.appendChild(iconEl);

  const messageEl = document.createElement('span');
  messageEl.textContent = message ?? '';
  messageEl.style.display = 'none';
  messageEl.style.flex = '1 1 auto';
  messageEl.style.minWidth = '0';
  messageEl.style.textAlign = 'left';

  const closeButton = dismissible ? document.createElement('button') : null;
  if (closeButton) {
    closeButton.textContent = '×';
    closeButton.style.background = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.color = '#fff';
    closeButton.style.cursor = 'pointer';
    closeButton.style.font = '18px/1 system-ui, sans-serif';
    closeButton.style.padding = '0';
    closeButton.style.flexShrink = '0';
    closeButton.style.display = 'none';
  }

  row.appendChild(iconWrapper);
  row.appendChild(messageEl);
  if (closeButton) {
    row.appendChild(closeButton);
  }
  badge.appendChild(row);

  badge.addEventListener('click', () => {
    expanded = !expanded;
    row.style.justifyContent = expanded ? 'flex-start' : 'center';
    messageEl.style.display = expanded ? 'inline' : 'none';
    if (closeButton) {
      closeButton.style.display = expanded ? 'inline-flex' : 'none';
    }
  });

  closeButton?.addEventListener('click', (event) => {
    event.stopPropagation();
    markDismissed(ruleId);
    badge.remove();
  });

  shadow.appendChild(badge);
}
