const phaseLabels = {
  online: '上网',
  handover: '交航',
  arrived: '到达目的国',
  signed: '签收'
};

const fieldOptions = {
  carrier: ['中塔物流', '安捷利美', 'USPS', 'DHL'],
  channel: ['ZT-CN-EMS', 'AJL-DHL-E', 'USPS Return', 'DHL Return'],
  mappingNo: ['物流单号', '跟踪号', '平台单号']
};

function createPhaseConfig(mode = 'keyword') {
  return {
    mode,
    selectedCount: 0,
    includeKeywords: [],
    excludeKeywords: [],
    warnings: { online: 0, handover: 0, arrived: 0, signed: 0 }
  };
}

const ruleConfigs = [
  {
    id: 'r1', carrier: '中塔物流', channel: 'ZT-CN-EMS', mappingNo: '物流单号', queryEnabled: true,
    updatedAt: '2026-07-22 10:18', operator: 'Fiona',
    phases: {
      online: { ...createPhaseConfig('keyword'), includeKeywords: ['已上网', '到达分拣中心'], excludeKeywords: ['退回'] },
      handover: { ...createPhaseConfig('keyword'), includeKeywords: ['已交航', '航班起飞'] },
      arrived: { ...createPhaseConfig('keyword'), includeKeywords: ['到达目的国', '进口处理中心'] },
      signed: { ...createPhaseConfig('keyword'), includeKeywords: ['已签收', '妥投'] }
    }
  },
  {
    id: 'r2', carrier: '安捷利美', channel: 'AJL-DHL-E', mappingNo: '跟踪号', queryEnabled: true,
    updatedAt: '2026-07-21 16:42', operator: 'Fiona',
    phases: {
      online: { ...createPhaseConfig('count'), selectedCount: 1 },
      handover: { ...createPhaseConfig('keyword'), includeKeywords: ['航班已起飞'] },
      arrived: { ...createPhaseConfig('keyword'), includeKeywords: ['已到达目的国'] },
      signed: { ...createPhaseConfig('keyword'), includeKeywords: ['签收'] }
    }
  }
];

let activeConfigId = 'r1';
let activeConfigTab = 'online';
let configIsNew = false;
let filterState = { carrier: '全部物流商', channel: '全部物流渠道', queryEnabled: '全部状态' };

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const keywordInput = (value) => [...new Set(String(value || '').split(/[，,\n]/).map((item) => item.trim()).filter(Boolean))];

function blankConfig() {
  return {
    id: `r-${Date.now()}`, carrier: '请选择', channel: '请选择', mappingNo: '请选择', queryEnabled: true,
    updatedAt: '未保存', operator: '当前用户', phases: { online: createPhaseConfig(), handover: createPhaseConfig(), arrived: createPhaseConfig(), signed: createPhaseConfig() }
  };
}

function currentConfig() { return ruleConfigs.find((rule) => rule.id === activeConfigId); }

function phaseSummary(config, phase) {
  const setting = config.phases[phase];
  if (setting.mode === 'count') return `第 ${setting.selectedCount || 0} 条轨迹`;
  return setting.includeKeywords.length ? `关键词 ${setting.includeKeywords.length} 条` : '未配置';
}

function renderRows() {
  const keyword = ($('#keywordInput')?.value || '').trim().toLowerCase();
  const rows = ruleConfigs.filter((rule) => {
    const keywordMatch = !keyword || `${rule.carrier} ${rule.channel} ${rule.mappingNo}`.toLowerCase().includes(keyword);
    const carrierMatch = filterState.carrier === '全部物流商' || rule.carrier === filterState.carrier;
    const channelMatch = filterState.channel === '全部物流渠道' || rule.channel === filterState.channel;
    const statusMatch = filterState.queryEnabled === '全部状态' || (filterState.queryEnabled === '已启用' ? rule.queryEnabled : !rule.queryEnabled);
    return keywordMatch && carrierMatch && channelMatch && statusMatch;
  });
  $('#ruleRows').innerHTML = rows.length ? rows.map((rule) => `<tr>
    <td><span class="rule-name">${rule.carrier}</span></td>
    <td>${rule.channel}</td>
    <td>${rule.mappingNo}</td>
    <td><span class="tag ${rule.queryEnabled ? 'tag--success' : 'tag--default'}">${rule.queryEnabled ? '启用' : '停用'}</span></td>
    <td><span class="cell-muted">${phaseSummary(rule, 'online')}</span></td>
    <td><span class="cell-muted">${phaseSummary(rule, 'handover')}</span></td>
    <td><span class="cell-muted">${phaseSummary(rule, 'arrived')}</span></td>
    <td><span class="cell-muted">${phaseSummary(rule, 'signed')}</span></td>
    <td>${rule.updatedAt}<span class="cell-muted">${rule.operator}</span></td>
    <td><button class="btn btn--sm btn--text btn--color-primary" data-action="edit-rule" data-id="${rule.id}">编辑</button></td>
  </tr>`).join('') : '<tr><td colspan="10"><div class="empty-state">未找到符合条件的规则，请调整筛选条件。</div></td></tr>';
  $('#resultNote').textContent = `共 ${rows.length} 条规则`;
}

function renderTags(items, kind) {
  return items.map((item, index) => `<span class="tag tag--default config-keyword-tag">${item}<button type="button" data-action="remove-keyword" data-kind="${kind}" data-index="${index}" aria-label="删除${item}">×</button></span>`).join('');
}

function renderConfigPanel() {
  const config = currentConfig();
  if (!config) return;
  const setting = config.phases[activeConfigTab];
  const label = phaseLabels[activeConfigTab];
  $$('.rule-config-tab').forEach((tab) => tab.classList.toggle('is-active', tab.dataset.tab === activeConfigTab));
  $('#ruleConfigPanel').innerHTML = `<section class="config-section"><div class="config-section__title">轨迹取值规则</div>
    <div class="config-count-row"><label class="config-radio"><input type="radio" name="trackMode" value="count" ${setting.mode === 'count' ? 'checked' : ''} data-action="change-track-mode" /> <span>选定</span></label><input class="input config-number" type="number" min="0" name="selectedCount" value="${setting.selectedCount || 0}" /> <span>条轨迹，判断为${label}轨迹</span></div>
    <div class="keyword-rule-box"><label class="config-radio config-radio--description"><input type="radio" name="trackMode" value="keyword" ${setting.mode === 'keyword' ? 'checked' : ''} data-action="change-track-mode" /><span>轨迹关键词（第一次抓到当前填写的关键词的某条轨迹，即为该条轨迹判断为${label}）</span></label>
      <div class="keyword-input-row"><span>轨迹关键词：</span><input class="input" id="includeKeywordInput" placeholder="请输入关键词" /><button class="btn btn--solid btn--color-primary btn--sm" type="button" data-action="add-keyword" data-kind="include">添加</button></div><div class="config-keyword-list">${renderTags(setting.includeKeywords, 'include')}</div>
      <div class="keyword-input-row"><span>排除关键词：</span><input class="input" id="excludeKeywordInput" placeholder="请输入排除关键词" /><button class="btn btn--solid btn--color-primary btn--sm" type="button" data-action="add-keyword" data-kind="exclude">添加</button></div><div class="config-keyword-list">${renderTags(setting.excludeKeywords, 'exclude')}</div>
    </div></section>
    <section class="config-section"><div class="config-section__title">预警取值规则</div>${['online', 'handover', 'arrived', 'signed'].map((phase) => `<div class="warning-rule-row"><span>已${phaseLabels[phase]}</span><input class="input config-number" type="number" min="0" data-warning="${phase}" value="${setting.warnings[phase] || 0}" /><span>天，提示未${phaseLabels[phase]}预警</span><small>（${phaseLabels[phase]}时效 = 当前时间 - 交运时间）</small></div>`).join('')}</section>`;
}

function fillConfigForm() {
  const config = currentConfig();
  if (!config) return;
  $('#commonRulesTitle').textContent = configIsNew ? '添加规则' : '编辑规则';
  $('#commonRuleUpdatedAt').textContent = config.updatedAt === '未保存' ? '新建规则 · 尚未保存' : `最近更新：${config.updatedAt} · ${config.operator}`;
  const form = $('#commonRuleForm');
  form.elements.carrier.value = config.carrier;
  form.elements.channel.value = config.channel;
  form.elements.mappingNo.value = config.mappingNo;
  form.elements.queryEnabled.checked = config.queryEnabled;
  renderConfigPanel();
}

function openCommonRules(id = activeConfigId, isNew = false) {
  activeConfigId = id;
  configIsNew = isNew;
  activeConfigTab = 'online';
  fillConfigForm();
  $('.c-modal').dataset.open = 'true';
  $('.c-modal-mask').dataset.open = 'true';
}

function closeCommonRules() {
  if (configIsNew) {
    const index = ruleConfigs.findIndex((rule) => rule.id === activeConfigId && rule.updatedAt === '未保存');
    if (index >= 0) ruleConfigs.splice(index, 1);
    configIsNew = false;
    renderRows();
  }
  $('.c-modal').dataset.open = 'false';
  $('.c-modal-mask').dataset.open = 'false';
}

function saveCommonRule(event) {
  event.preventDefault();
  const config = currentConfig();
  const form = event.currentTarget;
  if (!config || form.elements.carrier.value === '请选择' || form.elements.channel.value === '请选择' || form.elements.mappingNo.value === '请选择') { showToast('请先完善物流商、物流渠道和映射单号'); return; }
  config.carrier = form.elements.carrier.value;
  config.channel = form.elements.channel.value;
  config.mappingNo = form.elements.mappingNo.value;
  config.queryEnabled = form.elements.queryEnabled.checked;
  const activePhase = config.phases[activeConfigTab];
  activePhase.mode = form.elements.trackMode?.value || activePhase.mode;
  activePhase.selectedCount = Number(form.elements.selectedCount?.value || 0);
  $$('#ruleConfigPanel [data-warning]').forEach((input) => { activePhase.warnings[input.dataset.warning] = Number(input.value || 0); });
  config.updatedAt = new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-');
  config.operator = '当前用户';
  configIsNew = false;
  renderRows();
  closeCommonRules();
  showToast('规则已保存');
}

function cycleConfigField(field) {
  const input = $(`input[name="${field}"]`);
  const options = fieldOptions[field];
  const current = options.indexOf(input.value);
  input.value = options[(current + 1) % options.length];
}

function showToast(message) { const toast = $('#toast'); toast.textContent = message; toast.classList.add('is-visible'); window.clearTimeout(showToast.timer); showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 1800); }

document.addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  const id = event.target.closest('[data-id]')?.dataset.id;
  if (action === 'collapse') { const shell = $('.c-shell'); shell.dataset.collapsed = shell.dataset.collapsed === 'true' ? 'false' : 'true'; }
  if (action === 'open-common-rules') openCommonRules();
  if (action === 'new-rule') { const config = blankConfig(); ruleConfigs.push(config); openCommonRules(config.id, true); }
  if (action === 'edit-rule') openCommonRules(id, false);
  if (action === 'close-common-rules') closeCommonRules();
  if (action === 'select-config-tab') { activeConfigTab = event.target.closest('[data-tab]').dataset.tab; renderConfigPanel(); }
  if (action === 'cycle-config-field') cycleConfigField(event.target.closest('[data-field]').dataset.field);
  if (action === 'change-track-mode') { const config = currentConfig(); if (config) { config.phases[activeConfigTab].mode = event.target.value; renderConfigPanel(); } }
  if (action === 'add-keyword') {
    const kind = event.target.closest('[data-kind]').dataset.kind;
    const input = $(`#${kind}KeywordInput`);
    const value = input.value.trim();
    if (!value) return;
    currentConfig().phases[activeConfigTab][kind === 'include' ? 'includeKeywords' : 'excludeKeywords'].push(value);
    input.value = '';
    renderConfigPanel();
  }
  if (action === 'remove-keyword') { const target = event.target.closest('[data-action="remove-keyword"]'); const list = currentConfig().phases[activeConfigTab][target.dataset.kind === 'include' ? 'includeKeywords' : 'excludeKeywords']; list.splice(Number(target.dataset.index), 1); renderConfigPanel(); }
  if (action === 'refresh') { renderRows(); showToast('规则列表已刷新'); }
  if (action === 'search') { renderRows(); showToast('已按当前条件查询'); }
  if (action === 'reset') { $('#keywordInput').value = ''; filterState = { carrier: '全部物流商', channel: '全部物流渠道', queryEnabled: '全部状态' }; $$('.ui-select').forEach((item) => { item.querySelector('span').textContent = item.dataset.filter === 'carrier' ? '全部物流商' : item.dataset.filter === 'channel' ? '全部物流渠道' : '全部状态'; }); renderRows(); showToast('筛选条件已重置'); }
});

$$('[data-filter]').forEach((filter) => filter.addEventListener('click', () => {
  const values = filter.dataset.filter === 'carrier' ? ['全部物流商', ...fieldOptions.carrier] : filter.dataset.filter === 'channel' ? ['全部物流渠道', ...fieldOptions.channel] : ['全部状态', '已启用', '已停用'];
  const current = values.indexOf(filter.querySelector('span').textContent);
  const next = values[(current + 1) % values.length];
  filter.querySelector('span').textContent = next;
  filterState[filter.dataset.filter] = next;
}));

$('#keywordInput').addEventListener('keydown', (event) => { if (event.key === 'Enter') renderRows(); });
$('#commonRuleForm').addEventListener('submit', saveCommonRule);
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && $('.c-modal').dataset.open === 'true') closeCommonRules(); });
renderRows();
