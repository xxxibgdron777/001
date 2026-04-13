import type { CVPResult, CVPParams } from '../types'
import { formatAmount, formatNumber } from '../utils'
import { Crosshair, AlertCircle, Info } from 'lucide-react'

interface Props {
  params: CVPParams
  result: CVPResult
  onUpdateParams: (updates: Partial<CVPParams>) => void
}

/**
 * 步骤 4：目标利润倒推
 * - 输入目标利润 → 计算所需客户数量及对应销售额
 */
export function Step4TargetProfit({ params, result, onUpdateParams }: Props) {
  const { targetProfit } = params
  const {
    targetVolumeForProfit,
    targetRevenueForProfit,
    totalFixedCost,
    contributionMargin,
    breakEvenVolume,
    breakEvenRevenue,
    isViable,
  } = result

  const validTarget = isViable && isFinite(targetVolumeForProfit) && targetVolumeForProfit > 0
  const bepVol = isViable && isFinite(breakEvenVolume) ? breakEvenVolume : 0

  return (
    <section className="card p-6">
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 bg-sky-500 text-white text-sm font-bold rounded-lg flex items-center justify-center flex-shrink-0">
          4
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">目标利润倒推</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            输入目标利润，自动计算所需客户数量及对应销售额
          </p>
        </div>
      </div>

      {/* 目标利润输入 */}
      <div className="card border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-gray-700">目标利润（元）</span>
          <div className="group relative">
            <Info size={12} className="text-gray-400 cursor-help" />
            <div className="absolute bottom-full left-0 mb-1.5 px-2 py-1 bg-gray-800 text-white text-[10px] rounded-lg
                            opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              期望在盈亏平衡基础上额外获得的利润
            </div>
          </div>
        </div>
        <div className="relative">
          <input
            type="number"
            className="input-base w-full pr-12 text-base font-semibold"
            placeholder="输入目标利润，如：50000"
            value={targetProfit || ''}
            min={0}
            onChange={e => onUpdateParams({ targetProfit: parseFloat(e.target.value) || 0 })}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">元</span>
        </div>

        {!isViable && (
          <div className="alert-warning mt-3">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">无法计算，请先调整定价或成本</p>
              <p className="text-xs mt-0.5">边际贡献需大于 0 才能进行目标利润推算。</p>
            </div>
          </div>
        )}
      </div>

      {/* 计算结果 */}
      {isViable && targetProfit > 0 && validTarget && (
        <div className="mb-4">
          {/* 核心结果卡片 */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 border border-emerald-200 mb-3">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-3">
              达成目标利润 {formatAmount(targetProfit)} 所需
            </p>

            <div className="grid grid-cols-2 gap-4">
              {/* 所需客户数 */}
              <div>
                <p className="text-xs font-medium text-emerald-700 mb-1">所需客户数量</p>
                <p className="text-3xl font-bold text-emerald-700 leading-none">
                  {formatNumber(Math.ceil(targetVolumeForProfit))}
                </p>
                <p className="text-xs text-emerald-500 mt-1">客户</p>
              </div>

              {/* 对应销售额 */}
              <div>
                <p className="text-xs font-medium text-emerald-700 mb-1">对应销售额</p>
                <p className="text-3xl font-bold text-emerald-700 leading-none">
                  {formatAmount(targetRevenueForProfit)}
                </p>
                <p className="text-xs text-emerald-500 mt-1">元</p>
              </div>
            </div>

            {/* 公式说明 */}
            <div className="mt-3 p-2.5 bg-white/70 rounded-lg space-y-1">
              <p className="text-xs text-emerald-700 font-semibold mb-1">计算公式</p>
              <p className="text-xs text-emerald-700 font-mono">
                目标客户数 = (总固定成本 + 目标利润) ÷ 边际贡献
              </p>
              <p className="text-xs text-emerald-600 font-mono">
                = ({formatAmount(totalFixedCost)} + {formatAmount(targetProfit)}) ÷ {formatAmount(contributionMargin)}
              </p>
              <p className="text-xs text-emerald-600 font-mono">
                ≈ {formatNumber(Math.ceil(targetVolumeForProfit))} 位客户
              </p>
            </div>
          </div>

          {/* 对比分析 */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">与盈亏平衡对比</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">盈亏平衡客户数</span>
                <span className="text-xs font-semibold text-gray-700">{formatNumber(Math.ceil(bepVol))} 客户</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">盈亏平衡销售额</span>
                <span className="text-xs font-semibold text-gray-700">{formatAmount(breakEvenRevenue)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-1.5">
                <span className="text-xs text-gray-500">目标客户较盈亏平衡多</span>
                <span className="text-xs font-bold text-emerald-600">
                  +{formatNumber(Math.ceil(targetVolumeForProfit - bepVol))} 客户
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">目标销售额较盈亏平衡多</span>
                <span className="text-xs font-bold text-emerald-600">
                  +{formatAmount(targetRevenueForProfit - breakEvenRevenue)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 空白状态 */}
      {isViable && targetProfit === 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-3">
          <Crosshair size={16} />
          <span>输入目标利润，即可查看所需客户数量和对应销售额</span>
        </div>
      )}
    </section>
  )
}
