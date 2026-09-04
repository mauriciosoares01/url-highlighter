export interface BarOptions {
  color: string;
  message?: string;
  position?: 'top' | 'bottom';
}

export function renderBar(shadow: ShadowRoot, { color, message, position = 'top' }: BarOptions): void {
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
  bar.textContent = message ?? '';

  shadow.appendChild(bar);
}
