// ============================================================
// 核心数据类型定义
// ============================================================

/** 成本类型：固定成本 | 变动成本 */
export type CostType = 'fixed' | 'variable'

/** 单个成本项 */
export interface CostItem {
  id: string
  name: string       // 成本项名称
  amount: number     // 金额（元）
  type: CostType     // 成本类型
}

/** 本量利计算参数 */
export interface CVPParams {
  sellingPrice: number   // 售价（元）
  targetVolume: number   // 目标销量（件），0 表示未设置
  targetProfit: number   // 目标利润（元），0 表示未设置
}

/** 本量利计算结果 */
export interface CVPResult {
  totalFixedCost: number         // 总固定成本
  unitVariableCost: number       // 单件变动成本
  contributionMargin: number     // 贡献毛益 = 售价 - 单件变动成本
  contributionMarginRate: number // 贡献毛益率 (%)
  breakEvenVolume: number        // 盈亏平衡销量
  breakEvenRevenue: number       // 盈亏平衡销售收入
  totalRevenue: number           // 总销售收入（按目标销量）
  totalCost: number              // 总成本（按目标销量）
  profit: number                 // 利润（按目标销量）
  targetVolumeForProfit: number  // 达到目标利润所需销量
  targetRevenueForProfit: number // 达到目标利润所需收入
  isViable: boolean              // 贡献毛益 > 0，是否可盈利
}

/** 图表数据点 */
export interface ChartDataPoint {
  volume: number         // 销量
  revenue: number        // 销售收入
  totalCost: number      // 总成本
  profit: number         // 利润
  fixedCost: number      // 固定成本线（水平）
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
  items: Omit<CostItem, 'id'>[]
}

/** 应用全局状态 */
export interface AppState {
  costItems: CostItem[]
  params: CVPParams
}
