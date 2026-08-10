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
  $('#commonRuleNav').innerHTML = commonRules.map((rule) => `<button class="common-rule-nav__item${rule.id === selected.id ? ' is-active' : ''}" type="button" data-action="select-common-rule" data-id="${rule.id}" aria-selected="${rule.id === selected.id}"><span class="common-rule-nav__name">${rule.name || '未命名节点'}</span><span class="common-rule-nav__meta">${rule.result}</span></button>`).join('');
  fillCommonRuleForm();
}

function fillCommonRuleForm() {
  const selected = commonRules.find((rule) => rule.id === selectedCommonRuleId) || commonRules[0];
  const form = $('#commonRuleForm');
  if (!selected || !form) return;
  form.elements.name.value = selected.name;
  form.elements.result.value = selected.result;
  form.elements.scope.value = selected.scope;
  form.elements.description.value = selected.description;
  form.elements.keywords.value = selected.keywords.join(', ');
  form.elements.status.value = selected.status;
  $('#commonRuleFormTitle').textContent = selected.name || '新增通用节点';
  $('#commonRuleStatusTag').textContent = selected.status;
  $('#commonRuleStatusTag').className = `tag ${selected.status === '已启用' ? 'tag--success' : 'tag--default'}`;
  $('#commonRuleUpdatedAt').textContent = selected.updatedAt === '未保存' ? '新建配置 · 尚未保存' : `最近更新：${selected.updatedAt} · ${selected.operator}`;
}

function openCommonRules() { renderCommonRules(); $('.c-modal').dataset.open = 'true'; $('.c-modal-mask').dataset.open = 'true'; }
function closeCommonRules() { $('.c-modal').dataset.open = 'false'; $('.c-modal-mask').dataset.open = 'false'; }

function newCommonRule() {
  const id = `custom-${Date.now()}`;
  commonRules.push({ id, name: '', type: '通用节点', result: '包裹异常', description: '', keywords: [], scope: '', status: '已启用', updatedAt: '未保存', operator: '当前用户' });
  selectedCommonRuleId = id;
  renderCommonRules();
  window.setTimeout(() => $('#commonRuleForm').elements.name.focus(), 0);
}

function saveCommonRule(event) {
  event.preventDefault();
  const selected = commonRules.find((rule) => rule.id === selectedCommonRuleId);
  if (!selected) return;
  const data = new FormData(event.currentTarget);
  selected.name = data.get('name').trim();
  selected.result = data.get('result').trim();
  selected.scope = data.get('scope').trim();
  selected.description = data.get('description').trim();
  selected.keywords = keywordInput(data.get('keywords'));
  selected.status = data.get('status').trim();
  if (!selected.keywords.length) { showToast('请至少保留一个匹配关键词'); return; }
  selected.updatedAt = new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-');
  selected.operator = '当前用户';
  renderCommonRules();
  renderRows();
  showToast(`通用规则“${selected.name}”已保存`);
}

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
  if (action === 'new-common-rule') newCommonRule();
  if (action === 'new-rule') showToast('新增规则入口已打开（原型示意）');
  if (action === 'refresh') { renderRows(); showToast('规则列表已刷新'); }
  if (action === 'search') { renderRows(); showToast('已按当前条件查询'); }
  if (action === 'reset') { $('#keywordInput').value = ''; renderRows(); showToast('筛选条件已重置'); }
});

$('#keywordInput').addEventListener('keydown', (event) => { if (event.key === 'Enter') renderRows(); });
$('#commonRuleForm').addEventListener('submit', saveCommonRule);
document.addEventListener('keydown', (event) => { if (event.key !== 'Escape') return; if ($('.c-drawer').dataset.open === 'true') closeDrawer(); if ($('.c-modal').dataset.open === 'true') closeCommonRules(); });
renderRows();
