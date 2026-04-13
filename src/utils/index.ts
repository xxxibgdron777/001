import type { CostTemplate } from '../types'

/**
 * 预置成本模板：硬件产品 / SaaS 软件 / 消费品
 */
export const COST_TEMPLATES: CostTemplate[] = [
  {
    id: 'hardware',
    name: '硬件产品',
    description: '适用于电子/机械硬件',
    icon: '🔧',
    items: [
      { name: '原材料采购', amount: 150, type: 'variable' },
      { name: '零部件成本', amount: 80, type: 'variable' },
      { name: '组装人工', amount: 40, type: 'variable' },
      { name: '包装材料', amount: 15, type: 'variable' },
      { name: '物流运费', amount: 20, type: 'variable' },
      { name: '设备折旧', amount: 50000, type: 'fixed' },
      { name: '厂房租金', amount: 30000, type: 'fixed' },
      { name: '管理人员工资', amount: 20000, type: 'fixed' },
      { name: '研发费用', amount: 15000, type: 'fixed' },
      { name: '市场营销', amount: 8000, type: 'fixed' },
    ],
  },
  {
    id: 'saas',
    name: 'SaaS 软件',
    description: '适用于订阅制软件服务',
    icon: '☁️',
    items: [
      { name: '服务器/云资源', amount: 8, type: 'variable' },
      { name: '支付手续费', amount: 3, type: 'variable' },
      { name: '客服支持（人均）', amount: 5, type: 'variable' },
      { name: '研发团队薪资', amount: 80000, type: 'fixed' },
      { name: '服务器基础费用', amount: 5000, type: 'fixed' },
      { name: '办公室租金', amount: 15000, type: 'fixed' },
      { name: '市场与广告', amount: 20000, type: 'fixed' },
      { name: '法务与合规', amount: 5000, type: 'fixed' },
      { name: '工具与订阅', amount: 3000, type: 'fixed' },
    ],
  },
  {
    id: 'consumer',
    name: '消费品',
    description: '适用于快消 / 食品饮料',
    icon: '🛍️',
    items: [
      { name: '原料成本', amount: 12, type: 'variable' },
      { name: '生产加工', amount: 8, type: 'variable' },
      { name: '包装材料', amount: 5, type: 'variable' },
      { name: '物流配送', amount: 6, type: 'variable' },
      { name: '渠道佣金', amount: 10, type: 'variable' },
      { name: '品牌营销', amount: 25000, type: 'fixed' },
      { name: '工厂租金', amount: 18000, type: 'fixed' },
      { name: '设备折旧', amount: 8000, type: 'fixed' },
      { name: '质检与认证', amount: 5000, type: 'fixed' },
      { name: '行政管理', amount: 12000, type: 'fixed' },
    ],
  },
]

/**
 * 格式化金额显示
 * @param value 数值
 * @param digits 小数位数
 */
export function formatAmount(value: number, digits = 2): string {
  if (!isFinite(value)) return '—'
  if (Math.abs(value) >= 10000) {
    return (value / 10000).toFixed(digits) + ' 万元'
  }
  return value.toFixed(digits) + ' 元'
}

/**
 * 格式化数量
 */
export function formatNumber(value: number, digits = 0): string {
  if (!isFinite(value) || value === Infinity) return '—'
  return value.toFixed(digits).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number, digits = 1): string {
  if (!isFinite(value)) return '—'
  return value.toFixed(digits) + '%'
}

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}

/**
 * 生成图表数据点（销量从 0 到 maxVolume）
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
