import { createShadowHost, isDismissed } from './render/mount';
import { renderBar } from './render/bar';
import { renderBorder } from './render/border';
import { renderWidget } from './render/widget';
import { renderModal } from './render/modal';

export function debugRenderAllTypes(): void {
  renderBar(createShadowHost('__uh-debug-bar'), {
    color: '#c0392b',
    message: 'AMBIENTE BAR',
    icon: 'perigo',
    position: 'top',
  });

  renderBorder(createShadowHost('__uh-debug-border'), {
    color: '#8e44ad',
  });

  if (!isDismissed('debug-widget')) {
    renderWidget(createShadowHost('__uh-debug-widget'), {
      color: '#2980b9',
      message: 'AMBIENTE WIDGET',
      icon: 'informacao',
      ruleId: 'debug-widget',
    });
  }

  if (!isDismissed('debug-modal')) {
    renderModal(createShadowHost('__uh-debug-modal'), {
      color: '#e67e22',
      message: 'AMBIENTE MODAL',
      icon: 'alerta',
      ruleId: 'debug-modal',
    });
  }
}
