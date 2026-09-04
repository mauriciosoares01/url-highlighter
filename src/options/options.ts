import { getConfig, setConfig, onConfigChanged } from '../shared/storage';
import type { ExtensionConfig, HighlightIcon, HighlightRule } from '../shared/types';

const TYPE_LABELS: Record<HighlightRule['highlight']['type'], string> = {
  bar: 'Barra',
  border: 'Borda',
  widget: 'Widget',
  modal: 'Modal',
};

const form = document.getElementById('rule-form') as HTMLFormElement;
const formTitle = document.getElementById('form-title') as HTMLHeadingElement;
const formSubmit = document.getElementById('form-submit') as HTMLButtonElement;
const formCancel = document.getElementById('form-cancel') as HTMLButtonElement;
const formError = document.getElementById('form-error') as HTMLDivElement;
const formWarning = document.getElementById('form-warning') as HTMLDivElement;

const nameInput = document.getElementById('field-name') as HTMLInputElement;
const urlPatternInput = document.getElementById('field-url-pattern') as HTMLInputElement;
const typeSelect = document.getElementById('field-type') as HTMLSelectElement;
const colorInput = document.getElementById('field-color') as HTMLInputElement;
const messageInput = document.getElementById('field-message') as HTMLTextAreaElement;
const iconSelect = document.getElementById('field-icon') as HTMLSelectElement;
const positionSelect = document.getElementById('field-position') as HTMLSelectElement;
const dismissibleCheckbox = document.getElementById('field-dismissible') as HTMLInputElement;
const enabledCheckbox = document.getElementById('field-enabled') as HTMLInputElement;

const messageLabel = document.getElementById('field-message-label') as HTMLLabelElement;
const iconLabel = document.getElementById('field-icon-label') as HTMLLabelElement;
const positionLabel = document.getElementById('field-position-label') as HTMLLabelElement;
const dismissibleLabel = document.getElementById('field-dismissible-label') as HTMLLabelElement;

const rulesBody = document.getElementById('rules-tbody') as HTMLTableSectionElement;

const exportButton = document.getElementById('export-btn') as HTMLButtonElement;
const importButton = document.getElementById('import-btn') as HTMLButtonElement;
const importFileInput = document.getElementById('import-file') as HTMLInputElement;

let editingId: string | null = null;

function updateFieldVisibility(type: HighlightRule['highlight']['type']): void {
  messageLabel.hidden = type === 'border';
  iconLabel.hidden = type === 'border';
  positionLabel.hidden = type !== 'bar';
  dismissibleLabel.hidden = type !== 'widget' && type !== 'modal';
}

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
  formSubmit.textContent = 'Salvar';
  formCancel.hidden = true;
  colorInput.value = '#e53e3e';
  updateFieldVisibility(typeSelect.value as HighlightRule['highlight']['type']);
}

function startEdit(rule: HighlightRule): void {
  editingId = rule.id;
  nameInput.value = rule.name;
  urlPatternInput.value = rule.urlPattern;
  typeSelect.value = rule.highlight.type;
  colorInput.value = rule.highlight.color;
  messageInput.value = rule.highlight.message ?? '';
  iconSelect.value = rule.highlight.icon ?? '';
  positionSelect.value = rule.highlight.position ?? 'top';
  dismissibleCheckbox.checked = rule.highlight.dismissible ?? true;
  enabledCheckbox.checked = rule.enabled;
  updateFieldVisibility(rule.highlight.type);

  formTitle.textContent = `Editar regra — ${rule.name}`;
  formSubmit.textContent = 'Salvar alterações';
  formCancel.hidden = false;
  clearMessages();
}

function button(label: string, onClick: () => void): HTMLButtonElement {
  const el = document.createElement('button');
  el.type = 'button';
  el.textContent = label;
  el.addEventListener('click', onClick);
  return el;
}

function renderRules(config: ExtensionConfig): void {
  const sorted = [...config.rules].sort((a, b) => a.priority - b.priority);
  rulesBody.innerHTML = '';

  sorted.forEach((rule, index) => {
    const tr = document.createElement('tr');

    const nameTd = document.createElement('td');
    nameTd.textContent = rule.name;

    const patternTd = document.createElement('td');
    patternTd.textContent = rule.urlPattern;

    const typeTd = document.createElement('td');
    typeTd.textContent = TYPE_LABELS[rule.highlight.type];

    const colorTd = document.createElement('td');
    const swatch = document.createElement('span');
    swatch.className = 'color-swatch';
    swatch.style.background = rule.highlight.color;
    colorTd.appendChild(swatch);

    const priorityTd = document.createElement('td');
    priorityTd.textContent = String(rule.priority);

    const enabledTd = document.createElement('td');
    const enabledToggle = document.createElement('input');
    enabledToggle.type = 'checkbox';
    enabledToggle.checked = rule.enabled;
    enabledToggle.addEventListener('change', () => {
      void toggleEnabled(rule.id, enabledToggle.checked);
    });
    enabledTd.appendChild(enabledToggle);

    const actionsTd = document.createElement('td');
    const upButton = button('↑', () => void moveRule(rule.id, 'up'));
    upButton.disabled = index === 0;
    const downButton = button('↓', () => void moveRule(rule.id, 'down'));
    downButton.disabled = index === sorted.length - 1;
    const editButton = button('Editar', () => startEdit(rule));
    const deleteButton = button('Excluir', () => void deleteRule(rule.id));
    actionsTd.append(upButton, downButton, editButton, deleteButton);

    tr.append(nameTd, patternTd, typeTd, colorTd, priorityTd, enabledTd, actionsTd);
    rulesBody.appendChild(tr);
  });
}

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
  const position = positionSelect.value as 'top' | 'bottom';
  const dismissible = dismissibleCheckbox.checked;
  const enabled = enabledCheckbox.checked;

  if (!name) {
    showError('Nome é obrigatório.');
    return;
  }
  if (!urlPattern) {
    showError('Padrão de URL é obrigatório.');
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
  if (type === 'bar') highlight.position = position;
  if (type === 'widget' || type === 'modal') highlight.dismissible = dismissible;

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
      showWarning('Este padrão casa com qualquer site.');
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

importButton.addEventListener('click', () => {
  importFileInput.click();
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

updateFieldVisibility(typeSelect.value as HighlightRule['highlight']['type']);

const prefillPattern = new URLSearchParams(location.search).get('prefillPattern');
if (prefillPattern) {
  urlPatternInput.value = prefillPattern;
}

getConfig().then(renderRules);
onConfigChanged(renderRules);
