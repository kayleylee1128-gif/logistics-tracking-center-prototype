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
  return { inheritCommon: true, includeKeywords: [...includeKeywords], excludeKeywords: [...excludeKeywords] };
}

const returnNodeIds = ['returning', 'return-received', 'package-exception'];
const exceptionTagSeed = [
  { id: 'no-tracking', name: '查不到轨迹', priority: 1, source: '关键词 + 系统条件', description: '建议同时结合抓取超时或连续无有效轨迹判断。', includeKeywords: ['查不到轨迹', 'tracking not found', 'no tracking'], excludeKeywords: [] },
  { id: 'delivery-failed', name: '派送失败', priority: 2, source: '轨迹关键词', description: '命中派送失败、投递失败等承运商状态。', includeKeywords: ['派送失败', 'delivery failed', 'attempted delivery'], excludeKeywords: ['已签收', 'delivered'] },
  { id: 'package-lost', name: '丢件', priority: 3, source: '轨迹关键词', description: '命中承运商确认丢失或无法找回的状态。', includeKeywords: ['丢件', 'lost', 'missing package'], excludeKeywords: ['找到包裹', 'located'] },
  { id: 'tracking-sync-failed', name: '轨迹同步失败', priority: 4, source: '关键词 + 系统条件', description: '建议结合同步任务失败次数或接口错误码判断。', includeKeywords: ['轨迹同步失败', 'sync failed', 'tracking update failed'], excludeKeywords: [] }
];

function createExceptionTags() {
  return exceptionTagSeed.map((tag) => ({ ...tag, enabled: true, includeKeywords: [...tag.includeKeywords], excludeKeywords: [...tag.excludeKeywords] }));
}

function createSpecialConfig() {
  return {
    returnNodes: {
      returning: createSpecialNodeRule(['退回', 'returned to sender', 'return to sender']),
      'return-received': createSpecialNodeRule(['退回签收', 'return received', 'returned']),
      'package-exception': createSpecialNodeRule(['包裹异常', 'package exception', 'shipment exception'])
    },
    exceptionTags: createExceptionTags()
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

const commonKeywordSeed = {
  returning: { includeKeywords: ['退回', 'returned to sender', 'return to sender'], excludeKeywords: ['已签收', 'delivered'] },
  'return-received': { includeKeywords: ['退回签收', 'return received', 'returned'], excludeKeywords: [] },
  'package-exception': { includeKeywords: ['包裹异常', 'package exception', 'shipment exception'], excludeKeywords: [] },
  'package-lost': { includeKeywords: ['丢件', 'lost', 'missing package', '无法投递'], excludeKeywords: ['找到包裹', 'located'] },
  'package-damaged': { includeKeywords: ['破损', 'damaged', '损坏', 'broken'], excludeKeywords: [] },
  'delivery-failed': { includeKeywords: ['派送失败', 'delivery failed', 'attempted delivery', 'delivery exception'], excludeKeywords: ['已签收', 'delivered'] }
};

commonNodes.forEach((node) => {
  const seed = commonKeywordSeed[node.id] || { includeKeywords: [], excludeKeywords: [] };
  node.matchMode = node.matchMode || '任一关键词命中';
  node.includeKeywords = node.includeKeywords || [...seed.includeKeywords];
  node.excludeKeywords = node.excludeKeywords || [...seed.excludeKeywords];
});

function ensureSpecialConfig(config) {
  config.returnNodes = config.returnNodes || {};
  const seed = createSpecialConfig();
  returnNodeIds.forEach((id) => {
    config.returnNodes[id] = config.returnNodes[id] || seed.returnNodes[id];
  });
  config.exceptionTags = config.exceptionTags || createExceptionTags();
  return config;
}

function ensureNodeRules(config) {
  config.nodeRules = config.nodeRules || {};
  commonNodes.forEach((node) => {
    config.nodeRules[node.id] = config.nodeRules[node.id] || { inheritCommon: true, includeKeywords: [], excludeKeywords: [] };
  });
  return config.nodeRules;
}

let activeConfigId = 'r1';
let activeConfigTab = 'online';
let configIsNew = false;
let filterState = { carrier: '全部物流商', channel: '全部物流渠道', queryEnabled: '全部状态' };
let activeCommonNodeId = 'returning';
let commonNodeIsNew = false;
let activeChannelNodeId = 'returning';
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
  { id: 3, type: '交互', title: '通用节点配置', target: 'commonNodeEntry', description: '点击右上角入口打开弹窗，维护标准节点属性及通用默认关键词、排除关键词；保存后作为所有渠道的基础识别规则，不跳转新页面。' },
  { id: 4, type: '交互', title: '添加规则', target: 'channelRuleEntry', description: '点击打开渠道规则表单，保留原有物流商、物流渠道、映射单号和轨迹取值设置，并在编辑区域选择对应通用节点；必填项缺失时阻断保存。' },
  { id: 5, type: '规则', title: '渠道规则映射', target: 'ruleTable', description: '渠道维度继承通用关键词，只维护承运商差异化的补充词和排除词；最终映射到统一节点，避免每个渠道重复维护整套规则。' },
  { id: 6, type: '规则', title: '取值与预警', target: 'ruleFooter', description: '上网、交航、到达目的国、签收分别配置轨迹判断方式；预警天数按当前时间与交运时间的差值判断，历史结果不回溯。' },
  { id: 7, type: '页面', title: '退回取值设置', target: 'returnConfigPanel', description: '退回节点按退回中、退回签收、包裹异常三个二次节点识别；默认继承通用节点关键词，渠道仅补充承运商差异词。' },
  { id: 8, type: '规则', title: '包裹异常标签', target: 'exceptionConfigPanel', description: '包裹异常为统一二级节点，命中标签关键词后写入查不到轨迹、派送失败、丢件或轨迹同步失败标签；同一条轨迹多标签命中时按优先级取最高项，包裹历史标签不覆盖。' },
  { id: 9, type: '待确认', title: '异常标签触发条件', target: 'exceptionConfigPanel', description: '待确认：查不到轨迹、轨迹同步失败是否由系统超时/任务失败条件与关键词共同触发，以及阈值和标签是否允许多选。影响异常召回率和误报率。' }
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

function renderChannelNodeRule(config) {
  ensureNodeRules(config);
  const node = commonNodes.find((item) => item.id === activeChannelNodeId) || commonNodes[0];
  activeChannelNodeId = node.id;
  const rule = config.nodeRules[node.id];
  const globalInclude = node.includeKeywords || [];
  const globalExclude = node.excludeKeywords || [];
  const effectiveInclude = [...new Set([...(rule.inheritCommon ? globalInclude : []), ...rule.includeKeywords])];
  const effectiveExclude = [...new Set([...(rule.inheritCommon ? globalExclude : []), ...rule.excludeKeywords])];
  return `<section class="channel-node-rule-card">
    <div class="channel-node-rule-card__head"><div><span class="common-rule-kicker">对应节点配置</span><strong>选择通用节点</strong><p>当前物流渠道按所选节点识别轨迹，渠道差异词可在此补充。</p></div><label class="inherit-switch"><input type="checkbox" data-action="toggle-node-inherit" ${rule.inheritCommon ? 'checked' : ''} /><span></span><b>继承通用规则</b></label></div>
    <div class="channel-node-selector"><span>对应节点</span><select class="input" id="channelNodeSelect" data-action="select-channel-node">${commonNodes.map((item) => `<option value="${item.id}" ${item.id === node.id ? 'selected' : ''}>${item.name} · ${item.code}</option>`).join('')}</select><span class="channel-node-selector__hint">当前渠道：${config.channel === '请选择' ? '待选择' : config.channel}</span></div>
    <div class="keyword-source-grid"><div><span class="keyword-source-label">通用默认关键词</span><div class="keyword-source-tags">${renderTags(globalInclude, 'readonly')}</div></div><div><span class="keyword-source-label">通用排除关键词</span><div class="keyword-source-tags">${renderTags(globalExclude, 'readonly')}</div></div></div>
    <div class="channel-keyword-editor"><div class="common-keyword-row"><span>渠道补充关键词</span><input class="input" id="channelIncludeKeywordInput" placeholder="例如：承运商专属英文状态" /><button class="btn btn--solid btn--color-primary btn--sm" type="button" data-action="add-channel-keyword" data-kind="include">添加</button></div><div class="config-keyword-list channel-keyword-list">${renderTags(rule.includeKeywords, 'channel-include')}</div>
    <div class="common-keyword-row"><span>渠道排除关键词</span><input class="input" id="channelExcludeKeywordInput" placeholder="例如：仅表示已签收的状态" /><button class="btn btn--solid btn--color-primary btn--sm" type="button" data-action="add-channel-keyword" data-kind="exclude">添加</button></div><div class="config-keyword-list channel-keyword-list">${renderTags(rule.excludeKeywords, 'channel-exclude')}</div></div>
    <div class="effective-rule-preview"><span>最终生效</span><div><strong>${effectiveInclude.length} 个命中词</strong><em>+</em><strong>${effectiveExclude.length} 个排除词</strong><small>保存后仅影响当前物流渠道，不改变通用节点口径。</small></div></div>
  </section>`;
}

function renderSpecialTags(items, scope, nodeId = '') {
  return items.map((item, index) => `<span class="tag tag--default config-keyword-tag">${item}<button type="button" data-action="remove-keyword" data-kind="${scope}" data-node-id="${nodeId}" data-index="${index}" aria-label="删除${item}">×</button></span>`).join('');
}

function renderReturnConfig(config) {
  ensureSpecialConfig(config);
  const nodeCards = returnNodeIds.map((nodeId) => {
    const node = commonNodes.find((item) => item.id === nodeId);
    const rule = config.returnNodes[nodeId];
    const globalInclude = node?.includeKeywords || [];
    const globalExclude = node?.excludeKeywords || [];
    const effectiveInclude = [...new Set([...(rule.inheritCommon ? globalInclude : []), ...rule.includeKeywords])];
    const effectiveExclude = [...new Set([...(rule.inheritCommon ? globalExclude : []), ...rule.excludeKeywords])];
    return `<article class="special-node-card"><div class="special-node-card__head"><div><strong>${node?.name || nodeId}</strong><span class="tag tag--processing">二次节点</span><p>${node?.description || '按通用节点口径识别当前退回状态。'}</p></div><label class="inherit-switch"><input type="checkbox" data-action="toggle-special-inherit" data-node-id="${nodeId}" ${rule.inheritCommon ? 'checked' : ''} /><span></span><b>继承通用规则</b></label></div>
      <div class="special-source-row"><div><span>通用默认关键词</span><div class="keyword-source-tags">${renderTags(globalInclude, 'readonly')}</div></div><div><span>通用排除关键词</span><div class="keyword-source-tags">${renderTags(globalExclude, 'readonly')}</div></div></div>
      <div class="special-keyword-row"><span>渠道补充关键词</span><input class="input" id="returnInclude-${nodeId}" placeholder="例如：承运商专属退回状态" /><button class="btn btn--solid btn--color-primary btn--sm" type="button" data-action="add-special-keyword" data-scope="return" data-node-id="${nodeId}" data-kind="include">添加</button></div><div class="config-keyword-list special-keyword-list">${renderSpecialTags(rule.includeKeywords, 'return-include', nodeId)}</div>
      <div class="special-keyword-row"><span>渠道排除关键词</span><input class="input" id="returnExclude-${nodeId}" placeholder="例如：仅表示已签收的状态" /><button class="btn btn--solid btn--color-primary btn--sm" type="button" data-action="add-special-keyword" data-scope="return" data-node-id="${nodeId}" data-kind="exclude">添加</button></div><div class="config-keyword-list special-keyword-list">${renderSpecialTags(rule.excludeKeywords, 'return-exclude', nodeId)}</div>
      <div class="special-effective"><span>最终生效</span><strong>${effectiveInclude.length} 个命中词</strong><i>+</i><strong>${effectiveExclude.length} 个排除词</strong><small>命中后将统一映射为“${node?.name || nodeId}”</small></div></article>`;
  }).join('');
  return `<section class="special-config-panel" id="returnConfigPanel" data-annotation-target="returnConfigPanel"><div class="special-config-panel__head"><div><div class="config-section__title">退回二次节点关键词</div><p>退回取值设置用于识别正向物流进入退回后的具体状态，统一使用三个标准二次节点。</p></div><span class="tag tag--processing">通用默认 + 渠道补充</span></div>${nodeCards}<div class="special-config-tip"><strong>配置建议：</strong>通用节点配置维护跨渠道共用的基础词；只有承运商文案差异才在当前渠道补充或排除，避免批量复制整套关键词。</div></section>`;
}

function renderExceptionTags(items) {
  return items.map((tag, index) => `<article class="exception-tag-card"><div class="exception-tag-card__head"><div><strong>${tag.name}</strong><span class="tag tag--warning">优先级 ${tag.priority}</span><p>${tag.description}</p></div><label class="inherit-switch"><input type="checkbox" data-action="toggle-exception-tag" data-index="${index}" ${tag.enabled ? 'checked' : ''} /><span></span><b>${tag.enabled ? '启用' : '停用'}</b></label></div><div class="exception-tag-meta"><span>触发来源：${tag.source}</span><label>优先级 <input class="input exception-priority-input" type="number" min="1" value="${tag.priority}" data-action="change-exception-priority" data-index="${index}" /></label><span>数字越小越优先</span></div><div class="special-keyword-row"><span>命中关键词</span><input class="input" id="exceptionInclude-${index}" placeholder="输入承运商异常状态词" /><button class="btn btn--solid btn--color-primary btn--sm" type="button" data-action="add-exception-keyword" data-kind="include" data-index="${index}">添加</button></div><div class="config-keyword-list special-keyword-list">${renderSpecialTags(tag.includeKeywords, 'exception-include', String(index))}</div><div class="special-keyword-row"><span>排除关键词</span><input class="input" id="exceptionExclude-${index}" placeholder="可选，避免已签收等误判" /><button class="btn btn--solid btn--color-primary btn--sm" type="button" data-action="add-exception-keyword" data-kind="exclude" data-index="${index}">添加</button></div><div class="config-keyword-list special-keyword-list">${renderSpecialTags(tag.excludeKeywords, 'exception-exclude', String(index))}</div></article>`).join('');
}

function renderExceptionConfig(config) {
  ensureSpecialConfig(config);
  return `<section class="special-config-panel" id="exceptionConfigPanel" data-annotation-target="exceptionConfigPanel"><div class="special-config-panel__head"><div><div class="config-section__title">包裹异常标签规则</div><p>包裹异常是统一二级节点，命中下方规则后写入对应标签；同一包裹可累计多个异常标签，不覆盖历史标签。</p></div><button class="btn btn--sm" type="button" data-action="add-exception-tag">+ 新增标签</button></div><div class="exception-rule-summary"><div><strong>标签写入</strong><span>命中后新增标签，不覆盖已有标签</span></div><div><strong>同轨迹多命中</strong><span>按优先级取最高项，避免一条状态重复打标</span></div><div><strong>无关键词命中</strong><span>保持当前节点状态，不自动生成异常标签</span></div></div>${renderExceptionTags(config.exceptionTags)}<div class="special-config-tip"><strong>行业建议：</strong>“查不到轨迹”和“轨迹同步失败”最好同时接入系统条件（抓取超时、连续无有效轨迹、同步任务失败次数或接口错误码），关键词仅作为承运商主动返回状态的补充。</div></section>`;
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
  activeChannelNodeId = 'returning';
  ensureNodeRules(currentConfig());
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

function currentCommonNode() { return commonNodes.find((node) => node.id === activeCommonNodeId); }

function renderCommonNodeList() {
  const selected = currentCommonNode() || commonNodes[0];
  activeCommonNodeId = selected.id;
  $('#commonNodeCount').textContent = `${commonNodes.length} 个`;
  $('#commonNodeList').innerHTML = commonNodes.map((node) => `<button class="common-node-list__item${node.id === selected.id ? ' is-active' : ''}" type="button" data-action="select-common-node" data-id="${node.id}"><strong>${node.name || '未命名节点'}</strong><span>${node.code}</span><small>通用词 ${node.includeKeywords?.length || 0} · 排除词 ${node.excludeKeywords?.length || 0}</small></button>`).join('');
}

function renderCommonNodeKeywordConfig() {
  const node = currentCommonNode();
  if (!node || !$('#commonNodeKeywordConfig')) return;
  $('#commonNodeKeywordConfig').innerHTML = `<div class="common-keyword-config__head"><div><strong>通用默认关键词</strong><span>作为所有渠道的基础识别词，渠道可在规则中补充或排除</span></div><span class="tag tag--processing">${node.matchMode}</span></div>
    <div class="common-keyword-row"><span>命中关键词</span><input class="input" id="commonIncludeKeywordInput" placeholder="输入中文或英文状态词" /><button class="btn btn--solid btn--color-primary btn--sm" type="button" data-action="add-common-keyword" data-kind="include">添加</button></div>
    <div class="config-keyword-list common-keyword-list">${renderTags(node.includeKeywords, 'common-include')}</div>
    <div class="common-keyword-row"><span>排除关键词</span><input class="input" id="commonExcludeKeywordInput" placeholder="避免误判的状态词" /><button class="btn btn--solid btn--color-primary btn--sm" type="button" data-action="add-common-keyword" data-kind="exclude">添加</button></div>
    <div class="config-keyword-list common-keyword-list">${renderTags(node.excludeKeywords, 'common-exclude')}</div>`;
}

function fillCommonNodeForm() {
  const node = currentCommonNode();
  if (!node) return;
  const form = $('#commonNodeForm');
  $('#commonNodeFormTitle').textContent = node.name || '新增标准节点';
  $('#commonNodeStatus').textContent = node.enabled;
  $('#commonNodeStatus').className = `tag ${node.enabled === '启用' ? 'tag--success' : 'tag--default'}`;
  form.elements.name.value = node.name;
  form.elements.code.value = node.code;
  form.elements.direction.value = node.direction;
  form.elements.phase.value = node.phase;
  form.elements.description.value = node.description;
  form.elements.terminal.value = node.terminal;
  form.elements.enabled.value = node.enabled;
  renderCommonNodeKeywordConfig();
  $('#commonNodeUpdatedAt').textContent = node.updatedAt === '未保存' ? '新建节点 · 尚未保存' : `最近更新：${node.updatedAt} · ${node.operator}`;
}

function openCommonNodes() {
  commonNodeIsNew = false;
  renderCommonNodeList();
  fillCommonNodeForm();
  $('.common-node-modal').dataset.open = 'true';
  $('.common-node-mask').dataset.open = 'true';
}

function closeCommonNodes() {
  if (commonNodeIsNew) {
    const index = commonNodes.findIndex((node) => node.id === activeCommonNodeId && node.updatedAt === '未保存');
    if (index >= 0) commonNodes.splice(index, 1);
    commonNodeIsNew = false;
  }
  $('.common-node-modal').dataset.open = 'false';
  $('.common-node-mask').dataset.open = 'false';
}

function newCommonNode() {
  const node = { id: `node-${Date.now()}`, name: '', code: '', direction: '通用', phase: '异常', description: '', terminal: '否', enabled: '启用', updatedAt: '未保存', operator: '当前用户' };
  commonNodes.push(node);
  activeCommonNodeId = node.id;
  commonNodeIsNew = true;
  renderCommonNodeList();
  fillCommonNodeForm();
  window.setTimeout(() => $('#commonNodeForm').elements.name.focus(), 0);
}

function saveCommonNode(event) {
  event.preventDefault();
  const node = currentCommonNode();
  const form = event.currentTarget;
  if (!node) return;
  const data = new FormData(form);
  node.name = data.get('name').trim();
  node.code = data.get('code').trim().toUpperCase();
  node.direction = data.get('direction').trim();
  node.phase = data.get('phase').trim();
  node.description = data.get('description').trim();
  node.terminal = data.get('terminal').trim();
  node.enabled = data.get('enabled').trim();
  if (!node.name || !node.code || !node.description) { showToast('请完善节点名称、编码和节点说明'); return; }
  node.updatedAt = new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-');
  node.operator = '当前用户';
  commonNodeIsNew = false;
  renderCommonNodeList();
  fillCommonNodeForm();
  showToast(`标准节点“${node.name}”已保存`);
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
  if (action === 'open-common-nodes') openCommonNodes();
  if (action === 'switch-legacy-tab') {
    $$('.legacy-rule-tab').forEach((tab) => tab.classList.toggle('is-active', tab === event.target.closest('.legacy-rule-tab')));
    showToast(`已切换${event.target.closest('.legacy-rule-tab').textContent.trim()}规则`);
  }
  if (action === 'new-rule') { const config = blankConfig(); ruleConfigs.push(config); openChannelRule(config.id, true); }
  if (action === 'edit-rule') openChannelRule(id, false);
  if (action === 'copy-rule') { const source = ruleConfigs.find((rule) => rule.id === id); if (source) { const copy = JSON.parse(JSON.stringify(source)); copy.id = `r-${Date.now()}`; copy.channel = `${source.channel}-副本`; copy.updatedAt = '未保存'; copy.operator = '当前用户'; ruleConfigs.push(copy); renderRows(); showToast('规则已复制'); } }
  if (action === 'delete-rule') { const index = ruleConfigs.findIndex((rule) => rule.id === id); if (index >= 0) { ruleConfigs.splice(index, 1); renderRows(); showToast('规则已删除'); } }
  if (action === 'close-common-rules') closeChannelRule();
  if (action === 'close-common-nodes') closeCommonNodes();
  if (action === 'new-common-node') newCommonNode();
  if (action === 'select-common-node') { activeCommonNodeId = id; renderCommonNodeList(); fillCommonNodeForm(); }
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
  if (action === 'add-common-keyword') {
    const kind = event.target.closest('[data-kind]').dataset.kind;
    const input = $(`#common${kind === 'include' ? 'Include' : 'Exclude'}KeywordInput`);
    const value = input.value.trim();
    if (!value) return;
    const node = currentCommonNode();
    node[`${kind}Keywords`].push(value);
    input.value = '';
    renderCommonNodeList();
    renderCommonNodeKeywordConfig();
  }
  if (action === 'add-channel-keyword') {
    const kind = event.target.closest('[data-kind]').dataset.kind;
    const input = $(`#channel${kind === 'include' ? 'Include' : 'Exclude'}KeywordInput`);
    const value = input.value.trim();
    if (!value) return;
    const rule = ensureNodeRules(currentConfig())[activeChannelNodeId];
    rule[`${kind}Keywords`].push(value);
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
  if (action === 'add-exception-tag') {
    const config = ensureSpecialConfig(currentConfig());
    const nextPriority = Math.max(...config.exceptionTags.map((tag) => Number(tag.priority) || 0), 0) + 1;
    config.exceptionTags.push({ id: `custom-${Date.now()}`, name: '新异常标签', priority: nextPriority, source: '轨迹关键词', description: '请在产品配置中补充该标签的业务定义。', enabled: true, includeKeywords: [], excludeKeywords: [] });
    renderConfigPanel();
    showToast('已新增异常标签，请补充关键词');
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
    } else if (kind.startsWith('common-')) {
      const node = currentCommonNode();
      node[`${kind === 'common-include' ? 'include' : 'exclude'}Keywords`].splice(Number(target.dataset.index), 1);
      renderCommonNodeList();
      renderCommonNodeKeywordConfig();
    } else if (kind.startsWith('channel-')) {
      const rule = ensureNodeRules(currentConfig())[activeChannelNodeId];
      rule[`${kind === 'channel-include' ? 'include' : 'exclude'}Keywords`].splice(Number(target.dataset.index), 1);
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
  if (event.target.matches('[data-action="select-channel-node"]')) {
    activeChannelNodeId = event.target.value;
    renderConfigPanel();
  }
  if (event.target.matches('[data-action="toggle-node-inherit"]')) {
    ensureNodeRules(currentConfig())[activeChannelNodeId].inheritCommon = event.target.checked;
    renderConfigPanel();
  }
  if (event.target.matches('[data-action="toggle-special-inherit"]')) {
    const nodeId = event.target.dataset.nodeId;
    currentConfig().returnNodes[nodeId].inheritCommon = event.target.checked;
    renderConfigPanel();
  }
  if (event.target.matches('[data-action="toggle-exception-tag"]')) {
    currentConfig().exceptionTags[Number(event.target.dataset.index)].enabled = event.target.checked;
    renderConfigPanel();
  }
  if (event.target.matches('[data-action="change-exception-priority"]')) {
    currentConfig().exceptionTags[Number(event.target.dataset.index)].priority = Math.max(1, Number(event.target.value) || 1);
    renderConfigPanel();
  }
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
$('#commonNodeForm').addEventListener('submit', saveCommonNode);
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if ($('.c-rule-config-modal').dataset.open === 'true') closeChannelRule();
  if ($('.common-node-modal').dataset.open === 'true') closeCommonNodes();
});
renderRows();
document.body.classList.add('annotation-mode-on');
renderAnnotationPanel();
window.addEventListener('scroll', updateAnnotationMarkers, true);
window.addEventListener('resize', updateAnnotationMarkers);
