const forwardStatuses = [
  { key: 'all', label: '全部', count: '609,716' },
  { key: 'offline', label: '未上网', count: '177,557' },
  { key: 'online', label: '已上网', count: '45,773' },
  { key: 'delivered', label: '已交航', count: '8,042' },
  { key: 'arrived', label: '已到达目的国', count: '14,801' },
  { key: 'signed', label: '已签收', count: '363,513' },
  { key: 'exception', label: '包裹异常', count: '34' },
  { key: 'return', label: '退回', count: '16' }
];

const reverseStatuses = [
  { key: 'all', label: '全部', count: '30' },
  { key: 'reverse-returning', label: '退回中', count: '8' },
  { key: 'reverse-signed', label: '已签收', count: '5' },
  { key: 'reverse-exception', label: '包裹异常', count: '2' }
];

const parcels = [
  {
    id: 'f1', direction: 'forward', status: 'online', statusLabel: '已上网', statusTone: 'processing',
    packageNo: 'BO26071741389', orderNo: '平台单号 3075265347225973', warehouse: 'SZ01 深圳仓', platform: 'AliExpress', country: '法国', pickupTime: '2026-07-18 20:42',
    carrier: '中塔物流', channel: 'ZT-CN-EMS', logisticNo: 'BO26071741389', trackingNumber: '9983054784', trackingNo: '9983054784', latest: '国内分拣中心已发出', latestTime: '2026-07-22 09:12', handover: '3 天',
    shippingTime: '2026-07-18 20:46', onlineTime: '2026-07-19 08:31', deliveryTime: '2026-07-21 18:26', arrivesTime: '—', signTime: '—', days: '—', remark: '—',
    timelineForward: [
      ['2026-07-22 09:12', '国内分拣中心已发出', '深圳 · 承运商扫描'],
      ['2026-07-21 18:26', '已完成出口安检', '深圳国际邮件互换局'],
      ['2026-07-18 20:46', '已揽收', '深圳仓 · 中塔物流']
    ], timelineReverse: []
  },
  {
    id: 'f2', direction: 'forward', status: 'offline', statusLabel: '未上网', statusTone: 'warning',
    packageNo: 'BO26071618847', orderNo: '平台单号 3075377596645918', warehouse: 'SZ01 深圳仓', platform: 'AliExpress', country: '南非', pickupTime: '—',
    carrier: '中塔物流', channel: 'ZT-ARAMEX', logisticNo: 'BO26071618847', trackingNumber: '9783031521', trackingNo: '9783031521', latest: '暂无首条轨迹', latestTime: '2026-07-17 21:21', handover: '超时 2 天', overdue: true,
    shippingTime: '2026-07-17 21:21', onlineTime: '—', deliveryTime: '—', arrivesTime: '—', signTime: '—', days: '—', remark: '请物流商确认首扫',
    timelineForward: [
      ['2026-07-17 21:21', '面单已创建', '深圳仓 · 等待承运商首扫'],
      ['2026-07-17 21:20', '包裹已交运', '深圳仓 · 中塔物流']
    ], timelineReverse: []
  },
  {
    id: 'f3', direction: 'forward', status: 'exception', statusLabel: '包裹异常', statusTone: 'error',
    packageNo: 'BO26071521035', orderNo: '平台单号 8212368576914601', warehouse: 'AJL-US 美国仓', platform: 'AliExpress', country: '美国', pickupTime: '2026-07-12 08:20',
    carrier: '安捷利美', channel: 'AJL-DHL-E', logisticNo: '8212368576914601', trackingNumber: '420900949261290367750', trackingNo: '420900949261290367750', latest: '进口清关缺少税务资料', latestTime: '2026-07-16 02:02', handover: '需处理', overdue: true, systemError: false,
    shippingTime: '2026-07-12 08:33', onlineTime: '2026-07-12 12:18', deliveryTime: '2026-07-13 09:20', arrivesTime: '2026-07-15 14:26', signTime: '—', days: '—', remark: '待补税务资料',
    timelineForward: [
      ['2026-07-16 02:02', '清关异常', '目的国海关 · 缺少税务资料'],
      ['2026-07-15 14:26', '已到达目的国', '美国 · DHL 处理中心'],
      ['2026-07-12 08:33', '已完成出口放行', '深圳 · 出口口岸']
    ], timelineReverse: []
  },
  {
    id: 'f4', direction: 'forward', status: 'signed', statusLabel: '已签收', statusTone: 'success',
    packageNo: 'BO26071418154', orderNo: '平台单号 1121593924989120', warehouse: 'SZ01 深圳仓', platform: 'Ebay', country: '德国', pickupTime: '2026-07-13 22:02',
    carrier: '中塔物流', channel: 'ZT-XXKD', logisticNo: '1121593924989120', trackingNumber: '21922747', trackingNo: '21922747', latest: '收件人已签收', latestTime: '2026-07-21 16:40', handover: '8 天',
    shippingTime: '2026-07-13 22:14', onlineTime: '2026-07-14 04:26', deliveryTime: '2026-07-15 10:02', arrivesTime: '2026-07-18 13:41', signTime: '2026-07-21 16:40', days: '8 天', remark: '—',
    timelineForward: [
      ['2026-07-21 16:40', '已签收', '德国 · 住址投递'],
      ['2026-07-21 09:02', '派送中', '德国 · 末端网点'],
      ['2026-07-18 13:41', '已到达目的国', '德国 · 进口处理中心']
    ], timelineReverse: []
  },
  {
    id: 'f5', direction: 'forward', status: 'delivered', statusLabel: '已交航', statusTone: 'processing',
    packageNo: 'BO26071677152', orderNo: '平台单号 3075268172125501', warehouse: 'SZ01 深圳仓', platform: 'AliExpress', country: '英国', pickupTime: '2026-07-19 21:02',
    carrier: '中塔物流', channel: 'ZT-CN-EMS', logisticNo: 'BO26071677152', trackingNumber: '9983071022', trackingNo: '9983071022', latest: '航班已起飞', latestTime: '2026-07-21 03:18', handover: '2 天',
    shippingTime: '2026-07-19 21:10', onlineTime: '2026-07-20 04:22', deliveryTime: '2026-07-21 03:18', arrivesTime: '—', signTime: '—', days: '—', remark: '—',
    timelineForward: [['2026-07-21 03:18', '已交航', '深圳 · 国际干线已起飞'], ['2026-07-20 04:22', '已上网', '深圳 · 交运扫描']], timelineReverse: []
  },
  {
    id: 'f6', direction: 'forward', status: 'arrived', statusLabel: '已到达目的国', statusTone: 'processing',
    packageNo: 'BO26071590321', orderNo: '平台单号 01-14917-92470', warehouse: 'SZ01 深圳仓', platform: 'Ebay', country: '英国', pickupTime: '2026-07-15 21:02',
    carrier: '中塔物流', channel: 'ZT-XXKD', logisticNo: 'BO26071590321', trackingNumber: '21922747', trackingNo: '21922747', latest: '已到达目的国处理中心', latestTime: '2026-07-21 08:20', handover: '6 天',
    shippingTime: '2026-07-15 21:10', onlineTime: '2026-07-16 03:20', deliveryTime: '2026-07-17 05:18', arrivesTime: '2026-07-21 08:20', signTime: '—', days: '—', remark: '—',
    timelineForward: [['2026-07-21 08:20', '已到达目的国', '英国 · 进口处理中心'], ['2026-07-17 05:18', '已交航', '深圳 · 国际干线']], timelineReverse: []
  },
  {
    id: 'r1', direction: 'reverse', status: 'reverse-returning', statusLabel: '退回中', statusTone: 'processing', returnStage: '退回中', returnType: '客户退回', platformOrderNo: '3075287610091182',
    packageNo: 'RT26072000981', orderNo: '售后单 AS26072000128 · 原包裹 BO26070128304', warehouse: 'US-CA 退件仓', platform: 'Amazon', country: '美国',
    carrier: 'USPS', channel: 'USPS Return', trackingNo: '9400111899223857426', latest: '退回运输中', latestTime: '2026-07-22 08:30', handover: '退回中', reverseReason: '买家退货 · 尺码不符', reverseRequestedTime: '2026-07-18 10:02', reverseShippedTime: '2026-07-19 11:42', reverseInboundTime: '—', remark: '退回运输中，等待退件仓签收',
    timelineForward: [
      ['2026-07-12 14:18', '已签收', '美国 · 买家地址']
    ], timelineReverse: [
      ['2026-07-22 08:30', '退回中', 'USPS Return · 包裹正在退回退件仓'],
      ['2026-07-20 16:12', '退回中', 'USPS Return'],
      ['2026-07-19 11:42', '买家已寄出', '美国 · USPS 网点']
    ]
  },
  {
    id: 'r5', direction: 'reverse', status: 'reverse-signed', statusLabel: '已签收', statusTone: 'success', returnStage: '退回签收', returnType: '客户退回', platformOrderNo: '8212371048804921',
    packageNo: 'RT26072100152', orderNo: '售后单 AS26072100042 · 原包裹 BO26071088231', warehouse: 'US-CA 退件仓', platform: 'Amazon', country: '美国',
    carrier: 'UPS', channel: 'UPS Return', trackingNo: '1Z78A03X03912811', latest: '退件仓已签收', latestTime: '2026-07-22 09:18', handover: '已签收', reverseReason: '客户退回 · 商品不符预期', reverseRequestedTime: '2026-07-19 13:20', reverseShippedTime: '2026-07-20 10:12', reverseInboundTime: '2026-07-22 09:18', remark: '待退件仓入库',
    timelineForward: [['2026-07-15 16:30', '已签收', '美国 · 买家地址']], timelineReverse: [
      ['2026-07-22 09:18', '已签收', 'US-CA 退件仓 · 已签收客户退回包裹'],
      ['2026-07-20 10:12', '退回中', '美国 · UPS Return']
    ]
  },
  {
    id: 'r2', direction: 'reverse', status: 'reverse-signed', statusLabel: '已签收', statusTone: 'success', returnStage: '退回签收', returnType: '客户退回', platformOrderNo: '3075268172125501',
    packageNo: 'RT26071900417', orderNo: '售后单 AS26071900066 · 原包裹 BO26070677120', warehouse: 'SZ01 退件仓', platform: 'AliExpress', country: '法国',
    carrier: 'La Poste', channel: 'Local Return', trackingNo: 'LP009381772FR', latest: '退件仓已签收', latestTime: '2026-07-21 15:10', handover: '已签收', reverseReason: '商品质量问题', reverseRequestedTime: '2026-07-15 09:14', reverseShippedTime: '2026-07-16 13:26', reverseInboundTime: '2026-07-20 09:36', reverseInspectionTime: '—', remark: '等待退件仓处理',
    timelineForward: [
      ['2026-07-05 10:02', '已签收', '法国 · 买家地址']
    ], timelineReverse: [
      ['2026-07-21 15:10', '已签收', 'SZ01 退件仓 · 已签收退回包裹'],
      ['2026-07-20 09:36', '退回中', 'SZ01 退件仓 · 退回运输完成'],
      ['2026-07-17 18:12', '退回中', '深圳 · 进口清关完成']
    ]
  },
  {
    id: 'r3', direction: 'reverse', status: 'reverse-signed', statusLabel: '已签收', statusTone: 'success', returnStage: '退回签收', returnType: '原包裹退回', platformOrderNo: '1121593924989120',
    packageNo: 'RT26071800261', orderNo: '售后单 AS26071800019 · 原包裹 BO26070421208', warehouse: 'SZ01 退件仓', platform: 'Ebay', country: '德国',
    carrier: 'DHL', channel: 'DHL Return', trackingNo: '003404342921', latest: '退件仓已签收', latestTime: '2026-07-20 12:10', handover: '已签收', reverseReason: '买家不想要', reverseRequestedTime: '2026-07-13 17:22', reverseShippedTime: '2026-07-15 09:18', reverseInboundTime: '2026-07-18 10:22', remark: '已签收，待后续处理',
    timelineForward: [
      ['2026-07-04 19:20', '已签收', '德国 · 买家地址']
    ], timelineReverse: [
      ['2026-07-20 12:10', '已签收', 'SZ01 退件仓 · 已签收退回包裹'],
      ['2026-07-19 14:42', '退回中', 'SZ01 退件仓 · 等待签收处理'],
      ['2026-07-18 10:22', '退回中', '德国 · 退回运输完成']
    ]
  },
  {
    id: 'r4', direction: 'reverse', status: 'reverse-exception', statusLabel: '包裹异常', statusTone: 'error', exceptionType: '破损丢件', returnStage: '退回破损丢件', returnType: '原包裹退回', platformOrderNo: '3075260178239406',
    packageNo: 'RT26071600104', orderNo: '售后单 AS26071600031 · 原包裹 BO26070189022', warehouse: 'UK-LON 退件仓', platform: 'Amazon', country: '英国',
    carrier: 'Royal Mail', channel: 'Royal Mail Return', trackingNo: 'RM992004318GB', latest: '退回途中确认包裹异常', latestTime: '2026-07-17 09:10', handover: '需处理', overdue: true, reverseReason: '商品损坏', reverseRequestedTime: '2026-07-12 15:30', reverseShippedTime: '2026-07-14 13:25', remark: '需联系物流商确认破损丢件',
    timelineForward: [
      ['2026-07-02 10:31', '已签收', '英国 · 买家地址']
    ], timelineReverse: [
      ['2026-07-17 09:10', '包裹异常', '英国 · Royal Mail 调查确认退回包裹破损丢件'],
      ['2026-07-15 16:08', '退回中', '英国 · Royal Mail Return'],
      ['2026-07-14 13:25', '买家已寄出', '英国 · Royal Mail 网点']
    ]
  },
  {
    id: 'r6', direction: 'reverse', status: 'reverse-exception', statusLabel: '包裹异常', statusTone: 'error', exceptionType: '妥投失败', returnStage: '退回中', returnType: '客户退回', platformOrderNo: '8212390045126802',
    packageNo: 'RT26071700108', orderNo: '售后单 AS26071700028 · 原包裹 BO26070211908', warehouse: 'US-CA 退件仓', platform: 'Amazon', country: '美国',
    carrier: 'UPS', channel: 'UPS Return', trackingNo: '1Z78A03X03914028', latest: '退回包裹妥投失败', latestTime: '2026-07-18 16:40', handover: '需处理', overdue: true, reverseReason: '买家退货 · 地址无法投递', reverseRequestedTime: '2026-07-13 11:20', reverseShippedTime: '2026-07-15 09:30', remark: '妥投失败，待承运商重新安排派送',
    timelineForward: [
      ['2026-07-03 18:20', '已签收', '美国 · 买家地址']
    ], timelineReverse: [
      ['2026-07-18 16:40', '包裹异常', '美国 · UPS Return 妥投失败，等待重新安排派送'],
      ['2026-07-15 09:30', '退回中', '美国 · UPS Return']
    ]
  },
  {
    id: 'e1', direction: 'forward', status: 'exception', statusLabel: '轨迹同步失败', statusTone: 'error',
    packageNo: 'BO26071308712', orderNo: '平台单号 8122850286851240', warehouse: 'AJL-US 美国仓', platform: 'AliExpress', country: '美国', pickupTime: '2026-07-13 18:10',
    carrier: '安捷利美', channel: 'AJL-DHL-E', trackingNo: '420763659261290367750', latest: '轨迹同步失败', latestTime: '2026-07-16 03:52', handover: '需重试', systemError: true, exceptionType: '轨迹同步失败',
    timelineForward: [
      ['2026-07-16 03:52', '轨迹同步失败', '承运商接口返回异常，可点击重试'],
      ['2026-07-15 18:22', '已到达目的国', '美国 · DHL 处理中心']
    ], timelineReverse: []
  },
  {
    id: 'e2', direction: 'forward', status: 'exception', statusLabel: '包裹异常', statusTone: 'error', exceptionReason: '查不到轨迹', exceptionType: '查不到轨迹',
    packageNo: 'BO26071209144', orderNo: '平台单号 3075319981746202', warehouse: 'SZ01 深圳仓', platform: 'AliExpress', country: '西班牙', pickupTime: '2026-07-18 09:10',
    carrier: 'Correos', channel: 'ES-POST', logisticNo: 'BO26071209144', trackingNumber: 'ES7420918821', trackingNo: 'ES7420918821', latest: '超过 48 小时未返回轨迹', latestTime: '2026-07-20 12:30', handover: '需处理', overdue: true, remark: '查不到轨迹，待联系物流商',
    timelineForward: [
      ['2026-07-20 12:30', '查不到轨迹', '西班牙 · 承运商暂无有效轨迹返回'],
      ['2026-07-18 09:16', '已交运', '深圳仓 · Correos']
    ], timelineReverse: []
  },
  {
    id: 'e3', direction: 'forward', status: 'failed', statusLabel: '派送失败', statusTone: 'error', exceptionReason: '派送失败', exceptionType: '派送失败',
    packageNo: 'BO26071138029', orderNo: '平台单号 8212385548001329', warehouse: 'SZ01 深圳仓', platform: 'Amazon', country: '德国', pickupTime: '2026-07-18 08:52',
    carrier: 'DHL', channel: 'DHL-PACKET', logisticNo: 'BO26071138029', trackingNumber: 'JD0146002281', trackingNo: 'JD0146002281', latest: '派送失败 · 重新派送后回到已签收', latestTime: '2026-07-21 14:20', handover: '需重新派送', overdue: true, remark: '派送失败，重新派送后自动回到已签收',
    timelineForward: [
      ['2026-07-21 14:20', '派送失败', '德国 · 收件地址无人接听；重新派送后状态回到“已签收”'],
      ['2026-07-21 09:04', '派送中', '德国 · 末端网点']
    ], timelineReverse: []
  },
  {
    id: 'e4', direction: 'forward', status: 'exception', statusLabel: '包裹异常', statusTone: 'error', exceptionReason: '丢件', exceptionType: '丢件',
    packageNo: 'BO26071067051', orderNo: '平台单号 3075299144287810', warehouse: 'AJL-US 美国仓', platform: 'AliExpress', country: '美国', pickupTime: '2026-07-16 11:08',
    carrier: 'USPS', channel: 'USPS-GROUND', logisticNo: 'BO26071067051', trackingNumber: '9400111899223110288', trackingNo: '9400111899223110288', latest: '承运商确认包裹丢失', latestTime: '2026-07-19 17:42', handover: '需赔付', overdue: true, remark: '待售后确认赔付方案',
    timelineForward: [
      ['2026-07-19 17:42', '丢件', '美国 · 承运商调查结论：包裹无法找回'],
      ['2026-07-16 11:26', '运输中', '美国 · USPS 处理中心']
    ], timelineReverse: []
  },
  {
    id: 'e5', direction: 'forward', status: 'exception', statusLabel: '包裹异常', statusTone: 'error', exceptionReason: '破损', exceptionType: '破损',
    packageNo: 'BO26070955018', orderNo: '平台单号 1121593988012338', warehouse: 'SZ01 深圳仓', platform: 'Ebay', country: '法国', pickupTime: '2026-07-16 16:02',
    carrier: 'La Poste', channel: 'LP-REGISTERED', logisticNo: 'BO26070955018', trackingNumber: 'LP880310942FR', trackingNo: 'LP880310942FR', latest: '外包装破损，待确认签收', latestTime: '2026-07-18 10:08', handover: '需人工处理', overdue: true, remark: '联系买家确认是否拒收',
    timelineForward: [
      ['2026-07-18 10:08', '破损', '法国 · 末端网点发现外包装破损'],
      ['2026-07-17 16:14', '到达派送网点', '法国 · La Poste']
    ], timelineReverse: []
  },
  {
    id: 'ret1', direction: 'forward', status: 'return-progress', statusLabel: '退回中', statusTone: 'warning', returnType: '原包裹退回', returnStage: '退回中',
    packageNo: 'BO26070844219', orderNo: '平台单号 3075287610091182', warehouse: 'SZ01 深圳仓', platform: 'AliExpress', country: '英国', pickupTime: '2026-07-18 20:10',
    carrier: 'Royal Mail', channel: 'RM-RETURN', logisticNo: 'BO26070844219', trackingNumber: 'RM771820456GB', trackingNo: 'RM771820456GB', latest: '原包裹退回运输中', latestTime: '2026-07-21 22:02', handover: '退回中', remark: '目的国拒收，等待原包裹退回',
    timelineForward: [
      ['2026-07-21 22:02', '退回中', '英国 · 原包裹退回运输中'],
      ['2026-07-20 11:30', '退回', '英国 · 末端承运商发起退回']
    ], timelineReverse: []
  },
  {
    id: 'ret2', direction: 'forward', status: 'return-signed', statusLabel: '退回签收', statusTone: 'success', returnType: '客户退回', returnStage: '退回签收',
    packageNo: 'BO26070733064', orderNo: '平台单号 8212371048804921', warehouse: 'SZ01 深圳仓', platform: 'Amazon', country: '美国', pickupTime: '2026-07-17 08:42',
    carrier: 'UPS', channel: 'UPS-RETURN', logisticNo: 'BO26070733064', trackingNumber: '1Z78A03X03912811', trackingNo: '1Z78A03X03912811', latest: '客户退回包裹已签收', latestTime: '2026-07-20 15:44', handover: '已退回仓库', remark: '客户退回，待仓库验收',
    timelineForward: [
      ['2026-07-20 15:44', '退回签收', '美国 · 退件仓已签收客户退回包裹'],
      ['2026-07-19 09:12', '客户退回', '美国 · 买家寄出退件']
    ], timelineReverse: []
  },
  {
    id: 'ret3', direction: 'forward', status: 'return-damaged-lost', statusLabel: '退回破损丢件', statusTone: 'error', returnType: '原包裹退回', returnStage: '退回破损丢件',
    packageNo: 'BO26070622871', orderNo: '平台单号 3075260178239406', warehouse: 'AJL-US 美国仓', platform: 'Ebay', country: '美国', pickupTime: '2026-07-16 13:20',
    carrier: 'FedEx', channel: 'FEDEX-RETURN', logisticNo: 'BO26070622871', trackingNumber: '781528110390', trackingNo: '781528110390', latest: '退回途中确认破损丢件', latestTime: '2026-07-18 08:21', handover: '需索赔', overdue: true, remark: '退回破损丢件，待物流商理赔',
    timelineForward: [
      ['2026-07-18 08:21', '退回破损丢件', '美国 · 原包裹退回途中确认破损且无法找回'],
      ['2026-07-16 13:52', '退回中', '美国 · FedEx 退回运输']
    ], timelineReverse: []
  }
];

const metricSets = {
  all: [
    ['未上网', '177,557', '原页面状态', 'warning'], ['已上网', '45,773', '正向物流', 'processing'], ['已交航', '8,042', '正向物流', 'processing'], ['已到达目的国', '14,801', '正向物流', 'processing'], ['已签收', '363,513', '正向物流', 'success'], ['异常 / 退回', '50', '需要处理', 'danger']
  ],
  forward: [
    ['未上网', '177,557', '超过 24 小时：1,284', 'warning'], ['已上网', '45,773', '原页面状态', 'processing'], ['已交航', '8,042', '原页面状态', 'processing'], ['已到达目的国', '14,801', '原页面状态', 'processing'], ['已签收', '363,513', '原页面状态', 'success'], ['异常 / 退回', '50', '异常 34 · 退回 16', 'danger']
  ],
  reverse: [
    ['待退件', '8', '买家尚未寄出', 'warning'], ['退件运输中', '9', '本地 / 跨境退回', 'processing'], ['待入库', '5', '退件仓待接收', 'warning'], ['质检中', '3', '待给出处理结果', 'processing'], ['待退款', '2', '已通过质检', 'warning'], ['逆向异常', '1', '超过处理时限', 'danger']
  ],
  exception: [
    ['物流异常', '22', '清关 / 派送 / 轨迹', 'danger'], ['系统同步失败', '12', '可重试同步', 'danger'], ['正向超时', '15', '超过节点 SLA', 'warning'], ['退回异常', '3', '破损 / 丢件', 'danger'], ['待人工处理', '38', '按优先级处理', 'danger'], ['已恢复', '6', '过去 24 小时', 'success']
  ]
};

let currentDirection = 'forward';
let currentStatus = 'all';
let currentExceptionReason = 'all';
let currentReturnStage = 'all';
let currentReturnType = 'all';
let selectedParcel = null;
let activeDrawerTab = 'forward';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function getDirectionLabel(direction) { return direction === 'reverse' ? '逆向' : '正向'; }
function getStatusTone(row) { return row.statusTone || 'default'; }
function matchesDirection(row) {
  if (currentDirection === 'all') return true;
  if (currentDirection === 'forward') return row.direction === 'forward';
  if (currentDirection === 'reverse') return row.direction === 'reverse';
  return row.status === 'exception' || row.status === 'reverse-exception' || row.systemError || row.overdue || row.exceptionReason;
}
function matchesKeyword(row) {
  const keyword = ($('#keywordInput')?.value || '').trim().toLowerCase();
  if (!keyword) return true;
  return [row.packageNo, row.orderNo, row.trackingNo, row.latest].join(' ').toLowerCase().includes(keyword);
}
function matchesStatus(row) {
  const matchesReturnFilters = currentDirection !== 'reverse' || ((currentReturnStage === 'all' || row.returnStage === currentReturnStage) && (currentReturnType === 'all' || row.returnType === currentReturnType));
  if (currentStatus === 'all') return matchesReturnFilters;
  if (currentStatus === 'return') return row.returnStage && (currentReturnStage === 'all' || row.returnStage === currentReturnStage);
  if (currentStatus === 'exception') {
    const exceptionType = row.exceptionType || row.exceptionReason || (row.systemError ? '轨迹同步失败' : '');
    return (row.status === 'exception' || row.exceptionReason || row.exceptionType || row.systemError) && (currentExceptionReason === 'all' || exceptionType === currentExceptionReason);
  }
  return row.status === currentStatus && matchesReturnFilters;
}

function renderMetrics() {
  const items = metricSets[currentDirection];
  $('.metric-grid').innerHTML = items.map((item, index) => `<article class="c-metric metric--${item[3]} ${index === 0 ? 'is-selected' : ''}" data-metric-index="${index}"><span class="c-metric__name">${item[0]}</span><strong class="c-metric__value">${item[1]}</strong><span class="c-metric__meta">${item[2]}</span></article>`).join('');
}

function renderStatusTabs() {
  const statuses = currentDirection === 'reverse' ? reverseStatuses : forwardStatuses;
  if (currentDirection === 'exception') {
    $('#statusTabs').innerHTML = '<button class="status-tab is-active" data-status="all">全部异常 <span class="status-tab__count">34</span></button><button class="status-tab" data-status="exception">包裹异常 <span class="status-tab__count">22</span></button><button class="status-tab" data-status="reverse-exception">逆向异常 <span class="status-tab__count">1</span></button><button class="status-tab" data-status="sync-error">同步失败 <span class="status-tab__count">12</span></button>';
  } else {
    $('#statusTabs').innerHTML = statuses.map(item => `<button class="status-tab ${item.key === currentStatus ? 'is-active' : ''}" data-status="${item.key}">${item.label} <span class="status-tab__count">${item.count}</span></button>`).join('');
  }
  $$('#statusTabs .status-tab').forEach(tab => tab.addEventListener('click', () => {
    currentStatus = tab.dataset.status;
    if (currentDirection === 'exception' && currentStatus === 'sync-error') currentStatus = 'sync-error';
    $$('#statusTabs .status-tab').forEach(item => item.classList.toggle('is-active', item === tab));
    renderStatusSubfilters();
    renderRows();
  }));
  renderStatusSubfilters();
}

function renderStatusSubfilters() {
  const container = $('#statusSubfilters');
  if (!container) return;
  if (currentDirection === 'reverse') {
    const types = [['all', '全部类型'], ['原包裹退回', '原包裹退回'], ['客户退回', '客户退回']];
    container.hidden = false;
    container.innerHTML = `<div class="status-subfilters__row"><span class="status-subfilters__label">退回类型</span>${types.map(item => `<button class="subfilter-chip ${currentReturnType === item[0] ? 'is-active' : ''}" data-return-type="${item[0]}">${item[1]}</button>`).join('')}</div>`;
    $$('#statusSubfilters [data-return-type]').forEach(button => button.addEventListener('click', () => { currentReturnType = button.dataset.returnType; renderStatusSubfilters(); renderRows(); }));
    return;
  }
  if (currentDirection === 'forward' && currentStatus === 'exception') {
    const reasons = [['all', '全部类型', '34'], ['查不到轨迹', '查不到轨迹', '6'], ['派送失败', '派送失败', '7'], ['丢件', '丢件', '4'], ['破损', '破损', '5'], ['轨迹同步失败', '轨迹同步失败', '12']];
    container.hidden = false;
    container.innerHTML = `<span class="status-subfilters__label">异常类型</span>${reasons.map(item => `<button class="subfilter-chip ${currentExceptionReason === item[0] ? 'is-active' : ''}" data-exception-reason="${item[0]}">${item[1]} <em>${item[2]}</em></button>`).join('')}`;
    $$('#statusSubfilters [data-exception-reason]').forEach(button => button.addEventListener('click', () => { currentExceptionReason = button.dataset.exceptionReason; renderStatusSubfilters(); renderRows(); }));
    return;
  }
  if (currentDirection !== 'reverse' && currentStatus === 'return') {
    const stages = [['all', '全部退回节点'], ['退回中', '退回中'], ['退回签收', '退回签收'], ['退回破损丢件', '退回破损丢件']];
    container.hidden = false;
    container.innerHTML = `<div class="status-subfilters__row"><span class="status-subfilters__label">退回节点</span>${stages.map(item => `<button class="subfilter-chip ${currentReturnStage === item[0] ? 'is-active' : ''}" data-return-stage="${item[0]}">${item[1]}</button>`).join('')}</div>`;
    $$('#statusSubfilters [data-return-stage]').forEach(button => button.addEventListener('click', () => { currentReturnStage = button.dataset.returnStage; renderStatusSubfilters(); renderRows(); }));
    return;
  }
  container.hidden = true;
  container.innerHTML = '';
}

function renderRows() {
  const rows = parcels.filter(row => matchesDirection(row) && matchesKeyword(row) && (currentStatus === 'sync-error' ? row.systemError : matchesStatus(row)));
  const reverseView = currentDirection === 'reverse';
  const showDirection = false;
  $('#tableHead').innerHTML = reverseView ? `<tr>
    <th class="col-check"><input type="checkbox" aria-label="全选" /></th><th>仓库</th><th>平台</th><th>物流商</th><th>渠道</th><th>国家</th><th>平台单号</th><th>物流单号</th><th>当前节点</th><th>包裹异常类型</th><th>退回时间</th><th>签收时间</th><th>备注</th><th class="col-action">操作</th>
  </tr>` : `<tr>
    <th class="col-check"><input type="checkbox" aria-label="全选" /></th><th>仓库</th><th>平台</th><th>物流商</th><th>渠道</th><th>国家</th><th>平台单号</th><th>包裹号</th><th>物流单号</th><th>物流跟踪号</th><th class="col-track">最新轨迹信息</th><th>揽收时间</th><th>交运时间</th><th>上网时间</th><th>交航时间</th><th>到达目的国时间</th><th>签收时间</th><th>签收时效</th><th>备注</th><th class="col-action">操作</th>
  </tr>`;
  $('#parcelRows').innerHTML = rows.length ? rows.map(row => reverseView ? renderReverseRow(row) : renderForwardRow(row)).join('') : `<tr><td colspan="${reverseView ? 14 : 20}"><div class="empty-reverse">未找到符合条件的包裹，请调整筛选条件。</div></td></tr>`;
  const result = currentDirection === 'reverse' ? '共 30 条' : currentDirection === 'exception' ? '共 30 条' : currentDirection === 'forward' ? '共 609,716 条' : '共 609,746 条';
  $('#resultNote').textContent = result;
  $('#paginationTotal').textContent = result;
}

function renderForwardRow(row) {
  const nodeMeta = (row.exceptionType || row.exceptionReason) ? `<span class="cell-muted">异常类型：${row.exceptionType || row.exceptionReason}</span>` : '';
  return `<tr data-row-id="${row.id}">
    <td><input type="checkbox" data-action="select-row" data-id="${row.id}" aria-label="选择 ${row.packageNo}" /></td>
    <td><span>${row.warehouse}</span></td><td>${row.platform}</td><td><span>${row.carrier}</span></td><td><span>${row.channel}</span></td><td>${row.country}</td>
    <td><span class="cell-muted">${row.orderNo.replace('平台单号 ', '')}</span></td>
    <td><span class="package-no link" data-action="open-drawer" data-id="${row.id}">${row.packageNo}</span></td>
    <td><span>${row.logisticNo || row.packageNo}</span></td><td><span>${row.trackingNumber || row.trackingNo}</span></td>
    <td><div class="track-main ${row.systemError ? 'track-error' : ''}"><span class="tag tag--${getStatusTone(row)}">${row.statusLabel}</span><span>${row.latest}</span></div>${nodeMeta}<span class="track-time">${row.latestTime}${row.systemError ? ' · 可重试' : ''}</span></td>
    <td>${row.pickupTime || '—'}</td><td>${row.shippingTime || '—'}</td><td>${row.onlineTime || '—'}</td><td>${row.deliveryTime || '—'}</td><td>${row.arrivesTime || '—'}</td><td>${row.signTime || '—'}</td>
    <td><span class="${row.overdue ? 'track-error' : ''}">${row.days || row.handover || '—'}</span></td>
    <td><textarea class="remark-input" rows="2" maxlength="300" placeholder="请输入采购备注" data-action="remark-blur" data-id="${row.id}">${row.remark || ''}</textarea></td>
    <td><button class="btn btn--text btn--color-primary btn--sm" data-action="open-drawer" data-id="${row.id}">查看轨迹</button>${row.systemError ? '<button class="btn btn--text btn--color-primary btn--sm" data-action="retry" data-id="' + row.id + '">重试</button>' : ''}</td>
  </tr>`;
}

function renderReverseRow(row) {
  const returnTime = row.reverseReturnTime || row.reverseShippedTime || '—';
  const signTime = row.reverseSignTime || row.reverseInboundTime || '—';
  return `<tr data-row-id="${row.id}">
    <td><input type="checkbox" data-action="select-row" data-id="${row.id}" aria-label="选择 ${row.packageNo}" /></td>
    <td>${row.warehouse}</td><td>${row.platform}</td><td>${row.carrier}</td><td>${row.channel}</td><td>${row.country}</td>
    <td><span class="cell-muted">${row.platformOrderNo || '—'}</span></td><td><span>${row.trackingNo}</span></td>
    <td><span class="tag tag--${getStatusTone(row)}">${row.statusLabel}</span><span class="cell-muted">${row.latest}</span>${row.returnType ? `<span class="cell-muted">${row.returnType}</span>` : ''}</td>
    <td>${row.exceptionType ? `<span class="tag tag--error">${row.exceptionType}</span>` : '—'}</td>
    <td>${returnTime}</td><td>${signTime}</td>
    <td><textarea class="remark-input" rows="2" maxlength="300" placeholder="请输入采购备注" data-action="remark-blur" data-id="${row.id}">${row.remark || ''}</textarea></td>
    <td><button class="btn btn--text btn--color-primary btn--sm" data-action="open-drawer" data-id="${row.id}">查看轨迹</button></td>
  </tr>`;
}

function renderPage() {
  renderStatusTabs();
  renderRows();
}

function timelineHtml(events) {
  if (!events.length) return '<div class="empty-reverse">当前包裹尚未产生逆向物流轨迹。<br /><span class="cell-muted">退件申请后，系统将在此处展示逆向运输与处理节点。</span></div>';
  return `<ul class="c-timeline">${events.map((event, index) => `<li class="c-timeline__item ${index === 0 ? 'is-latest' : ''}"><div class="c-timeline__time">${event[0]}</div><div class="c-timeline__title">${event[1]}</div><div class="c-timeline__detail">${event[2]}</div>${event[1].includes('失败') || event[1].includes('异常') ? '<div class="raw-event">系统建议：查看异常原因并重试轨迹同步或创建人工处理任务。</div>' : ''}</li>`).join('')}</ul>`;
}

function renderDrawerBody(tab) {
  if (!selectedParcel) return;
  if (tab === 'basic') {
    const returnTypeDesc = selectedParcel.direction === 'reverse' ? `<dt>退回类型</dt><dd>${selectedParcel.returnType || '—'}</dd>` : '';
    const platformOrderDesc = selectedParcel.direction === 'reverse' ? (selectedParcel.platformOrderNo || '—') : selectedParcel.orderNo;
    $('#drawerBody').innerHTML = `<section class="drawer-section"><h3 class="drawer-section__title">包裹信息</h3><dl class="drawer-desc"><dt>包裹号</dt><dd>${selectedParcel.packageNo}</dd><dt>物流方向</dt><dd><span class="tag tag--${selectedParcel.direction === 'reverse' ? 'warning' : 'processing'}">${getDirectionLabel(selectedParcel.direction)}物流</span></dd><dt>平台单号</dt><dd>${platformOrderDesc}</dd><dt>物流单号</dt><dd>${selectedParcel.trackingNo}</dd><dt>仓库</dt><dd>${selectedParcel.warehouse}</dd><dt>平台</dt><dd>${selectedParcel.platform}</dd><dt>目的国家</dt><dd>${selectedParcel.country}</dd><dt>物流商</dt><dd>${selectedParcel.carrier}</dd><dt>物流渠道</dt><dd>${selectedParcel.channel}</dd><dt>当前节点</dt><dd>${selectedParcel.statusLabel}</dd><dt>异常原因</dt><dd>${selectedParcel.exceptionReason || '—'}</dd>${returnTypeDesc}<dt>最新更新时间</dt><dd>${selectedParcel.latestTime}</dd><dt>退件原因</dt><dd>${selectedParcel.reverseReason || '—'}</dd></dl></section><section class="drawer-section"><h3 class="drawer-section__title">数据说明</h3><div class="c-feedback"><div class="c-feedback__item info">轨迹展示为系统标准化节点，点击节点可查看承运商原始描述。</div></div></section>`;
    return;
  }
  const isReverse = tab === 'reverse';
  const events = isReverse ? selectedParcel.timelineReverse : selectedParcel.timelineForward;
  const alert = selectedParcel.overdue || selectedParcel.systemError || selectedParcel.exceptionReason || selectedParcel.exceptionType ? `<div class="drawer-alert ${selectedParcel.systemError || selectedParcel.exceptionReason === '丢件' || selectedParcel.exceptionReason === '破损' || selectedParcel.exceptionType || selectedParcel.returnStage === '退回破损丢件' ? 'drawer-alert--error' : ''}"><strong>${selectedParcel.systemError ? '同步异常' : selectedParcel.exceptionReason ? selectedParcel.exceptionReason : selectedParcel.exceptionType ? '包裹异常' : selectedParcel.returnStage === '退回破损丢件' ? '退回异常' : '需要处理'}</strong><span>${selectedParcel.systemError ? '承运商接口返回异常，列表已隐藏技术堆栈。可点击底部“重试”重新获取轨迹。' : selectedParcel.exceptionReason === '派送失败' ? '重新派送成功后，包裹状态将回到“已签收”。' : selectedParcel.exceptionReason ? '请确认责任方并创建人工处理任务。' : selectedParcel.exceptionType === '妥投失败' ? '逆向包裹妥投失败，请联系承运商确认后续派送安排。' : selectedParcel.exceptionType === '破损丢件' ? '逆向包裹确认破损或丢件，请进入理赔流程。' : selectedParcel.returnStage === '退回破损丢件' ? '退回途中已确认破损或丢件，请进入理赔流程。' : '当前节点已超过预设时效，请确认责任方并创建处理任务。'}</span></div>` : '';
  $('#drawerBody').innerHTML = `${alert}<section class="drawer-section"><h3 class="drawer-section__title">${isReverse ? '逆向物流节点' : '正向物流节点'}</h3>${timelineHtml(events)}</section><section class="drawer-section"><h3 class="drawer-section__title">标准化说明</h3><dl class="drawer-desc"><dt>标准状态</dt><dd>${selectedParcel.statusLabel}</dd><dt>承运商原始单号</dt><dd>${selectedParcel.trackingNo}</dd><dt>数据来源</dt><dd>${selectedParcel.carrier} API</dd><dt>同步时间</dt><dd>${selectedParcel.latestTime}</dd></dl></section>`;
}

function openDrawer(id) {
  selectedParcel = parcels.find(row => row.id === id);
  if (!selectedParcel) return;
  activeDrawerTab = selectedParcel.direction === 'reverse' ? 'reverse' : 'forward';
  $('#drawerTitle').textContent = '物流轨迹';
  $('#drawerSubtitle').textContent = `${selectedParcel.packageNo} · ${selectedParcel.statusLabel}`;
  $('#drawerMeta').innerHTML = `<span class="tag tag--${getStatusTone(selectedParcel)}">${getDirectionLabel(selectedParcel.direction)} · ${selectedParcel.statusLabel}</span><span>物流名称 <strong>${selectedParcel.carrier}</strong></span><span>物流单号 <strong>${selectedParcel.logisticNo || selectedParcel.trackingNo}</strong></span><span>目的国家 <strong>${selectedParcel.country}</strong></span><span>最后同步 <strong>${selectedParcel.latestTime}</strong></span>`;
  $$('#drawerTabs .c-drawer__tab').forEach(tab => { tab.classList.toggle('is-active', tab.dataset.drawerTab === activeDrawerTab); tab.setAttribute('aria-selected', tab.dataset.drawerTab === activeDrawerTab ? 'true' : 'false'); });
  renderDrawerBody(activeDrawerTab);
  $('.c-drawer').dataset.open = 'true'; $('.c-drawer-mask').dataset.open = 'true';
}

function closeDrawer() { $('.c-drawer').dataset.open = 'false'; $('.c-drawer-mask').dataset.open = 'false'; }
function showToast(message) { const toast = $('#toast'); toast.textContent = message; toast.classList.add('is-visible'); window.clearTimeout(showToast.timer); showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 1800); }

$$('[data-direction]').forEach(button => button.addEventListener('click', () => {
  currentDirection = button.dataset.direction; currentStatus = 'all'; currentExceptionReason = 'all'; currentReturnStage = 'all'; currentReturnType = 'all';
  $$('[data-direction]').forEach(item => item.classList.toggle('is-active', item === button));
  renderPage();
}));

document.addEventListener('click', event => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  const id = event.target.closest('[data-id]')?.dataset.id;
  if (action === 'collapse') { const shell = $('.c-shell'); shell.dataset.collapsed = shell.dataset.collapsed === 'true' ? 'false' : 'true'; }
  if (action === 'open-drawer') openDrawer(id);
  if (action === 'close-drawer') closeDrawer();
  if (action === 'sync' || action === 'refresh') showToast('轨迹同步任务已提交，列表将在完成后刷新');
  if (action === 'export') showToast('已生成当前筛选条件下的导出任务');
  if (action === 'export-menu') showToast('导出选项：选中数据 / 当前条件');
  if (action === 'import') showToast('导入窗口已打开（支持物流轨迹模板）');
  if (action === 'remark-batch') showToast('请先勾选包裹，再批量修改采购备注');
  if (action === 'retry') showToast('已提交轨迹重试：' + id);
  if (action === 'column-setting') showToast('列设置已打开（原型示意）');
  if (action === 'drawer-action') showToast('已打开异常处理任务（原型示意）');
  if (action === 'copy-no') { if (selectedParcel) navigator.clipboard?.writeText(selectedParcel.trackingNo); showToast('运单号已复制'); }
  if (action === 'toggle-more') { const filter = $('.c-filter'); filter.dataset.expanded = filter.dataset.expanded === 'true' ? 'false' : 'true'; event.target.textContent = filter.dataset.expanded === 'true' ? '收起筛选' : '更多筛选'; }
  if (action === 'search') { renderRows(); showToast('已按当前条件查询'); }
  if (action === 'reset') { $('#keywordInput').value = ''; currentStatus = 'all'; currentExceptionReason = 'all'; currentReturnStage = 'all'; currentReturnType = 'all'; renderPage(); showToast('筛选条件已重置'); }
});

$('#keywordInput').addEventListener('keydown', event => { if (event.key === 'Enter') renderRows(); });
$$('[data-select]').forEach(select => select.addEventListener('click', () => { select.classList.toggle('is-picked'); showToast('筛选项已选择，可点击查询生效'); }));
$$('#drawerTabs .c-drawer__tab').forEach(tab => tab.addEventListener('click', () => { activeDrawerTab = tab.dataset.drawerTab; $$('#drawerTabs .c-drawer__tab').forEach(item => { item.classList.toggle('is-active', item === tab); item.setAttribute('aria-selected', item === tab ? 'true' : 'false'); }); renderDrawerBody(activeDrawerTab); }));
document.addEventListener('blur', event => { if (event.target.matches('.remark-input')) showToast('备注已保存：' + (event.target.value || '—')); }, true);
document.addEventListener('keydown', event => { if (event.key === 'Escape' && $('.c-drawer').dataset.open === 'true') closeDrawer(); });

renderPage();
