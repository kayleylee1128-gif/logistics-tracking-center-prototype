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

function createSpecialNodeRule(includeKeywords = [], excludeKeywords = []) {
  return { includeKeywords: [...includeKeywords], excludeKeywords: [...excludeKeywords] };
}

const returnNodeIds = ['returning', 'return-received'];
const exceptionTagSeed = [
  { id: 'delivery-failed', name: '派送失败', includeKeywords: ['派送失败', 'delivery failed', 'attempted delivery'], excludeKeywords: ['已签收', 'delivered'] },
  { id: 'package-lost', name: '丢件', includeKeywords: ['丢件', 'lost', 'missing package'], excludeKeywords: ['找到包裹', 'located'] }
];

function createExceptionTags() {
  return exceptionTagSeed.map((tag) => ({ ...tag, includeKeywords: [...tag.includeKeywords], excludeKeywords: [...tag.excludeKeywords] }));
}

function createSpecialConfig() {
  return {
    returnNodes: {
      returning: createSpecialNodeRule(),
      'return-received': createSpecialNodeRule()
    },
    exceptionTags: createExceptionTags().map((tag) => ({ ...tag, includeKeywords: [], excludeKeywords: [] }))
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

const commonNodes = [
  { id: 'returning', name: '退回中', code: 'RETURNING', direction: '正向 / 逆向', phase: '退回', description: '包裹正在退回途中，尚未完成退件仓签收。', terminal: '否', enabled: '启用', updatedAt: '2026-07-22 10:18', operator: 'Fiona' },
  { id: 'return-received', name: '退回签收', code: 'RETURN_RECEIVED', direction: '逆向', phase: '退回', description: '退件仓已收到退回包裹，可进入后续入库或质检流程。', terminal: '是', enabled: '启用', updatedAt: '2026-07-22 10:18', operator: 'Fiona' },
  { id: 'package-exception', name: '包裹异常', code: 'PACKAGE_EXCEPTION', direction: '正向 / 逆向', phase: '异常', description: '包裹发生需要运营关注的异常，具体异常类型通过标签细分。', terminal: '否', enabled: '启用', updatedAt: '2026-08-08 10:54', operator: 'Fiona' },
  { id: 'package-lost', name: '丢件', code: 'PACKAGE_LOST', direction: '正向 / 逆向', phase: '异常', description: '承运商确认包裹丢失或无法找回。', terminal: '是', enabled: '启用', updatedAt: '2026-07-21 16:42', operator: 'Fiona' },
  { id: 'package-damaged', name: '破损', code: 'PACKAGE_DAMAGED', direction: '正向 / 逆向', phase: '异常', description: '承运商或仓库确认包裹外包装或商品破损。', terminal: '是', enabled: '启用', updatedAt: '2026-07-21 16:42', operator: 'Fiona' },
  { id: 'delivery-failed', name: '派送失败', code: 'DELIVERY_FAILED', direction: '正向', phase: '异常', description: '末端派送未成功，需重新派送或人工处理。', terminal: '否', enabled: '启用', updatedAt: '2026-07-21 16:42', operator: 'Fiona' }
];

function ensureSpecialConfig(config) {
  config.returnNodes = config.returnNodes || {};
  const seed = createSpecialConfig();
  returnNodeIds.forEach((id) => {
    config.returnNodes[id] = config.returnNodes[id] || seed.returnNodes[id];
    const rule = config.returnNodes[id];
    delete rule.inheritCommon;
  });
  delete config.returnNodes['package-exception'];
  if (config.exceptionTags && !Array.isArray(config.exceptionTags) && Array.isArray(config.exceptionTags.tags)) config.exceptionTags = config.exceptionTags.tags;
  config.exceptionTags = Array.isArray(config.exceptionTags) ? config.exceptionTags.filter((tag) => exceptionTagSeed.some((item) => item.id === tag.id)) : seed.exceptionTags;
  return config;
}

let activeConfigId = 'r1';
let activeConfigTab = 'online';
let configIsNew = false;
let filterState = { carrier: '全部物流商', channel: '全部物流渠道', queryEnabled: '全部状态' };
let annotationMode = true;
let annotationFilter = '全部';
let activeAnnotationId = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const keywordInput = (value) => [...new Set(String(value || '').split(/[，,\n]/).map((item) => item.trim()).filter(Boolean))];

function blankConfig() {
  return {
    id: `r-${Date.now()}`, carrier: '请选择', channel: '请选择', mappingNo: '请选择', queryEnabled: true,
    updatedAt: '未保存', operator: '当前用户', phases: { online: createPhaseConfig(), handover: createPhaseConfig(), arrived: createPhaseConfig(), signed: createPhaseConfig() },
    ...createSpecialConfig()
  };
}

function currentConfig() { return ruleConfigs.find((rule) => rule.id === activeConfigId); }

function phaseSummary(config, phase) {
  const setting = config.phases[phase];
  if (setting.mode === 'count') return `第 ${setting.selectedCount || 0} 条轨迹`;
  return setting.includeKeywords.length ? `关键词 ${setting.includeKeywords.length} 条` : '未配置';
}

function legacyRuleSummary(config, phase) {
  const setting = config.phases[phase];
  if (setting.mode === 'count') return `选定第${setting.selectedCount || 0}条轨迹判断为${phaseLabels[phase]}`;
  if (!setting.includeKeywords.length) return `选定第0条轨迹判断为${phaseLabels[phase]}`;
  return `关键词：${setting.includeKeywords.slice(0, 2).join('、')}`;
}

const annotations = [
  { id: 1, type: '页面', title: '物流规则页面', target: 'pageHeader', description: '模块目的：维护渠道规则与标准节点。适用角色为物流运营和管理员；入口来自物流配置菜单，上游是承运商轨迹，下游是物流轨迹中心和异常报表。' },
  { id: 2, type: '字段', title: '渠道筛选条件', target: 'ruleFilter', description: '按物流商、物流渠道和查询状态筛选渠道规则；默认全部，数据来源为规则配置列表，点击查询后刷新结果。' },
  { id: 3, type: '交互', title: '添加规则', target: 'channelRuleEntry', description: '点击打开渠道规则表单，保留原有物流商、物流渠道、映射单号和轨迹取值设置；必填项缺失时阻断保存。' },
  { id: 4, type: '规则', title: '渠道规则配置', target: 'ruleTable', description: '渠道维度直接配置完整关键词，未配置关键词的节点不参与识别；数据清洗后统一映射到标准节点编码。' },
  { id: 5, type: '规则', title: '取值与预警', target: 'ruleFooter', description: '上网、交航、到达目的国、签收分别配置轨迹判断方式；预警天数按当前时间与交运时间的差值判断，历史结果不回溯。' },
  { id: 6, type: '页面', title: '退回取值设置', target: 'returnConfigPanel', description: '退回节点按退回中、退回签收两个二次节点直接配置渠道关键词；包裹异常在独立页签配置标签。' },
  { id: 7, type: '规则', title: '包裹异常标签', target: 'exceptionConfigPanel', description: '包裹异常下仅维护派送失败和丢件标签关键词；系统级异常状态由开发侧处理。' },
  { id: 8, type: '待确认', title: '异常标签触发条件', target: 'exceptionConfigPanel', description: '待确认：开发侧系统异常状态的判定阈值和标签写入时机。' }
];

const annotationTypes = ['全部', '页面', '字段', '交互', '规则', '待确认'];

function annotationClass(type) { return `annotation-color-${type === '页面' ? 'page' : type === '字段' ? 'field' : type === '交互' ? 'interaction' : type === '规则' ? 'rule' : 'pending'}`; }

function renderAnnotationPanel() {
  const visible = annotations.filter((item) => annotationFilter === '全部' || item.type === annotationFilter);
  const counts = Object.fromEntries(annotationTypes.map((type) => [type, type === '全部' ? annotations.length : annotations.filter((item) => item.type === type).length]));
  $('#annotationTotal').textContent = annotations.length;
  $('#annotationFilters').innerHTML = annotationTypes.map((type) => `<button type="button" class="annotation-filter${annotationFilter === type ? ' is-active' : ''}" data-action="filter-annotations" data-filter="${type}">${type}<span>${counts[type]}</span></button>`).join('');
  $('#annotationList').innerHTML = visible.map((item) => `<button type="button" class="annotation-item${activeAnnotationId === item.id ? ' is-active' : ''}" data-action="focus-annotation" data-id="${item.id}"><span class="annotation-item__number ${annotationClass(item.type)}">${item.id}</span><span class="annotation-item__body"><strong>${item.title}</strong><span class="annotation-item__meta ${annotationClass(item.type)}">${item.type}</span><span>${item.description}</span></span></button>`).join('');
  updateAnnotationMarkers();
}

function updateAnnotationMarkers() {
  const layer = $('.annotation-markers');
  if (!layer) return;
  layer.innerHTML = '';
  if (!annotationMode) return;
  const visible = annotations.filter((item) => annotationFilter === '全部' || item.type === annotationFilter);
  visible.forEach((item) => {
    const target = document.querySelector(`[data-annotation-target="${item.target}"]`);
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const marker = document.createElement('button');
    marker.type = 'button'; marker.className = `annotation-marker ${annotationClass(item.type)}${activeAnnotationId === item.id ? ' is-active' : ''}`; marker.textContent = item.id; marker.dataset.action = 'focus-annotation'; marker.dataset.id = item.id; marker.title = item.title;
    marker.style.left = `${Math.max(8, Math.min(rect.right + 8, window.innerWidth - 28))}px`;
    marker.style.top = `${Math.max(8, rect.top + 12)}px`;
    layer.appendChild(marker);
  });
}

function focusAnnotation(id) {
  const item = annotations.find((entry) => entry.id === Number(id));
  if (!item) return;
  activeAnnotationId = item.id;
  const target = document.querySelector(`[data-annotation-target="${item.target}"]`);
  target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  target?.classList.add('annotation-highlight');
  window.setTimeout(() => target?.classList.remove('annotation-highlight'), 1400);
  renderAnnotationPanel();
}

function toggleAnnotations() {
  annotationMode = !annotationMode;
  $('.annotation-drawer').dataset.open = annotationMode ? 'true' : 'false';
  $('.annotation-toggle').textContent = annotationMode ? '关闭标注' : '开启标注';
  document.body.classList.toggle('annotation-mode-on', annotationMode);
  document.body.classList.toggle('annotation-mode-off', !annotationMode);
  renderAnnotationPanel();
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
    <td class="selection-col"><input type="checkbox" aria-label="选择${rule.channel}" /></td>
    <td><span class="rule-name">${rule.carrier}</span></td>
    <td>${rule.channel}</td>
    <td><div class="legacy-rule-lines"><span>收货：${legacyRuleSummary(rule, 'online')}</span><span>出运：${legacyRuleSummary(rule, 'online')}</span><span>提取：${legacyRuleSummary(rule, 'online')}</span></div></td>
    <td><div class="legacy-rule-lines"><span>到港：${legacyRuleSummary(rule, 'handover')}</span><span>清关：${legacyRuleSummary(rule, 'handover')}</span></div></td>
    <td><div class="legacy-rule-lines"><span>起运：${legacyRuleSummary(rule, 'arrived')}</span></div></td>
    <td><div class="legacy-rule-lines"><span>${legacyRuleSummary(rule, 'signed')}</span></div></td>
    <td><span class="legacy-status-switch ${rule.queryEnabled ? 'is-on' : ''}"><i></i></span></td>
    <td>${rule.updatedAt}<span class="cell-muted">${rule.operator}</span></td>
    <td><div class="legacy-actions"><button type="button" data-action="edit-rule" data-id="${rule.id}">编辑</button><button type="button" data-action="copy-rule" data-id="${rule.id}">复制</button><button type="button" data-action="delete-rule" data-id="${rule.id}">删除</button></div></td>
  </tr>`).join('') : '<tr><td colspan="10"><div class="empty-state">未找到符合条件的规则，请调整筛选条件。</div></td></tr>';
  $('#resultNote').textContent = `共 ${rows.length} 条规则`;
}

function renderTags(items, kind) {
  const removable = !['readonly'].includes(kind);
  return items.map((item, index) => `<span class="tag tag--default config-keyword-tag">${item}${removable ? `<button type="button" data-action="remove-keyword" data-kind="${kind}" data-index="${index}" aria-label="删除${item}">×</button>` : ''}</span>`).join('');
}

function renderSpecialTags(items, scope, nodeId = '') {
  return items.map((item, index) => `<span class="tag tag--default config-keyword-tag">${item}<button type="button" data-action="remove-keyword" data-kind="${scope}" data-node-id="${nodeId}" data-index="${index}" aria-label="删除${item}">×</button></span>`).join('');
}

function renderReturnConfig(config) {
  ensureSpecialConfig(config);
  const nodeCards = returnNodeIds.map((nodeId) => {
    const node = commonNodes.find((item) => item.id === nodeId);
    const rule = config.returnNodes[nodeId];
    return `<article class="special-node-card"><div class="special-node-card__head"><strong>${node?.name || nodeId}</strong></div>
      <div class="special-keyword-row"><span>命中关键词</span><input class="input" id="returnInclude-${nodeId}" placeholder="请输入渠道关键词" /><button class="btn btn--solid btn--color-primary btn--sm" type="button" data-action="add-special-keyword" data-scope="return" data-node-id="${nodeId}" data-kind="include">添加</button></div><div class="config-keyword-list special-keyword-list">${renderSpecialTags(rule.includeKeywords, 'return-include', nodeId)}</div>
      <div class="special-keyword-row"><span>排除关键词</span><input class="input" id="returnExclude-${nodeId}" placeholder="请输入渠道排除词" /><button class="btn btn--solid btn--color-primary btn--sm" type="button" data-action="add-special-keyword" data-scope="return" data-node-id="${nodeId}" data-kind="exclude">添加</button></div><div class="config-keyword-list special-keyword-list">${renderSpecialTags(rule.excludeKeywords, 'return-exclude', nodeId)}</div></article>`;
  }).join('');
  return `<section class="special-config-panel" id="returnConfigPanel" data-annotation-target="returnConfigPanel"><div class="special-config-panel__head"><div><div class="config-section__title">退回二次节点关键词</div></div></div>${nodeCards}</section>`;
}

function renderExceptionTags(items) {
  return items.map((tag, index) => `<article class="exception-tag-card"><div class="exception-tag-card__head"><strong>${tag.name}</strong></div><div class="special-keyword-row"><span>命中关键词</span><input class="input" id="exceptionInclude-${index}" placeholder="请输入承运商状态词" /><button class="btn btn--solid btn--color-primary btn--sm" type="button" data-action="add-exception-keyword" data-kind="include" data-index="${index}">添加</button></div><div class="config-keyword-list special-keyword-list">${renderSpecialTags(tag.includeKeywords, 'exception-include', String(index))}</div><div class="special-keyword-row"><span>排除关键词</span><input class="input" id="exceptionExclude-${index}" placeholder="请输入排除词" /><button class="btn btn--solid btn--color-primary btn--sm" type="button" data-action="add-exception-keyword" data-kind="exclude" data-index="${index}">添加</button></div><div class="config-keyword-list special-keyword-list">${renderSpecialTags(tag.excludeKeywords, 'exception-exclude', String(index))}</div></article>`).join('');
}

function renderExceptionConfig(config) {
  ensureSpecialConfig(config);
  return `<section class="special-config-panel" id="exceptionConfigPanel" data-annotation-target="exceptionConfigPanel"><div class="special-config-panel__head"><div><div class="config-section__title">包裹异常标签规则</div></div></div>${renderExceptionTags(config.exceptionTags)}</section>`;
}

function renderConfigPanel() {
  const config = currentConfig();
  if (!config) return;
  const setting = config.phases[activeConfigTab];
  const label = phaseLabels[activeConfigTab];
  $$('.rule-config-tab').forEach((tab) => tab.classList.toggle('is-active', tab.dataset.tab === activeConfigTab));
  if (activeConfigTab === 'return') {
    $('#ruleConfigPanel').innerHTML = renderReturnConfig(config);
    return;
  }
  if (activeConfigTab === 'exception') {
    $('#ruleConfigPanel').innerHTML = renderExceptionConfig(config);
    return;
  }
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

function openChannelRule(id = activeConfigId, isNew = false) {
  activeConfigId = id;
  configIsNew = isNew;
  activeConfigTab = 'online';
  ensureSpecialConfig(currentConfig());
  fillConfigForm();
  $('.c-modal').dataset.open = 'true';
  $('.c-modal-mask').dataset.open = 'true';
}

function closeChannelRule() {
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
  if (activePhase) {
    activePhase.mode = form.elements.trackMode?.value || activePhase.mode;
    activePhase.selectedCount = Number(form.elements.selectedCount?.value || 0);
    $$('#ruleConfigPanel [data-warning]').forEach((input) => { activePhase.warnings[input.dataset.warning] = Number(input.value || 0); });
  }
  ensureSpecialConfig(config);
  config.updatedAt = new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-');
  config.operator = '当前用户';
  configIsNew = false;
  renderRows();
  closeChannelRule();
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
  if (action === 'toggle-annotations') { toggleAnnotations(); return; }
  if (action === 'filter-annotations') { annotationFilter = event.target.closest('[data-filter]').dataset.filter; renderAnnotationPanel(); return; }
  if (action === 'focus-annotation') { focusAnnotation(id); return; }
  if (action === 'collapse') { const shell = $('.c-shell'); shell.dataset.collapsed = shell.dataset.collapsed === 'true' ? 'false' : 'true'; }
  if (action === 'switch-legacy-tab') {
    $$('.legacy-rule-tab').forEach((tab) => tab.classList.toggle('is-active', tab === event.target.closest('.legacy-rule-tab')));
    showToast(`已切换${event.target.closest('.legacy-rule-tab').textContent.trim()}规则`);
  }
  if (action === 'new-rule') { const config = blankConfig(); ruleConfigs.push(config); openChannelRule(config.id, true); }
  if (action === 'edit-rule') openChannelRule(id, false);
  if (action === 'copy-rule') { const source = ruleConfigs.find((rule) => rule.id === id); if (source) { const copy = JSON.parse(JSON.stringify(source)); copy.id = `r-${Date.now()}`; copy.channel = `${source.channel}-副本`; copy.updatedAt = '未保存'; copy.operator = '当前用户'; ruleConfigs.push(copy); renderRows(); showToast('规则已复制'); } }
  if (action === 'delete-rule') { const index = ruleConfigs.findIndex((rule) => rule.id === id); if (index >= 0) { ruleConfigs.splice(index, 1); renderRows(); showToast('规则已删除'); } }
  if (action === 'close-common-rules') closeChannelRule();
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
  if (action === 'add-special-keyword') {
    const button = event.target.closest('[data-action="add-special-keyword"]');
    const scope = button.dataset.scope;
    const kind = button.dataset.kind;
    const nodeId = button.dataset.nodeId;
    const input = $(`#${scope === 'return' ? `${kind === 'include' ? 'returnInclude' : 'returnExclude'}-${nodeId}` : ''}`);
    const value = input?.value.trim();
    if (!value) return;
    if (scope === 'return') currentConfig().returnNodes[nodeId][`${kind}Keywords`].push(value);
    if (input) input.value = '';
    renderConfigPanel();
  }
  if (action === 'add-exception-keyword') {
    const button = event.target.closest('[data-action="add-exception-keyword"]');
    const index = Number(button.dataset.index);
    const kind = button.dataset.kind;
    const input = $(`#exception${kind === 'include' ? 'Include' : 'Exclude'}-${index}`);
    const value = input?.value.trim();
    if (!value) return;
    currentConfig().exceptionTags[index][`${kind}Keywords`].push(value);
    input.value = '';
    renderConfigPanel();
  }
  if (action === 'remove-keyword') {
    const target = event.target.closest('[data-action="remove-keyword"]');
    const kind = target.dataset.kind;
    if (kind.startsWith('return-')) {
      const nodeId = target.dataset.nodeId;
      const key = kind === 'return-include' ? 'includeKeywords' : 'excludeKeywords';
      currentConfig().returnNodes[nodeId][key].splice(Number(target.dataset.index), 1);
      renderConfigPanel();
    } else if (kind.startsWith('exception-')) {
      const index = Number(target.dataset.nodeId);
      const key = kind === 'exception-include' ? 'includeKeywords' : 'excludeKeywords';
      currentConfig().exceptionTags[index][key].splice(Number(target.dataset.index), 1);
      renderConfigPanel();
    } else {
      const list = currentConfig().phases[activeConfigTab][kind === 'include' ? 'includeKeywords' : 'excludeKeywords'];
      list.splice(Number(target.dataset.index), 1);
      renderConfigPanel();
    }
  }
  if (action === 'refresh') { renderRows(); showToast('规则列表已刷新'); }
  if (action === 'search') { renderRows(); showToast('已按当前条件查询'); }
  if (action === 'reset') { $('#keywordInput').value = ''; filterState = { carrier: '全部物流商', channel: '全部物流渠道', queryEnabled: '全部状态' }; $$('.ui-select').forEach((item) => { item.querySelector('span').textContent = item.dataset.filter === 'carrier' ? '全部物流商' : item.dataset.filter === 'channel' ? '全部物流渠道' : '全部状态'; }); renderRows(); showToast('筛选条件已重置'); }
});

document.addEventListener('change', (event) => {
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
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if ($('.c-rule-config-modal').dataset.open === 'true') closeChannelRule();
});
renderRows();
document.body.classList.add('annotation-mode-on');
renderAnnotationPanel();
window.addEventListener('scroll', updateAnnotationMarkers, true);
window.addEventListener('resize', updateAnnotationMarkers);
