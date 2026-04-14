/**
 * 产品成本分解 Agent — 核心数据 Hook
 * 支持动态成本项：合作分成 = (单价 − 勾选的基数项之和) × 分成比例
 * 所有派生计算通过 useMemo 实现，依赖合作分成配置自动实时更新。
 */
import { useState, useEffect, useMemo, useCallback } from 'react'
import type {
  CostItem,
  CVPParams,
  CVPResult,
  AppState,
  PartnershipSplitConfig,
} from '../types'
import {
  generateId,
  HEALTH_MANAGEMENT_TEMPLATE,
  HEALTH_VARIABLE_TEMPLATE_IDS,
  calcPartnershipSplit,
} from '../utils'

/** localStorage 存储键 */
const STORAGE_KEY = 'cost_agent_state_v2'

/** 默认合作分成配置（基数 = health-1 ~ health-7，分成比例 20%） */
const DEFAULT_PARTNERSHIP_SPLIT: PartnershipSplitConfig = {
  enabled: true,
  baseItemTemplateIds: [...HEALTH_VARIABLE_TEMPLATE_IDS],
  ratio: 20,
}

/** 默认成本项（健康管理模板，展开后含动态合作分成） */
function buildDefaultCostItems(): CostItem[] {
  return HEALTH_MANAGEMENT_TEMPLATE.items.map(item => ({
    ...item,
    id: generateId(),
  }))
}

const DEFAULT_COST_ITEMS = buildDefaultCostItems()

/** 默认计算参数 */
const DEFAULT_PARAMS: CVPParams = {
  sellingPrice: 5000,
  targetVolume: 10,
  targetProfit: 50000,
}

/**
 * 从 localStorage 读取持久化状态
 */
function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppState
      if (Array.isArray(parsed.costItems) && parsed.params) {
        return {
          costItems: parsed.costItems,
          params: parsed.params,
          partnershipSplit: parsed.partnershipSplit ?? DEFAULT_PARTNERSHIP_SPLIT,
        }
      }
    }
  } catch {
    // ignore
  }
  return {
    costItems: DEFAULT_COST_ITEMS,
    params: DEFAULT_PARAMS,
    partnershipSplit: DEFAULT_PARTNERSHIP_SPLIT,
  }
}

// ============================================================
// 主 Hook
// ============================================================
export function useCostAgent() {
  const [state, setState] = useState<AppState>(loadState)

  const { costItems, params, partnershipSplit } = state

  // ---- 持久化 ----
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore
    }
  }, [state])

  // ---- 成本项操作 ----

  /** 新增成本项 */
  const addCostItem = useCallback((item: Omit<CostItem, 'id'>) => {
    setState(prev => ({
      ...prev,
      costItems: [...prev.costItems, { ...item, id: generateId() }],
    }))
  }, [])

  /** 更新成本项 */
  const updateCostItem = useCallback(
    (id: string, updates: Partial<Omit<CostItem, 'id'>>) => {
      setState(prev => ({
        ...prev,
        costItems: prev.costItems.map(item =>
          item.id === id ? { ...item, ...updates } : item,
        ),
      }))
    },
    [],
  )

  /** 删除成本项 */
  const removeCostItem = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      costItems: prev.costItems.filter(item => item.id !== id),
    }))
  }, [])

  /** 应用健康管理产品模板 */
  const applyCostTemplate = useCallback(() => {
    setState(prev => ({
      ...prev,
      costItems: HEALTH_MANAGEMENT_TEMPLATE.items.map(item => ({
        ...item,
        id: generateId(),
      })),
      partnershipSplit: DEFAULT_PARTNERSHIP_SPLIT,
    }))
  }, [])

  /** 重置为默认数据 */
  const resetToDefault = useCallback(() => {
    setState({
      costItems: buildDefaultCostItems(),
      params: DEFAULT_PARAMS,
      partnershipSplit: DEFAULT_PARTNERSHIP_SPLIT,
    })
  }, [])

  // ---- 参数更新 ----

  const updateParams = useCallback((updates: Partial<CVPParams>) => {
    setState(prev => ({
      ...prev,
      params: { ...prev.params, ...updates },
    }))
  }, [])

  // ---- 合作分成配置更新 ----

  const updatePartnershipSplit = useCallback(
    (updates: Partial<PartnershipSplitConfig>) => {
      setState(prev => ({
        ...prev,
        partnershipSplit: { ...prev.partnershipSplit, ...updates },
      }))
    },
    [],
  )

  // ---- 实时 CVP 计算（useMemo，依赖合作分成自动更新） ----
  //
  // 合作分成动态计算链：
  // 1. 基数项之和 = sum(勾选的 templateId 对应的 costItems.amount)
  // 2. 合作分成 = calcPartnershipSplit(单价, 基数项之和, 分成比例)
  // 3. 单客户变动成本 = 基数项之和 + 合作分成
  // 4. 边际贡献 = 单价 − 单客户变动成本
  // 5. 盈亏平衡点、目标利润推算 均依赖上述结果
  //
  // 依赖项：costItems（基数项金额变化） + params（单价变化） + partnershipSplit（勾选项/比例变化）
  //
  const result = useMemo<CVPResult>(() => {
    const { sellingPrice } = params
    const { baseItemTemplateIds, ratio } = partnershipSplit

    // 1) 固定成本：直接求和
    const totalFixedCost = costItems
      .filter(i => i.type === 'fixed')
      .reduce((sum, i) => sum + (i.amount || 0), 0)

    // 2) 非动态的变动成本项之和（基数）
    const baseSum = costItems
      .filter(
        i =>
          i.type === 'variable' &&
          !i.isDynamic &&
          i.templateId &&
          baseItemTemplateIds.includes(i.templateId),
      )
      .reduce((sum, i) => sum + (i.amount || 0), 0)

    // 3) 合作分成金额（动态计算）
    const partnershipSplitAmount = partnershipSplit.enabled
      ? calcPartnershipSplit(sellingPrice, baseSum, ratio)
      : 0

    // 4) 单客户变动成本 = 非动态变动项之和 + 合作分成
    const unitVariableCost = baseSum + partnershipSplitAmount

    const contributionMargin = sellingPrice - unitVariableCost
    const isViable = contributionMargin > 0

    const contributionMarginRate =
      isViable && sellingPrice > 0
        ? (contributionMargin / sellingPrice) * 100
        : 0

    const breakEvenVolume = isViable
      ? totalFixedCost / contributionMargin
      : Infinity

    const breakEvenRevenue = isViable
      ? breakEvenVolume * sellingPrice
      : Infinity

    const { targetVolume, targetProfit } = params
    const vol = targetVolume || 0
    const totalRevenue = vol * sellingPrice
    const totalCost = totalFixedCost + vol * unitVariableCost
    const profit = totalRevenue - totalCost

    const targetVolumeForProfit = isViable
      ? (totalFixedCost + (targetProfit || 0)) / contributionMargin
      : Infinity

    const targetRevenueForProfit = isViable
      ? targetVolumeForProfit * sellingPrice
      : Infinity

    return {
      totalFixedCost,
      unitVariableCost,
      partnershipSplitAmount,
      contributionMargin,
      contributionMarginRate,
      breakEvenVolume,
      breakEvenRevenue,
      totalRevenue,
      totalCost,
      profit,
      targetVolumeForProfit,
      targetRevenueForProfit,
      isViable,
    }
  }, [costItems, params, partnershipSplit])

  return {
    costItems,
    params,
    partnershipSplit,
    result,
    addCostItem,
    updateCostItem,
    removeCostItem,
    applyCostTemplate,
    resetToDefault,
    updateParams,
    updatePartnershipSplit,
  }
}
