import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { CVPResult, CVPParams } from '../types'
import { formatAmount, formatNumber, formatPercent } from '../utils'

interface Props {
  params: CVPParams
  result: CVPResult
  onUpdateParams: (updates: Partial<CVPParams>) => void
}

/**
 * 本量利计算面板
 * - 售价滑块 + 输入
 * - 目标销量输入
 * - 实时结果展示
 */
export function CVPCalculator({ params, result, onUpdateParams }: Props) {
  const { sellingPrice, targetVolume } = params
  const {
    contributionMargin,
    contributionMarginRate,
    totalRevenue,
    totalCost,
    profit,
    isViable,
    unitVariableCost,
  } = result

  const maxSlider = Math.max(sellingPrice * 3, unitVariableCost * 3, 1000)
  const profitSign = profit > 0 ? 'positive' : profit < 0 ? 'negative' : 'zero'
  const ProfitIcon = profit > 0 ? TrendingUp : profit < 0 ? TrendingDown : Minus

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-gray-900">💹 本量利模型</h2>

      {/* 不可盈利提示 */}
      {!isViable && (
        <div className="alert-warning">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">无法实现盈亏平衡</p>
            <p className="text-xs mt-0.5">
              当前售价 ≤ 单件变动成本（{formatAmount(unitVariableCost)}），贡献毛益为负，
              无论销量多少都无法覆盖固定成本，请提高售价或降低变动成本。
            </p>
          </div>
        </div>
      )}

      {/* 售价输入 */}
      <div className="card p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">预期售价</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              className="input-base w-28 text-right text-base font-semibold"
              value={sellingPrice}
              min={0}
              step={10}
              onChange={e => onUpdateParams({ sellingPrice: parseFloat(e.target.value) || 0 })}
            />
            <span className="text-sm text-gray-500">元</span>
          </div>
        </div>
        <input
          type="range"
          className="w-full h-2 rounded-full cursor-pointer"
          min={0}
          max={maxSlider}
          step={10}
          value={sellingPrice}
          onChange={e => onUpdateParams({ sellingPrice: parseFloat(e.target.value) })}
        />
        <div className="flex justify-between text-[10px] text-gray-400">
          <span>0</span>
          <span>{formatNumber(maxSlider / 2)} 元</span>
          <span>{formatNumber(maxSlider)} 元</span>
        </div>
      </div>

      {/* 目标销量 */}
      <div className="card p-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block">目标销量（件）</label>
        <input
          type="number"
          className="input-base"
          placeholder="输入目标销量（可选）"
          value={targetVolume || ''}
          min={0}
          onChange={e => onUpdateParams({ targetVolume: parseInt(e.target.value) || 0 })}
        />
      </div>

      {/* 贡献毛益卡片 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="metric-card">
          <span className="metric-label">贡献毛益</span>
          <span className={`metric-value ${isViable ? 'text-emerald-600' : 'text-red-500'}`}>
            {formatAmount(contributionMargin)}
          </span>
          <span className="text-xs text-gray-400">每件商品对固定成本的贡献</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">贡献毛益率</span>
          <span className={`metric-value ${isViable ? 'text-emerald-600' : 'text-red-500'}`}>
            {isViable ? formatPercent(contributionMarginRate) : '—'}
          </span>
          <span className="text-xs text-gray-400">贡献毛益 / 售价 × 100%</span>
        </div>
      </div>

      {/* 销量对应收益（仅在有目标销量时展示） */}
      {targetVolume > 0 && (
        <div className="card p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            目标销量 {formatNumber(targetVolume)} 件 · 测算结果
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-gray-400 font-medium">销售收入</span>
              <span className="text-sm font-bold text-gray-900">{formatAmount(totalRevenue)}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-gray-400 font-medium">总成本</span>
              <span className="text-sm font-bold text-gray-900">{formatAmount(totalCost)}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-gray-400 font-medium">利润</span>
              <span className={`text-sm font-bold ${
                profitSign === 'positive' ? 'text-emerald-600' :
                profitSign === 'negative' ? 'text-red-500' : 'text-gray-700'
              }`}>
                {formatAmount(profit)}
              </span>
            </div>
          </div>

          {/* 利润状态指示 */}
          <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
            profitSign === 'positive' ? 'bg-emerald-50 text-emerald-700' :
            profitSign === 'negative' ? 'bg-red-50 text-red-600' :
            'bg-gray-50 text-gray-600'
          }`}>
            <ProfitIcon size={14} />
            {profitSign === 'positive' && `盈利 ${formatAmount(profit)}，利润率 ${formatPercent(profit / totalRevenue * 100)}`}
            {profitSign === 'negative' && `亏损 ${formatAmount(Math.abs(profit))}，尚需 ${formatNumber(Math.ceil(-profit / Math.max(contributionMargin, 0.01)))} 件弥补`}
            {profitSign === 'zero' && '恰好保本'}
          </div>
        </div>
      )}
    </div>
  )
}
