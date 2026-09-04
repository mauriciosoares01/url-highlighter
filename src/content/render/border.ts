export interface BorderOptions {
  color: string;
}

export function renderBorder(shadow: ShadowRoot, { color }: BorderOptions): void {
  const border = document.createElement('div');
  border.style.position = 'fixed';
  border.style.inset = '0';
  border.style.boxShadow = `inset 0 0 0 6px ${color}`;
  border.style.zIndex = '2147483647';
  border.style.pointerEvents = 'none';

  shadow.appendChild(border);
}
