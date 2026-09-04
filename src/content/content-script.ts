import { debugRenderAllTypes } from './debug-render-all';

if (new URLSearchParams(location.search).has('uh_debug')) {
  debugRenderAllTypes();
} else {
  console.log('[url-highlighter] content script ativo em', location.href);
}
