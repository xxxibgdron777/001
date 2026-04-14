// ============================================================
// 核心数据类型定义（支持动态成本项 + 合作分成配置）
// ============================================================

/** 成本类型：固定成本 | 变动成本 */
export type CostType = 'fixed' | 'variable'

/** 单个成本项 */
export interface CostItem {
  id: string
  name: string           // 成本项名称
  amount: number         // 金额（元）；动态项 amount 为计算结果
  type: CostType         // 成本类型
  /** 模板内唯一标识，用于合作分成基数勾选（仅模板内有效） */
  templateId?: string
  /** 是否为动态计算项（如合作分成） */
  isDynamic?: boolean
}

/** 合作分成配置 */
export interface PartnershipSplitConfig {
  /** 是否启用合作分成（对应"合作分成"成本项） */
  enabled: boolean
  /** 分成基数 = (单价 − 被勾选的变动成本项之和) */
  baseItemTemplateIds: string[]
  /** 分成比例（%），如 20 表示 20% */
  ratio: number
}

/** 本量利计算参数 */
export interface CVPParams {
  sellingPrice: number   // 售价（元 / 客户）
  targetVolume: number   // 预估客户数量
  targetProfit: number   // 目标利润（元）
}

/** 本量利计算结果 */
export interface CVPResult {
  totalFixedCost: number           // 总固定成本
  unitVariableCost: number         // 单客户变动成本（含合作分成）
  /** 合作分成金额 = (单价 − 基数项之和) × 比例%；仅展示用 */
  partnershipSplitAmount: number
  contributionMargin: number      // 边际贡献 = 售价 − 单客户变动成本
  contributionMarginRate: number  // 边际贡献率 (%)
  breakEvenVolume: number        // 盈亏平衡客户数量
  breakEvenRevenue: number       // 盈亏平衡销售收入
  totalRevenue: number           // 总销售收入（按目标客户数）
  totalCost: number              // 总成本（按目标客户数）
  profit: number                 // 利润（按目标客户数）
  targetVolumeForProfit: number  // 达到目标利润所需客户数
  targetRevenueForProfit: number // 达到目标利润所需收入
  isViable: boolean              // 边际贡献 > 0，可盈利
}

/** 图表数据点 */
export interface ChartDataPoint {
  volume: number    // 客户数量
  revenue: number   // 销售收入
  totalCost: number // 总成本
  profit: number   // 利润
  fixedCost: number // 固定成本线（水平）
}

/** 不同售价下的数据点 */
export interface PriceProfitPoint {
  price: number
  profit: number
  contributionMargin: number
}

/** 成本模板 */
export interface CostTemplate {
  id: string
  name: string
  description: string
  icon: string
  /** items[最后一项] 可为 isDynamic=true（合作分成） */
  items: Omit<CostItem, 'id'>[]
}

/** 应用全局状态 */
export interface AppState {
  costItems: CostItem[]
  params: CVPParams
  partnershipSplit: PartnershipSplitConfig
}
