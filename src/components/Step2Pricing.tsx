import type { CVPResult, CVPParams } from '../types'
import { formatAmount, formatPercent } from '../utils'
import { Info } from 'lucide-react'

interface Props {
  params: CVPParams
  result: CVPResult
  onUpdateParams: (updates: Partial<CVPParams>) => void
}

/**
 * 步骤 2：定价与边际贡献
 * - 单价滑块 + 数值输入
 * - 实时展示边际贡献、边际贡献率
 * - 不可盈利警告
 */
export function Step2Pricing({ params, result, onUpdateParams }: Props) {
  const { sellingPrice } = params
  const {
    contributionMargin,
    contributionMarginRate,
    unitVariableCost,
    isViable,
  } = result

  const maxSlider = Math.max(sellingPrice * 3, unitVariableCost * 5, 1000)

  return (
    <section className="card p-6">
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 bg-sky-500 text-white text-sm font-bold rounded-lg flex items-center justify-center flex-shrink-0">
          2
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">定价与边际贡献</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            设定每客户单价，系统实时计算边际贡献与贡献率
          </p>
        </div>
      </div>

      {/* 不可盈利警告 */}
      {!isViable && (
        <div className="alert-warning mb-4">
          <span className="text-base">⚠️</span>
          <div>
            <p className="font-semibold">当前定价无法覆盖变动成本，无法实现盈利</p>
            <p className="text-xs mt-0.5">
              单价（{formatAmount(sellingPrice)}）≤ 单客户变动成本（{formatAmount(unitVariableCost)}），
              边际贡献 ≤ 0。请提高单价或降低变动成本。
            </p>
          </div>
        </div>
      )}

      {/* 定价输入 */}
      <div className="card border border-gray-200 p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-gray-700">单价设定</span>
            <div className="group relative">
              <Info size={13} className="text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-800 text-white text-[10px] rounded-lg
                              opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                每获得一个客户带来的收入
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number"
              className="input-base w-32 text-right text-lg font-bold"
              value={sellingPrice}
              min={0}
              step={10}
              onChange={e => onUpdateParams({ sellingPrice: parseFloat(e.target.value) || 0 })}
            />
            <span className="text-sm text-gray-500">元 / 客户</span>
          </div>
        </div>

        {/* 滑块 */}
        <div className="space-y-2">
          <input
            type="range"
            className="w-full h-2 bg-gray-100 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #0ea5e9 ${Math.min((sellingPrice / maxSlider) * 100, 100)}%, #f1f5f9 ${Math.min((sellingPrice / maxSlider) * 100, 100)}%)`,
            }}
            min={0}
            max={maxSlider}
            step={10}
            value={sellingPrice}
            onChange={e => onUpdateParams({ sellingPrice: parseFloat(e.target.value) })}
          />
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>0 元</span>
            <span>变动成本线：{formatAmount(unitVariableCost)}</span>
            <span>{formatAmount(maxSlider)} 元</span>
          </div>
        </div>
      </div>

      {/* 边际贡献指标 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className={`rounded-xl p-4 border ${isViable ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              单客户边际贡献
            </p>
            <div className="group relative">
              <Info size={12} className="text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-800 text-white text-[10px] rounded-lg
                              opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                每客户收入 - 每客户变动成本
              </div>
            </div>
          </div>
          <p className={`text-3xl font-bold ${isViable ? 'text-emerald-700' : 'text-red-600'}`}>
            {formatAmount(contributionMargin)}
          </p>
          <p className="text-xs text-gray-400 mt-1">元 / 客户</p>
          {/* 计算公式 */}
          <div className="mt-2 p-2 bg-white/70 rounded-lg text-xs text-gray-500 font-mono">
            {formatAmount(sellingPrice)} − {formatAmount(unitVariableCost)} = {formatAmount(contributionMargin)}
          </div>
        </div>

        <div className={`rounded-xl p-4 border ${isViable ? 'border-sky-200 bg-sky-50' : 'border-red-200 bg-red-50'}`}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              边际贡献率
            </p>
            <div className="group relative">
              <Info size={12} className="text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-800 text-white text-[10px] rounded-lg
                              opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                边际贡献 ÷ 单价 × 100%
              </div>
            </div>
          </div>
          <p className={`text-3xl font-bold ${isViable ? 'text-sky-700' : 'text-red-600'}`}>
            {isViable ? formatPercent(contributionMarginRate) : '—'}
          </p>
          <p className="text-xs text-gray-400 mt-1">每元收入中可用于覆盖固定成本的占比</p>
          {/* 计算公式 */}
          {isViable && (
            <div className="mt-2 p-2 bg-white/70 rounded-lg text-xs text-gray-500 font-mono">
              {formatAmount(contributionMargin)} ÷ {formatAmount(sellingPrice)} × 100% = {formatPercent(contributionMarginRate)}
            </div>
          )}
        </div>
      </div>

      {/* 提示 */}
      <div className="alert-info">
        <div className="text-xs leading-relaxed">
          <p className="font-semibold text-sky-800 mb-1">什么是边际贡献？</p>
          <p>
            边际贡献 = 单价 − 单客户变动成本，表示每获得一个客户，在扣除直接成本后对固定成本的贡献。
            边际贡献率越高，说明每单位收入的盈利质量越好。
          </p>
        </div>
      </div>
    </section>
  )
}
