import { useState, useEffect, useMemo, useCallback } from 'react'
import type { CostItem, CVPParams, CVPResult, AppState } from '../types'
import { generateId } from '../utils'

/** localStorage 存储键 */
const STORAGE_KEY = 'cost_agent_state_v1'

/** 默认成本项 */
const DEFAULT_COST_ITEMS: CostItem[] = [
  { id: 'default-1', name: '原材料', amount: 120, type: 'variable' },
  { id: 'default-2', name: '人工成本', amount: 50, type: 'variable' },
  { id: 'default-3', name: '物流运费', amount: 30, type: 'variable' },
  { id: 'default-4', name: '厂房租金', amount: 20000, type: 'fixed' },
  { id: 'default-5', name: '管理费用', amount: 10000, type: 'fixed' },
  { id: 'default-6', name: '市场营销', amount: 8000, type: 'fixed' },
]

/** 默认计算参数 */
const DEFAULT_PARAMS: CVPParams = {
  sellingPrice: 500,
  targetVolume: 200,
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
      // 数据合法性校验
      if (Array.isArray(parsed.costItems) && parsed.params) {
        return parsed
      }
    }
  } catch {
    // ignore
  }
  return {
    costItems: DEFAULT_COST_ITEMS,
    params: DEFAULT_PARAMS,
  }
}

/**
 * 主数据 Hook —— 成本项管理 + CVP 计算
 */
export function useCostAgent() {
  const [state, setState] = useState<AppState>(loadState)

  const { costItems, params } = state

  // 持久化到 localStorage
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
  const updateCostItem = useCallback((id: string, updates: Partial<Omit<CostItem, 'id'>>) => {
    setState(prev => ({
      ...prev,
      costItems: prev.costItems.map(item =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }))
  }, [])

  /** 删除成本项 */
  const removeCostItem = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      costItems: prev.costItems.filter(item => item.id !== id),
    }))
  }, [])

  /** 应用成本模板（替换所有成本项） */
  const applyCostTemplate = useCallback((items: Omit<CostItem, 'id'>[]) => {
    setState(prev => ({
      ...prev,
      costItems: items.map(item => ({ ...item, id: generateId() })),
    }))
  }, [])

  /** 重置为默认数据 */
  const resetToDefault = useCallback(() => {
    setState({
      costItems: DEFAULT_COST_ITEMS,
      params: DEFAULT_PARAMS,
    })
  }, [])

  // ---- 参数更新 ----

  const updateParams = useCallback((updates: Partial<CVPParams>) => {
    setState(prev => ({
      ...prev,
      params: { ...prev.params, ...updates },
    }))
  }, [])

  // ---- 实时 CVP 计算（useMemo 无需手动触发） ----

  const result = useMemo<CVPResult>(() => {
    const totalFixedCost = costItems
      .filter(i => i.type === 'fixed')
      .reduce((sum, i) => sum + (i.amount || 0), 0)

    const unitVariableCost = costItems
      .filter(i => i.type === 'variable')
      .reduce((sum, i) => sum + (i.amount || 0), 0)

    const { sellingPrice, targetVolume, targetProfit } = params

    const contributionMargin = sellingPrice - unitVariableCost
    const isViable = contributionMargin > 0

    const contributionMarginRate = isViable && sellingPrice > 0
      ? (contributionMargin / sellingPrice) * 100
      : 0

    const breakEvenVolume = isViable
      ? totalFixedCost / contributionMargin
      : Infinity

    const breakEvenRevenue = isViable
      ? breakEvenVolume * sellingPrice
      : Infinity

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
  }, [costItems, params])

  return {
    costItems,
    params,
    result,
    addCostItem,
    updateCostItem,
    removeCostItem,
    applyCostTemplate,
    resetToDefault,
    updateParams,
  }
}
