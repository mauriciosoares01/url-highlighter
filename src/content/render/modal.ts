import type { HighlightIcon } from '../../shared/types';
import { markDismissed } from './mount';
import { createIconImg } from './icons';

export interface ModalOptions {
  color: string;
  message?: string;
  icon?: HighlightIcon;
  dismissible?: boolean;
  ruleId: string;
}

export function renderModal(
  shadow: ShadowRoot,
  { color, message, icon, dismissible = true, ruleId }: ModalOptions,
): void {
  const backdrop = document.createElement('div');
  backdrop.style.position = 'fixed';
  backdrop.style.inset = '0';
  backdrop.style.zIndex = '2147483647';
  backdrop.style.pointerEvents = 'auto';
  backdrop.style.background = 'rgba(0, 0, 0, 0.6)';
  backdrop.style.display = 'flex';
  backdrop.style.alignItems = 'center';
  backdrop.style.justifyContent = 'center';

  const box = document.createElement('div');
  box.style.background = color;
  box.style.color = '#fff';
  box.style.borderRadius = '8px';
  box.style.padding = '24px 28px';
  box.style.maxWidth = '480px';
  box.style.font = '16px/1.5 system-ui, sans-serif';
  box.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)';
  box.style.textAlign = 'center';

  const text = document.createElement('div');
  text.style.marginBottom = '16px';
  text.style.display = 'flex';
  text.style.alignItems = 'center';
  text.style.justifyContent = 'center';
  text.style.gap = '8px';
  if (icon) {
    text.appendChild(createIconImg(icon));
  }
  text.appendChild(document.createTextNode(message ?? ''));

  box.appendChild(text);

  if (dismissible) {
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Fechar';
    closeButton.style.background = '#fff';
    closeButton.style.color = '#000';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.padding = '8px 20px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.font = '14px/1 system-ui, sans-serif';

    closeButton.addEventListener('click', () => {
      markDismissed(ruleId);
      backdrop.remove();
    });

    box.appendChild(closeButton);
  }

  backdrop.appendChild(box);
  shadow.appendChild(backdrop);
}
