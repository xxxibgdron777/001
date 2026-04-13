import type { CVPResult, CVPParams } from '../types'
import { formatAmount, formatNumber } from '../utils'
import { Crosshair } from 'lucide-react'

interface Props {
  params: CVPParams
  result: CVPResult
  onUpdateParams: (updates: Partial<CVPParams>) => void
}

/**
 * 目标利润推算面板
 * - 输入目标利润 → 自动计算所需销量和收入
 */
export function TargetProfitPanel({ params, result, onUpdateParams }: Props) {
  const { targetProfit } = params
  const { targetVolumeForProfit, targetRevenueForProfit, isViable } = result

  const validTarget = isFinite(targetVolumeForProfit) && targetVolumeForProfit > 0

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-gray-900">🎯 目标利润推算</h2>

      <div className="card p-4 flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-700">目标利润（元）</label>
        <input
          type="number"
          className="input-base"
          placeholder="输入期望的利润金额"
          value={targetProfit || ''}
          min={0}
          onChange={e => onUpdateParams({ targetProfit: parseFloat(e.target.value) || 0 })}
        />
        {!isViable && (
          <p className="text-xs text-amber-600">⚠️ 售价需高于单件变动成本才可推算</p>
        )}
      </div>

      {isViable && targetProfit > 0 && (
        <div className="card p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <Crosshair className="text-emerald-600" size={18} />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                达成目标利润 {formatAmount(targetProfit)} 所需
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-gray-400 mb-0.5">所需销量</p>
                  <p className="text-xl font-bold text-emerald-700">
                    {validTarget ? formatNumber(Math.ceil(targetVolumeForProfit)) : '—'} <span className="text-sm font-normal text-gray-500">件</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 mb-0.5">所需收入</p>
                  <p className="text-xl font-bold text-emerald-700">
                    {validTarget ? formatAmount(targetRevenueForProfit) : '—'}
                  </p>
                </div>
              </div>

              {/* 公式说明 */}
              <div className="mt-1 p-2 bg-gray-50 rounded-lg text-xs text-gray-500 font-mono leading-relaxed">
                目标销量 = (固定成本 + 目标利润) ÷ 贡献毛益
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
