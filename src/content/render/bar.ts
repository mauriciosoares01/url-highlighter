import type { HighlightIcon } from '../../shared/types';
import { createIconImg } from './icons';
import { markDismissed } from './mount';

export interface BarOptions {
  color: string;
  message?: string;
  icon?: HighlightIcon;
  position?: 'top' | 'bottom';
  dismissible?: boolean;
  ruleId: string;
}

export function renderBar(
  shadow: ShadowRoot,
  { color, message, icon, position = 'top', dismissible = true, ruleId }: BarOptions,
): () => void {
  const bar = document.createElement('div');
  bar.style.position = 'fixed';
  bar.style.left = '0';
  bar.style.right = '0';
  bar.style[position] = '0';
  bar.style.background = color;
  bar.style.color = '#fff';
  bar.style.zIndex = '2147483647';
  bar.style.pointerEvents = 'none';
  bar.style.padding = dismissible ? '8px 40px' : '8px 16px';
  bar.style.boxSizing = 'border-box';
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

  // position: fixed no `bar` já o torna um contexto de posicionamento para o
  // botão de fechar absoluto abaixo.
  const closeButton = dismissible ? document.createElement('button') : null;
  if (closeButton) {
    closeButton.textContent = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '50%';
    closeButton.style.right = '8px';
    closeButton.style.transform = 'translateY(-50%)';
    closeButton.style.background = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.color = '#fff';
    closeButton.style.cursor = 'pointer';
    closeButton.style.font = '18px/1 system-ui, sans-serif';
    closeButton.style.pointerEvents = 'auto';
    bar.appendChild(closeButton);
  }

  shadow.appendChild(bar);

  // Bar fica fixa (não some ao rolar), mas empurra o conteúdo real da página
  // via padding no <html> — a altura é medida no elemento real (fora da shadow
  // root, então acessível mesmo com mode: "closed") e reajustada em resize/wrap.
  const offsetProperty = position === 'bottom' ? 'paddingBottom' : 'paddingTop';
  const html = document.documentElement;

  const applyOffset = (): void => {
    html.style[offsetProperty] = `${bar.getBoundingClientRect().height}px`;
  };
  applyOffset();

  const resizeObserver = new ResizeObserver(applyOffset);
  resizeObserver.observe(bar);

  const cleanup = (): void => {
    resizeObserver.disconnect();
    html.style[offsetProperty] = '';
  };

  closeButton?.addEventListener('click', () => {
    markDismissed(ruleId);
    cleanup();
    shadow.host.remove();
  });

  return cleanup;
}
