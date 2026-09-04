import browser from 'webextension-polyfill';
import type { HighlightIcon } from '../../shared/types';

const ICON_FILES: Record<HighlightIcon, string> = {
  alerta: 'icons/highlight/alerta.svg',
  informacao: 'icons/highlight/informacao.svg',
  nota: 'icons/highlight/nota.svg',
  perigo: 'icons/highlight/perigo.svg',
  sucesso: 'icons/highlight/sucesso.svg',
};

export function iconUrl(icon: HighlightIcon): string {
  return browser.runtime.getURL(ICON_FILES[icon]);
}

export function createIconImg(icon: HighlightIcon): HTMLImageElement {
  const img = document.createElement('img');
  img.src = iconUrl(icon);
  img.width = 16;
  img.height = 16;
  img.alt = '';
  return img;
}
