import { getConfig, setConfig, onConfigChanged } from '../shared/storage';
import type { ExtensionConfig, HighlightIcon, HighlightRule } from '../shared/types';

const TYPE_LABELS: Record<HighlightRule['highlight']['type'], string> = {
  bar: 'Barra',
  border: 'Borda',
  widget: 'Widget',
  modal: 'Modal',
};

const TYPE_COLORS: Record<HighlightRule['highlight']['type'], string> = {
  bar: '#f59e0b',
  border: '#10b981',
  widget: '#8b5cf6',
  modal: '#3b82f6',
};

const ICON_META: Record<HighlightIcon, { label: string; emoji: string }> = {
  alerta: { label: 'Alerta', emoji: '⚠️' },
  informacao: { label: 'Informação', emoji: 'ℹ️' },
  nota: { label: 'Nota', emoji: '📝' },
  perigo: { label: 'Perigo', emoji: '🚫' },
  sucesso: { label: 'Sucesso', emoji: '✅' },
};

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

const themeToggle = document.getElementById('theme-toggle') as HTMLButtonElement;

const rulesCount = document.getElementById('rules-count') as HTMLSpanElement;
const rulesColumns = document.getElementById('rules-columns') as HTMLDivElement;
const rulesList = document.getElementById('rules-list') as HTMLDivElement;
const rulesEmpty = document.getElementById('rules-empty') as HTMLDivElement;

const exportButton = document.getElementById('export-btn') as HTMLButtonElement;
const importFileInput = document.getElementById('import-file') as HTMLInputElement;

const form = document.getElementById('rule-form') as HTMLFormElement;
const formTitle = document.getElementById('form-title') as HTMLHeadingElement;
const formSubtitle = document.getElementById('form-subtitle') as HTMLParagraphElement;
const formSubmit = document.getElementById('form-submit') as HTMLButtonElement;
const formCancel = document.getElementById('form-cancel') as HTMLButtonElement;
const formError = document.getElementById('form-error') as HTMLDivElement;
const formWarning = document.getElementById('form-warning') as HTMLDivElement;

const nameInput = document.getElementById('field-name') as HTMLInputElement;
const urlPatternInput = document.getElementById('field-url-pattern') as HTMLInputElement;
const typeSelect = document.getElementById('field-type') as HTMLSelectElement;
const colorInput = document.getElementById('field-color') as HTMLInputElement;
const colorHexInput = document.getElementById('field-color-hex') as HTMLInputElement;
const messageInput = document.getElementById('field-message') as HTMLTextAreaElement;
const iconSelect = document.getElementById('field-icon') as HTMLSelectElement;
const positionGroup = document.getElementById('field-position') as HTMLDivElement;
const positionButtons = Array.from(positionGroup.querySelectorAll<HTMLButtonElement>('.segmented-option'));
const dismissibleCheckbox = document.getElementById('field-dismissible') as HTMLInputElement;
const enabledCheckbox = document.getElementById('field-enabled') as HTMLInputElement;

const messageGroup = document.getElementById('field-message-group') as HTMLDivElement;
const iconGroup = document.getElementById('field-icon-group') as HTMLDivElement;
const positionFieldGroup = document.getElementById('field-position-group') as HTMLDivElement;
const dismissibleGroup = document.getElementById('field-dismissible-group') as HTMLLabelElement;

const deleteModal = document.getElementById('delete-modal') as HTMLDivElement;
const deleteModalText = document.getElementById('delete-modal-text') as HTMLParagraphElement;
const deleteCancelButton = document.getElementById('delete-cancel') as HTMLButtonElement;
const deleteConfirmButton = document.getElementById('delete-confirm') as HTMLButtonElement;

let editingId: string | null = null;
let selectedPosition: 'top' | 'bottom' = 'top';
let pendingDeleteId: string | null = null;

function applyTheme(theme: 'light' | 'dark'): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  themeToggle.textContent = theme === 'dark' ? '☀' : '☾';
  themeToggle.title = theme === 'dark' ? 'Modo claro' : 'Modo escuro';
  localStorage.setItem('uh_theme', theme);
}

function initTheme(): void {
  const stored = localStorage.getItem('uh_theme');
  if (stored === 'light' || stored === 'dark') {
    applyTheme(stored);
    return;
  }
  applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

themeToggle.addEventListener('click', () => {
  applyTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark');
});

function updateFieldVisibility(type: HighlightRule['highlight']['type']): void {
  messageGroup.hidden = type === 'border';
  iconGroup.hidden = type === 'border';
  positionFieldGroup.hidden = type !== 'bar' && type !== 'widget';
  dismissibleGroup.hidden = type === 'border';
}

function setPosition(value: 'top' | 'bottom'): void {
  selectedPosition = value;
  positionButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.value === value);
  });
}

positionButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    setPosition(btn.dataset.value === 'bottom' ? 'bottom' : 'top');
  });
});

colorInput.addEventListener('input', () => {
  colorHexInput.value = colorInput.value;
});

colorHexInput.addEventListener('input', () => {
  const value = colorHexInput.value.trim();
  if (HEX_COLOR_RE.test(value)) {
    colorInput.value = value;
  }
});

function showError(text: string): void {
  formError.textContent = text;
  formError.hidden = false;
}

function showWarning(text: string): void {
  formWarning.textContent = text;
  formWarning.hidden = false;
}

function clearMessages(): void {
  formError.hidden = true;
  formWarning.hidden = true;
}

function resetForm(): void {
  form.reset();
  editingId = null;
  formTitle.textContent = 'Nova regra';
  formSubtitle.textContent = 'Preencha os campos para adicionar uma regra';
  formSubmit.textContent = 'Salvar';
  formCancel.hidden = true;
  colorInput.value = '#3b82f6';
  colorHexInput.value = '#3b82f6';
  setPosition('top');
  updateFieldVisibility(typeSelect.value as HighlightRule['highlight']['type']);
  clearMessages();
}

function startEdit(rule: HighlightRule): void {
  editingId = rule.id;
  nameInput.value = rule.name;
  urlPatternInput.value = rule.urlPattern;
  typeSelect.value = rule.highlight.type;
  colorInput.value = rule.highlight.color;
  colorHexInput.value = rule.highlight.color;
  messageInput.value = rule.highlight.message ?? '';
  iconSelect.value = rule.highlight.icon ?? '';
  setPosition(rule.highlight.position ?? (rule.highlight.type === 'widget' ? 'bottom' : 'top'));
  dismissibleCheckbox.checked = rule.highlight.dismissible ?? true;
  enabledCheckbox.checked = rule.enabled;
  updateFieldVisibility(rule.highlight.type);

  formTitle.textContent = 'Editar regra';
  formSubtitle.textContent = `Editando: ${rule.name}`;
  formSubmit.textContent = 'Salvar alterações';
  formCancel.hidden = false;
  clearMessages();
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

function contrastColor(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#111827' : '#ffffff';
}

function createToggle(checked: boolean, onChange: (checked: boolean) => void): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = checked ? 'toggle-switch checked' : 'toggle-switch';
  btn.setAttribute('role', 'switch');
  btn.setAttribute('aria-checked', String(checked));
  const knob = document.createElement('span');
  knob.className = 'toggle-knob';
  btn.appendChild(knob);
  btn.addEventListener('click', () => {
    const next = !btn.classList.contains('checked');
    btn.classList.toggle('checked', next);
    btn.setAttribute('aria-checked', String(next));
    onChange(next);
  });
  return btn;
}

function iconButton(label: string, title: string, onClick: () => void, extraClass?: string): HTMLButtonElement {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = extraClass ? `btn-icon ${extraClass}` : 'btn-icon';
  el.title = title;
  el.textContent = label;
  el.addEventListener('click', onClick);
  return el;
}

function renderRules(config: ExtensionConfig): void {
  const sorted = [...config.rules].sort((a, b) => a.priority - b.priority);
  rulesList.innerHTML = '';

  rulesCount.hidden = sorted.length === 0;
  rulesCount.textContent = String(sorted.length);
  rulesColumns.hidden = sorted.length === 0;
  rulesEmpty.hidden = sorted.length > 0;

  sorted.forEach((rule, index) => {
    const row = document.createElement('div');
    row.className = 'rule-row rule-row-data';
    if (rule.id === editingId) row.classList.add('editing');
    if (!rule.enabled) row.classList.add('disabled');

    const nameCell = document.createElement('div');
    const nameText = document.createElement('div');
    nameText.className = 'rule-name';
    nameText.textContent = rule.name;
    nameCell.appendChild(nameText);

    const iconMeta = rule.highlight.icon ? ICON_META[rule.highlight.icon] : null;
    const showsPosition = rule.highlight.type === 'bar' || rule.highlight.type === 'widget';
    if (iconMeta || showsPosition) {
      const meta = document.createElement('div');
      meta.className = 'rule-name-meta';
      if (iconMeta) {
        const iconSpan = document.createElement('span');
        iconSpan.title = iconMeta.label;
        iconSpan.textContent = iconMeta.emoji;
        meta.appendChild(iconSpan);
      }
      if (showsPosition) {
        const posSpan = document.createElement('span');
        posSpan.textContent = rule.highlight.position === 'bottom' ? '↓' : '↑';
        meta.appendChild(posSpan);
      }
      nameCell.appendChild(meta);
    }

    const patternCell = document.createElement('div');
    const patternCode = document.createElement('code');
    patternCode.className = 'rule-pattern';
    patternCode.textContent = rule.urlPattern;
    patternCell.appendChild(patternCode);

    const typeCell = document.createElement('div');
    const typeBadge = document.createElement('span');
    typeBadge.className = 'type-badge';
    typeBadge.style.background = TYPE_COLORS[rule.highlight.type];
    typeBadge.style.color = contrastColor(TYPE_COLORS[rule.highlight.type]);
    typeBadge.textContent = TYPE_LABELS[rule.highlight.type];
    typeCell.appendChild(typeBadge);

    const colorCell = document.createElement('div');
    const swatch = document.createElement('span');
    swatch.className = 'color-swatch';
    swatch.style.background = rule.highlight.color;
    swatch.title = rule.highlight.color;
    colorCell.appendChild(swatch);

    const priorityCell = document.createElement('div');
    priorityCell.className = 'priority-value';
    priorityCell.textContent = `#${rule.priority}`;

    const enabledCell = document.createElement('div');
    enabledCell.appendChild(createToggle(rule.enabled, (checked) => void toggleEnabled(rule.id, checked)));

    const orderCell = document.createElement('div');
    orderCell.className = 'action-group';
    const upButton = iconButton('↑', 'Aumentar prioridade', () => void moveRule(rule.id, 'up'));
    upButton.disabled = index === 0;
    const downButton = iconButton('↓', 'Diminuir prioridade', () => void moveRule(rule.id, 'down'));
    downButton.disabled = index === sorted.length - 1;
    orderCell.append(upButton, downButton);

    const actionsCell = document.createElement('div');
    actionsCell.className = 'action-group';
    const editButton = iconButton('✎', 'Editar', () => startEdit(rule));
    const deleteButton = iconButton('✕', 'Excluir', () => openDeleteModal(rule.id, rule.name), 'danger');
    actionsCell.append(editButton, deleteButton);

    row.append(nameCell, patternCell, typeCell, colorCell, priorityCell, enabledCell, orderCell, actionsCell);
    rulesList.appendChild(row);
  });
}

function openDeleteModal(id: string, name: string): void {
  pendingDeleteId = id;
  deleteModalText.textContent = '';
  deleteModalText.append(
    document.createTextNode('Tem certeza que deseja excluir '),
    Object.assign(document.createElement('strong'), { textContent: `"${name}"` }),
    document.createTextNode('? Esta ação não pode ser desfeita.'),
  );
  deleteModal.hidden = false;
}

function closeDeleteModal(): void {
  pendingDeleteId = null;
  deleteModal.hidden = true;
}

deleteCancelButton.addEventListener('click', closeDeleteModal);

deleteConfirmButton.addEventListener('click', () => {
  if (pendingDeleteId) {
    void deleteRule(pendingDeleteId);
  }
  closeDeleteModal();
});

deleteModal.addEventListener('click', (event) => {
  if (event.target === deleteModal) closeDeleteModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !deleteModal.hidden) closeDeleteModal();
});

async function toggleEnabled(id: string, enabled: boolean): Promise<void> {
  const config = await getConfig();
  const rules = config.rules.map((r) => (r.id === id ? { ...r, enabled } : r));
  await setConfig({ ...config, rules });
}

async function deleteRule(id: string): Promise<void> {
  const config = await getConfig();
  const rules = config.rules.filter((r) => r.id !== id);
  await setConfig({ ...config, rules });
  if (editingId === id) {
    resetForm();
  }
}

async function moveRule(id: string, direction: 'up' | 'down'): Promise<void> {
  const config = await getConfig();
  const sorted = [...config.rules].sort((a, b) => a.priority - b.priority);
  const index = sorted.findIndex((r) => r.id === id);
  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= sorted.length) return;

  const current = sorted[index];
  const neighbor = sorted[swapIndex];
  const rules = config.rules.map((r) => {
    if (r.id === current.id) return { ...r, priority: neighbor.priority };
    if (r.id === neighbor.id) return { ...r, priority: current.priority };
    return r;
  });
  await setConfig({ ...config, rules });
}

typeSelect.addEventListener('change', () => {
  updateFieldVisibility(typeSelect.value as HighlightRule['highlight']['type']);
});

formCancel.addEventListener('click', () => {
  resetForm();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearMessages();

  const name = nameInput.value.trim();
  const urlPattern = urlPatternInput.value.trim();
  const type = typeSelect.value as HighlightRule['highlight']['type'];
  const color = colorInput.value;
  const message = messageInput.value.trim();
  const icon = iconSelect.value as HighlightIcon | '';
  const dismissible = dismissibleCheckbox.checked;
  const enabled = enabledCheckbox.checked;

  if (!name) {
    showError('O nome é obrigatório.');
    return;
  }
  if (!urlPattern) {
    showError('O padrão de URL é obrigatório.');
    return;
  }
  if ((type === 'bar' || type === 'widget' || type === 'modal') && !message) {
    showError('Mensagem é obrigatória para este tipo de destaque.');
    return;
  }

  const highlight: HighlightRule['highlight'] = { type, color };
  if (type !== 'border') {
    highlight.message = message;
    if (icon) highlight.icon = icon;
  }
  if (type === 'bar' || type === 'widget') highlight.position = selectedPosition;
  if (type === 'bar' || type === 'widget' || type === 'modal') highlight.dismissible = dismissible;

  void (async () => {
    const config = await getConfig();

    if (editingId) {
      const rules = config.rules.map((r) =>
        r.id === editingId ? { ...r, name, urlPattern, enabled, highlight } : r,
      );
      await setConfig({ ...config, rules });
    } else {
      const maxPriority = config.rules.reduce((max, r) => Math.max(max, r.priority), 0);
      const newRule: HighlightRule = {
        id: crypto.randomUUID(),
        name,
        enabled,
        urlPattern,
        priority: maxPriority + 1,
        highlight,
      };
      await setConfig({ ...config, rules: [...config.rules, newRule] });
    }

    resetForm();
    if (urlPattern === '*') {
      showWarning("O padrão '*' é genérico demais e vai corresponder a qualquer URL.");
    }
  })();
});

function validateConfigShape(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) {
    return 'Arquivo inválido: conteúdo não é um objeto JSON.';
  }
  const config = data as Record<string, unknown>;

  if (typeof config.schemaVersion !== 'number') {
    return 'Arquivo inválido: campo `schemaVersion` ausente ou malformado.';
  }
  if (typeof config.globalEnabled !== 'boolean') {
    return 'Arquivo inválido: campo `globalEnabled` ausente ou malformado.';
  }
  if (!Array.isArray(config.rules)) {
    return 'Arquivo inválido: campo `rules` ausente ou malformado.';
  }

  const rulesValid = config.rules.every((rule) => {
    if (typeof rule !== 'object' || rule === null) return false;
    const r = rule as Record<string, unknown>;
    if (typeof r.id !== 'string' || typeof r.name !== 'string') return false;
    if (typeof r.urlPattern !== 'string' || typeof r.priority !== 'number') return false;
    if (typeof r.highlight !== 'object' || r.highlight === null) return false;
    return typeof (r.highlight as Record<string, unknown>).type === 'string';
  });
  if (!rulesValid) {
    return 'Arquivo inválido: uma ou mais regras em `rules` estão malformadas.';
  }

  return null;
}

exportButton.addEventListener('click', () => {
  void (async () => {
    const config = await getConfig();
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'url-highlighter-config.json';
    a.click();
    URL.revokeObjectURL(url);
  })();
});

importFileInput.addEventListener('change', () => {
  const file = importFileInput.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    void (async () => {
      clearMessages();

      let parsed: unknown;
      try {
        parsed = JSON.parse(String(reader.result));
      } catch {
        showError('Arquivo inválido: não é um JSON válido.');
        importFileInput.value = '';
        return;
      }

      const shapeError = validateConfigShape(parsed);
      if (shapeError) {
        showError(shapeError);
        importFileInput.value = '';
        return;
      }

      const newConfig = parsed as ExtensionConfig;
      const currentConfig = await getConfig();
      const confirmed = confirm(
        `Isso substituirá ${currentConfig.rules.length} regra(s) atual(is) por ${newConfig.rules.length} regra(s) importada(s). Continuar?`,
      );
      importFileInput.value = '';
      if (!confirmed) return;

      await setConfig(newConfig);
    })();
  };
  reader.readAsText(file);
});

initTheme();
setPosition('top');
updateFieldVisibility(typeSelect.value as HighlightRule['highlight']['type']);

const prefillPattern = new URLSearchParams(location.search).get('prefillPattern');
if (prefillPattern) {
  urlPatternInput.value = prefillPattern;
}

getConfig().then(renderRules);
onConfigChanged(renderRules);
