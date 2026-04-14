import type { CostTemplate } from '../types'

/**
 * 健康管理产品模板 — 8 个成本项
 * 其中"合作分成"为动态项：分成金额 = (单价 − 基数项之和) × 分成比例
 * 基数默认 = items 1~7（templateId: health-1 至 health-7）
 */
export const HEALTH_MANAGEMENT_TEMPLATE: CostTemplate = {
  id: 'health',
  name: '健康管理产品',
  description: '适用于体检/慢病管理/疗程服务',
  icon: '🏥',
  items: [
    // 变动成本项 1~7 — 默认作为合作分成基数
    { name: '首次检验（测）套餐成本', amount: 300,   type: 'variable', templateId: 'health-1' },
    { name: '疗程中血检费用',         amount: 150,   type: 'variable', templateId: 'health-2' },
    { name: '疗程中影像超声费用',     amount: 200,   type: 'variable', templateId: 'health-3' },
    { name: '疗程中 IV 及餐包费用',   amount: 100,   type: 'variable', templateId: 'health-4' },
    { name: '包装品&接待费用',        amount: 50,    type: 'variable', templateId: 'health-5' },
    { name: '护士&前台成本（10%）',   amount: 80,    type: 'variable', templateId: 'health-6' },
    { name: '门诊与讲座日讲师费',     amount: 500,   type: 'variable', templateId: 'health-7' },
    // 变动成本项 8 — 动态合作分成（基数 = items 1~7，分成比例 20%）
    { name: '合作分成',               amount: 0,     type: 'variable', templateId: 'health-8', isDynamic: true },
    // 固定成本项
    { name: '机票差旅费',             amount: 2000,  type: 'fixed',    templateId: 'health-9' },
    { name: '医生顾问费',             amount: 3000,  type: 'fixed',    templateId: 'health-10' },
  ],
}

/** 兼容旧接口 */
export const COST_TEMPLATES: CostTemplate[] = [HEALTH_MANAGEMENT_TEMPLATE]

/** 模板内所有变动成本项的 templateId（不含动态项） */
export const HEALTH_VARIABLE_TEMPLATE_IDS = [
  'health-1', 'health-2', 'health-3', 'health-4',
  'health-5', 'health-6', 'health-7',
]

/**
 * 计算合作分成金额
 * 分成基数 = (单价 − 被勾选的变动成本项之和)
 * 分成金额 = max(0, 分成基数 × 分成比例 / 100)
 */
export function calcPartnershipSplit(
  sellingPrice: number,
  baseItemsSum: number,
  ratio: number,
): number {
  const base = sellingPrice - baseItemsSum
  if (base <= 0 || ratio <= 0) return 0
  return Math.max(0, base * (ratio / 100))
}

/**
 * 格式化金额显示（所有数字取整，不显示小数点）
 * 金额 ≥ 10000 时显示为万元
 */
export function formatAmount(value: number): string {
  if (!isFinite(value)) return '—'
  const rounded = Math.round(value)  // 四舍五入取整
  if (Math.abs(rounded) >= 10000) {
    return Math.round(rounded / 10000) + ' 万元'
  }
  return '¥' + rounded.toLocaleString('zh-CN')
}

/**
 * 格式化数量（千分位，整数）
 */
export function formatNumber(value: number): string {
  if (!isFinite(value) || value === Infinity) return '—'
  return Math.round(value).toLocaleString('zh-CN')
}

/**
 * 格式化百分比（取整，不显示小数）
 */
export function formatPercent(value: number): string {
  if (!isFinite(value)) return '—'
  return Math.round(value) + '%'
}

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}

/**
 * 生成图表数据点（客户量从 0 到 maxVolume）
 */
export function generateChartData(
  maxVolume: number,
  fixedCost: number,
  unitVariableCost: number,
  sellingPrice: number,
  points = 50,
) {
  const step = maxVolume / points
  return Array.from({ length: points + 1 }, (_, i) => {
    const vol = i * step
    const revenue = vol * sellingPrice
    const totalCost = fixedCost + vol * unitVariableCost
    const profit = revenue - totalCost
    return {
      volume: Math.round(vol),
      revenue: Math.round(revenue),
      totalCost: Math.round(totalCost),
      profit: Math.round(profit),
      fixedCost: Math.round(fixedCost),
    }
  })
}

/**
 * 生成不同售价下的利润数据
 */
export function generatePriceProfitData(
  minPrice: number,
  maxPrice: number,
  fixedCost: number,
  unitVariableCost: number,
  volume: number,
  points = 40,
) {
  if (volume <= 0) return []
  const step = (maxPrice - minPrice) / points
  return Array.from({ length: points + 1 }, (_, i) => {
    const price = minPrice + i * step
    const cm = price - unitVariableCost
    const profit = cm * volume - fixedCost
    return {
      price: Math.round(price * 100) / 100,
      profit: Math.round(profit),
      contributionMargin: Math.round(cm * 100) / 100,
    }
  })
}

// PDF 导出
export { exportPDF } from './pdfExport'
