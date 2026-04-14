/**
 * 步骤 2：定价与边际贡献
 * - 展示：单客户变动成本（含合作分成明细）
 * - 实时计算：边际贡献 = 单价 − 单客户变动成本
 * - 边际贡献 ≤ 0 时红色警告
 */
import type { CVPResult, CVPParams } from '../types'
import { formatAmount, formatPercent } from '../utils'
import { Info, AlertTriangle } from 'lucide-react'

interface Props {
  params: CVPParams
  result: CVPResult
  onUpdateParams: (updates: Partial<CVPParams>) => void
}

export function Step2Pricing({ params, result, onUpdateParams }: Props) {
  const { sellingPrice } = params
  const {
    contributionMargin,
    contributionMarginRate,
    unitVariableCost,
    partnershipSplitAmount,
    isViable,
  } = result

  // 计算基数之和（不含合作分成）用于公式展示
  const baseSum = unitVariableCost - partnershipSplitAmount

  const maxSlider = Math.max(sellingPrice * 3, unitVariableCost * 5, 500)

  return (
    <section className="card card-pad mb-3">
      {/* 步骤头部 */}
      <div className="step-header">
        <div className="step-num">2</div>
        <div>
          <h2 className="step-title">定价与边际贡献</h2>
          <p className="step-desc">
            设定每客户单价，实时计算边际贡献与贡献率
          </p>
        </div>
      </div>

      {/* 不可盈利警告 */}
      {!isViable && (
        <div className="alert-error mb-4">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">
              当前定价无法覆盖变动成本，无法实现盈利
            </p>
            <p className="text-xs mt-1 opacity-80">
              单价 ≤ 单客户变动成本（{formatAmount(unitVariableCost)}），边际贡献 ≤ 0。
              请提高单价或降低变动成本。
            </p>
          </div>
        </div>
      )}

      {/* 单价输入区 */}
      <div className="card border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">单价设定</span>
            <div className="has-tooltip group">
              <Info size={14} className="text-gray-400" />
              <div className="tooltip">每获得一个客户带来的收入</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              className="input-base w-36 text-right text-xl font-bold py-2"
              value={sellingPrice}
              min={0}
              step={100}
              inputMode="decimal"
              onChange={e =>
                onUpdateParams({ sellingPrice: parseFloat(e.target.value) || 0 })
              }
            />
            <span className="text-sm text-gray-500">元/客户</span>
          </div>
        </div>

        {/* 滑块 */}
        <div className="space-y-3">
          <input
            type="range"
            className="w-full h-1.5"
            min={0}
            max={maxSlider}
            step={100}
            value={sellingPrice}
            onChange={e =>
              onUpdateParams({ sellingPrice: parseFloat(e.target.value) })
            }
          />
          <div className="flex justify-between text-xs text-gray-400 px-1">
            <span>0 元</span>
            <span className="text-amber-500 font-medium">
              变动成本线：{formatAmount(unitVariableCost)}
            </span>
            <span>{formatAmount(maxSlider)} 元</span>
          </div>
        </div>
      </div>

      {/* 变动成本明细 */}
      {partnershipSplitAmount > 0 && (
        <div className="card border border-amber-100 bg-amber-50 p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs font-semibold text-amber-600">单客户变动成本明细</p>
            <div className="has-tooltip group">
              <Info size={12} className="text-amber-400" />
              <div className="tooltip">变动成本 = 基数项之和 + 合作分成</div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-700">基数项合计（直接成本）</span>
              <span className="font-semibold text-amber-700">
                {formatAmount(baseSum)} / 客户
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-sky-600">⚙️ 合作分成（动态计算）</span>
              <span className="font-semibold text-sky-600">
                {formatAmount(partnershipSplitAmount)} / 客户
              </span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-amber-200 pt-1">
              <span className="text-amber-700 font-medium">单客户变动成本合计</span>
              <span className="font-bold text-amber-700">
                {formatAmount(unitVariableCost)} / 客户
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 边际贡献指标 */}
      <div className="grid grid-cols-2 gap-3">
        {/* 单客户边际贡献 */}
        <div
          className={`rounded-xl p-4 border ${
            isViable
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-red-200 bg-red-50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              单客户边际贡献
            </p>
            <div className="has-tooltip group">
              <Info size={12} className="text-gray-400" />
              <div className="tooltip">
                单价 − 单客户变动成本（含合作分成）
              </div>
            </div>
          </div>
          <p
            className={`metric-value ${isViable ? 'text-emerald-700' : 'text-red-600'}`}
          >
            {formatAmount(contributionMargin)}
          </p>
          <p className="text-xs text-gray-400 mt-1">元 / 客户</p>
          {/* 公式 */}
          <div className="mt-2 p-2 bg-white/70 rounded-lg text-xs text-gray-500 font-mono">
            {formatAmount(sellingPrice)} − {formatAmount(unitVariableCost)} ={' '}
            {formatAmount(contributionMargin)}
          </div>
        </div>

        {/* 边际贡献率 */}
        <div
          className={`rounded-xl p-4 border ${
            isViable ? 'border-sky-200 bg-sky-50' : 'border-red-200 bg-red-50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              边际贡献率
            </p>
            <div className="has-tooltip group">
              <Info size={12} className="text-gray-400" />
              <div className="tooltip">边际贡献 ÷ 单价 × 100%</div>
            </div>
          </div>
          <p
            className={`metric-value ${isViable ? 'text-sky-700' : 'text-red-600'}`}
          >
            {isViable ? formatPercent(contributionMarginRate) : '—'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            每元收入中可用于覆盖固定成本的占比
          </p>
          {isViable && (
            <div className="mt-2 p-2 bg-white/70 rounded-lg text-xs text-gray-500 font-mono">
              {formatAmount(contributionMargin)} ÷ {formatAmount(sellingPrice)}{' '}
              = {formatPercent(contributionMarginRate)}
            </div>
          )}
        </div>
      </div>

      {/* 术语说明 */}
      <div className="mt-4 alert-info">
        <p className="font-semibold text-sky-800 mb-1 text-sm">
          什么是边际贡献？
        </p>
        <p className="text-xs leading-relaxed opacity-80">
          边际贡献 = 单价 − 单客户变动成本，表示每获得一个客户，在扣除直接成本（基数成本 +
          合作分成）后对固定成本的贡献。边际贡献率越高，每单位收入的盈利质量越好。
        </p>
      </div>
    </section>
  )
}
