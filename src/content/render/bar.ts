import type { HighlightIcon } from '../../shared/types';
import { createIconImg } from './icons';

export interface BarOptions {
  color: string;
  message?: string;
  icon?: HighlightIcon;
  position?: 'top' | 'bottom';
}

export function renderBar(shadow: ShadowRoot, { color, message, icon, position = 'top' }: BarOptions): void {
  const bar = document.createElement('div');
  bar.style.position = 'fixed';
  bar.style.left = '0';
  bar.style.right = '0';
  bar.style[position] = '0';
  bar.style.background = color;
  bar.style.color = '#fff';
  bar.style.zIndex = '2147483647';
  bar.style.pointerEvents = 'none';
  bar.style.padding = '8px 16px';
  bar.style.font = '14px/1.4 system-ui, sans-serif';
  bar.style.textAlign = 'center';
  bar.style.display = 'flex';
  bar.style.alignItems = 'center';
  bar.style.justifyContent = 'center';
  bar.style.gap = '8px';

  if (icon) {
    bar.appendChild(createIconImg(icon));
  }

  const text = document.createElement('span');
  text.textContent = message ?? '';
  bar.appendChild(text);

  shadow.appendChild(bar);
}
