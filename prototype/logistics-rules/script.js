const rules = [
  {
    id: 'lost', name: '丢件', type: '轨迹关键词', description: '识别包裹遗失、无法找回等轨迹', keywords: ['丢件', '包裹丢失', '无法找回', 'package lost', 'lost parcel'], status: '包裹异常', enabled: true, updatedAt: '2026-07-22 10:18', operator: 'Fiona'
  },
  {
    id: 'delivery-failed', name: '派送失败', type: '轨迹关键词', description: '识别末端投递未成功、需重新派送等轨迹', keywords: ['派送失败', '投递失败', 'delivery failed', 'unable to deliver', 'delivery attempt failed'], status: '包裹异常', enabled: true, updatedAt: '2026-07-21 16:42', operator: 'Fiona'
  }
];

const commonRules = [
  {
    id: 'return', name: '退回', type: '通用节点', result: '退回', description: '识别包裹进入原路退回、退件运输或退件签收流程', keywords: ['退回', '退件', '退回中', 'return', 'returned'], scope: '正向物流退回节点', status: '已启用', updatedAt: '2026-07-22 10:18', operator: 'Fiona'
  },
  {
    id: 'lost', name: '丢件', type: '通用节点', result: '包裹异常', description: '识别包裹遗失、无法找回等轨迹', keywords: ['丢件', '包裹丢失', '无法找回', 'package lost', 'lost parcel'], scope: '正向/逆向异常节点', status: '已启用', updatedAt: '2026-07-22 10:18', operator: 'Fiona'
  },
  {
    id: 'delivery-failed', name: '派送失败', type: '通用节点', result: '包裹异常', description: '识别末端投递未成功、需重新派送等轨迹', keywords: ['派送失败', '投递失败', 'delivery failed', 'unable to deliver'], scope: '正向异常节点', status: '已启用', updatedAt: '2026-07-21 16:42', operator: 'Fiona'
  }
];

let selectedRule = null;
let draftKeywords = [];
let selectedCommonRuleId = 'return';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function keywordInput(value) {
  return [...new Set(value.split(/[，,\n]/).map((item) => item.trim()).filter(Boolean))];
}

function renderRows() {
  const keyword = $('#keywordInput').value.trim().toLowerCase();
  const rows = rules.filter((rule) => !keyword || `${rule.name} ${rule.keywords.join(' ')}`.toLowerCase().includes(keyword));
  $('#ruleRows').innerHTML = rows.length ? rows.map((rule) => `<tr>
    <td><span class="rule-name">${rule.name}</span><span class="rule-desc">${rule.description}</span></td>
    <td>${rule.type}</td>
    <td><div class="keyword-list">${rule.keywords.map((item) => `<span class="tag tag--default">${item}</span>`).join('')}</div></td>
    <td><span class="tag tag--error">${rule.status}</span></td>
    <td><span class="tag tag--success">${rule.enabled ? '启用' : '停用'}</span></td>
    <td>${rule.updatedAt}<span class="cell-muted">${rule.operator}</span></td>
    <td><button class="btn btn--sm btn--text btn--color-primary" data-action="edit-rule" data-id="${rule.id}">编辑</button></td>
  </tr>`).join('') : '<tr><td colspan="7"><div class="empty-state">未找到符合条件的规则，请调整筛选条件。</div></td></tr>';
  $('#resultNote').textContent = `共 ${rows.length} 条规则`;
}

function renderCommonRules() {
  const selected = commonRules.find((rule) => rule.id === selectedCommonRuleId) || commonRules[0];
  selectedCommonRuleId = selected.id;
  $('#commonRuleNav').innerHTML = commonRules.map((rule) => `<button class="common-rule-nav__item${rule.id === selected.id ? ' is-active' : ''}" type="button" data-action="select-common-rule" data-id="${rule.id}"><span class="common-rule-nav__name">${rule.name}</span><span class="common-rule-nav__meta">${rule.result}</span></button>`).join('');
  $('#commonRuleDetail').innerHTML = `<div class="common-rule-detail__eyebrow">通用节点配置 · 只读</div>
    <div class="common-rule-detail__title-row"><h3>${selected.name}</h3><span class="tag tag--success">${selected.status}</span></div>
    <p class="common-rule-detail__desc">${selected.description}</p>
    <dl class="common-rule-fields"><div><dt>规则类型</dt><dd>${selected.type}</dd></div><div><dt>归类结果</dt><dd><span class="tag ${selected.result === '包裹异常' ? 'tag--error' : 'tag--processing'}">${selected.result}</span></dd></div><div><dt>适用范围</dt><dd>${selected.scope}</dd></div><div><dt>最近更新</dt><dd>${selected.updatedAt} · ${selected.operator}</dd></div></dl>
    <div class="common-rule-keywords"><div class="common-rule-section-title">匹配关键词</div><div class="keyword-list">${selected.keywords.map((item) => `<span class="tag tag--default">${item}</span>`).join('')}</div></div>
    <div class="common-rule-callout"><strong>识别说明</strong><span>命中任一关键词后，系统按“归类结果”生成业务节点；规则变更仅影响后续轨迹识别，历史结果不回溯。</span></div>`;
}

function openCommonRules() { renderCommonRules(); $('.c-modal').dataset.open = 'true'; $('.c-modal-mask').dataset.open = 'true'; }
function closeCommonRules() { $('.c-modal').dataset.open = 'false'; $('.c-modal-mask').dataset.open = 'false'; }

function openDrawer(id) {
  selectedRule = rules.find((rule) => rule.id === id);
  if (!selectedRule) return;
  draftKeywords = [...selectedRule.keywords];
  $('#drawerSubtitle').textContent = `${selectedRule.name} · ${selectedRule.type}`;
  $('#drawerBody').innerHTML = `<section class="drawer-section">
    <h3 class="drawer-section__title">规则信息</h3>
    <label class="form-field"><span>规则名称</span><input class="input" value="${selectedRule.name}" disabled /></label>
    <label class="form-field"><span>归类状态</span><input class="input" value="${selectedRule.status}" disabled /></label>
  </section>
  <section class="drawer-section">
    <h3 class="drawer-section__title">匹配关键词</h3>
    <label class="form-field"><span>关键词</span><textarea class="input" id="draftKeywords" spellcheck="false">${draftKeywords.join('，')}</textarea><small class="form-hint">多个关键词用逗号或换行分隔；保存后仅影响后续轨迹识别。</small></label>
  </section>`;
  $('.c-drawer').dataset.open = 'true'; $('.c-drawer-mask').dataset.open = 'true';
  window.setTimeout(() => $('#draftKeywords')?.focus(), 0);
}

function closeDrawer() { $('.c-drawer').dataset.open = 'false'; $('.c-drawer-mask').dataset.open = 'false'; selectedRule = null; }
function showToast(message) { const toast = $('#toast'); toast.textContent = message; toast.classList.add('is-visible'); window.clearTimeout(showToast.timer); showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 1800); }
function saveRule() {
  if (!selectedRule) return;
  const keywords = keywordInput($('#draftKeywords')?.value || '');
  if (!keywords.length) { showToast('请至少保留一个匹配关键词'); return; }
  selectedRule.keywords = keywords;
  selectedRule.updatedAt = '2026-07-23 14:20';
  selectedRule.operator = '当前用户';
  const ruleName = selectedRule.name;
  closeDrawer(); renderRows(); showToast(`“${ruleName}”已保存`);
}

document.addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  const id = event.target.closest('[data-id]')?.dataset.id;
  if (action === 'collapse') { const shell = $('.c-shell'); shell.dataset.collapsed = shell.dataset.collapsed === 'true' ? 'false' : 'true'; }
  if (action === 'edit-rule') openDrawer(id);
  if (action === 'close-drawer') closeDrawer();
  if (action === 'save-rule') saveRule();
  if (action === 'open-common-rules') openCommonRules();
  if (action === 'close-common-rules') closeCommonRules();
  if (action === 'select-common-rule') { selectedCommonRuleId = id; renderCommonRules(); }
  if (action === 'new-rule') showToast('新增规则入口已打开（原型示意）');
  if (action === 'refresh') { renderRows(); showToast('规则列表已刷新'); }
  if (action === 'search') { renderRows(); showToast('已按当前条件查询'); }
  if (action === 'reset') { $('#keywordInput').value = ''; renderRows(); showToast('筛选条件已重置'); }
});

$('#keywordInput').addEventListener('keydown', (event) => { if (event.key === 'Enter') renderRows(); });
document.addEventListener('keydown', (event) => { if (event.key !== 'Escape') return; if ($('.c-drawer').dataset.open === 'true') closeDrawer(); if ($('.c-modal').dataset.open === 'true') closeCommonRules(); });
renderRows();
