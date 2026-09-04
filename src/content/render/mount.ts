export function createShadowHost(id: string): ShadowRoot {
  const host = document.createElement('div');
  host.id = id;
  host.style.all = 'initial';
  document.documentElement.appendChild(host);
  return host.attachShadow({ mode: 'closed' });
}

export function isDismissed(ruleId: string): boolean {
  return sessionStorage.getItem('__uh_dismissed_' + ruleId) === '1';
}

export function markDismissed(ruleId: string): void {
  sessionStorage.setItem('__uh_dismissed_' + ruleId, '1');
}
