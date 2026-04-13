import type { CVPResult } from '../types'
import { formatAmount, formatNumber } from '../utils'
import { Target, AlertCircle } from 'lucide-react'

interface Props {
  result: CVPResult
}

/**
 * 盈亏平衡点分析面板
 * - BEP 销量和收入
 * - 关键指标卡片展示
 */
export function BreakEvenPanel({ result }: Props) {
  const {
    breakEvenVolume,
    breakEvenRevenue,
    totalFixedCost,
    unitVariableCost,
    isViable,
    contributionMargin,
  } = result

  const bepVolume = isFinite(breakEvenVolume) ? Math.ceil(breakEvenVolume) : null

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-gray-900">⚖️ 盈亏平衡点</h2>

      {!isViable ? (
        <div className="alert-warning">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">贡献毛益 ≤ 0，无盈亏平衡点</p>
            <p className="text-xs mt-0.5">当售价低于单件变动成本时，无法计算盈亏平衡销量。</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {/* BEP 核心指标 */}
          <div className="card p-4 border-l-4 border-l-sky-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                  盈亏平衡销量
                </p>
                <p className="text-3xl font-bold text-sky-600">
                  {bepVolume !== null ? formatNumber(bepVolume) : '—'}
                </p>
                <p className="text-xs text-gray-400 mt-1">件</p>
              </div>
              <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                <Target className="text-sky-500" size={22} />
              </div>
            </div>
          </div>

          <div className="card p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
              盈亏平衡收入
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {isFinite(breakEvenRevenue) ? formatAmount(breakEvenRevenue) : '—'}
            </p>
          </div>

          {/* 计算公式说明 */}
          <div className="alert-info">
            <div className="text-xs leading-relaxed">
              <p className="font-semibold mb-1">计算公式</p>
              <p>BEP 销量 = 总固定成本 ÷ 贡献毛益</p>
              <p className="text-sky-700 font-mono mt-1">
                = {formatAmount(totalFixedCost)} ÷ {formatAmount(unitVariableCost > 0 ? contributionMargin : 0)}
              </p>
              {bepVolume !== null && (
                <p className="text-sky-700 font-mono">
                  ≈ {formatNumber(bepVolume)} 件
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
