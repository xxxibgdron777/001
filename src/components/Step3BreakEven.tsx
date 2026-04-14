/**
 * 步骤 3：盈亏平衡与利润预测
 * - 盈亏平衡客户数量（核心大卡片）
 * - 利润模拟器（客户数滑块）
 * - 本量利曲线图（标注盈亏平衡点）
 */
import { useMemo } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceDot,
} from 'recharts'
import type { CVPResult, CVPParams } from '../types'
import { formatAmount, formatNumber, generateChartData } from '../utils'
import { Target, AlertTriangle, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'

interface Props {
  params: CVPParams
  result: CVPResult
  onUpdateParams: (updates: Partial<CVPParams>) => void
}

export function Step3BreakEven({ params, result, onUpdateParams }: Props) {
  const { sellingPrice, targetVolume } = params
  const {
    totalFixedCost,
    unitVariableCost,
    contributionMargin,
    breakEvenVolume,
    breakEvenRevenue,
    partnershipSplitAmount,
    isViable,
  } = result

  const bepVolume = isViable && isFinite(breakEvenVolume) ? Math.ceil(breakEvenVolume) : null
  const sliderMax = Math.max((bepVolume || 200) * 3, (targetVolume || 0) * 2, 100)
  const sliderValue = targetVolume || (bepVolume ? Math.ceil(bepVolume * 1.5) : 100)
  const currentProfit = contributionMargin * sliderValue - totalFixedCost

  const chartData = useMemo(() => {
    if (!isViable) return []
    return generateChartData(sliderMax, totalFixedCost, unitVariableCost, sellingPrice)
  }, [isViable, sliderMax, totalFixedCost, unitVariableCost, sellingPrice])

  const profitSign = currentProfit > 0 ? 'positive' : currentProfit < 0 ? 'negative' : 'zero'
  const ProfitIcon = currentProfit > 0 ? TrendingUp : currentProfit < 0 ? TrendingDown : Minus

  return (
    <section className="card card-pad mb-3">
      {/* 步骤头部 */}
      <div className="step-header">
        <div className="step-num">3</div>
        <div>
          <h2 className="step-title">盈亏平衡与利润预测</h2>
          <p className="step-desc">
            找到盈亏平衡点，预测不同客户量下的利润表现
          </p>
        </div>
      </div>

      {/* 盈亏平衡点 */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          盈亏平衡点
        </p>

        {!isViable ? (
          <div className="alert-error">
            <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">无法计算盈亏平衡点</p>
              <p className="text-xs mt-0.5 opacity-80">
                边际贡献 ≤ 0，请先调整定价或成本。
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {/* 盈亏平衡客户数 */}
            <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl p-4 border border-sky-200 text-center">
              <div className="w-10 h-10 bg-white/70 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Target className="text-sky-500" size={20} />
              </div>
              <p className="text-xs font-semibold text-sky-600 uppercase tracking-wide">
                盈亏平衡客户数量
              </p>
              <p className="metric-value text-3xl text-sky-700 mt-1">
                {bepVolume !== null ? formatNumber(bepVolume) : '—'}
              </p>
              <p className="text-sm text-sky-500 mt-0.5">客户</p>
              <div className="mt-2 p-2 bg-white/60 rounded-lg text-xs text-sky-700 font-mono">
                = {formatAmount(totalFixedCost)} ÷ {formatAmount(contributionMargin)}
              </div>
            </div>

            {/* 盈亏平衡销售额 */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">💰</span>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                盈亏平衡销售额
              </p>
              <p className="metric-value text-2xl text-gray-800 mt-1">
                {isFinite(breakEvenRevenue) ? formatAmount(breakEvenRevenue) : '—'}
              </p>
              <p className="text-sm text-gray-400 mt-0.5">元</p>
              <div className="mt-2 p-2 bg-white rounded-lg text-xs text-gray-500 font-mono">
                = {formatNumber(bepVolume || 0)} × {formatAmount(sellingPrice)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 利润模拟器 */}
      {isViable && (
        <>
          <div className="section-divider" />

          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                利润模拟器
              </p>
              <div className="has-tooltip group">
                <Info size={13} className="text-gray-400" />
                <div className="tooltip">拖动滑块模拟不同客户量的利润</div>
              </div>
            </div>

            {/* 客户数量滑块 */}
            <div className="card border border-gray-200 p-4 mb-3">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700">预估客户数量</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="input-base w-28 text-right text-base font-bold py-2"
                    value={sliderValue}
                    min={0}
                    inputMode="numeric"
                    onChange={e =>
                      onUpdateParams({ targetVolume: parseInt(e.target.value) || 0 })
                    }
                  />
                  <span className="text-sm text-gray-500">客户</span>
                </div>
              </div>

              <input
                type="range"
                className="w-full h-1.5"
                min={0}
                max={sliderMax}
                step={Math.max(1, Math.floor(sliderMax / 100))}
                value={sliderValue}
                onChange={e =>
                  onUpdateParams({ targetVolume: parseInt(e.target.value) })
                }
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
                <span>0</span>
                <span className="text-sky-500 font-medium">
                  盈亏平衡：{formatNumber(bepVolume || 0)}
                </span>
                <span>{formatNumber(sliderMax)}</span>
              </div>
            </div>

            {/* 预测结果 */}
            <div className="grid grid-cols-3 gap-3 mb-2">
              <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">销售收入</p>
                <p className="text-base font-bold text-gray-800">
                  {formatAmount(sliderValue * sellingPrice)}
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">总成本</p>
                <p className="text-base font-bold text-gray-800">
                  {formatAmount(totalFixedCost + sliderValue * unitVariableCost)}
                </p>
              </div>
              <div
                className={`rounded-xl p-3 text-center ${
                  profitSign === 'positive'
                    ? 'bg-emerald-50 border border-emerald-200'
                    : profitSign === 'negative'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">预测利润</p>
                <p
                  className={`text-base font-bold ${
                    profitSign === 'positive'
                      ? 'text-emerald-700'
                      : profitSign === 'negative'
                      ? 'text-red-600'
                      : 'text-gray-700'
                  }`}
                >
                  {formatAmount(currentProfit)}
                </p>
              </div>
            </div>

            {/* 变动成本构成（若有合作分成） */}
            {partnershipSplitAmount > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-2">
                <p className="text-xs text-amber-600 font-medium mb-1.5">当前单客户变动成本构成</p>
                <div className="flex justify-between text-xs text-amber-700">
                  <span>基数项合计</span>
                  <span>{formatAmount(unitVariableCost - partnershipSplitAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-sky-600">
                  <span>⚙️ 合作分成</span>
                  <span>{formatAmount(partnershipSplitAmount)}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-amber-700 border-t border-amber-200 pt-1 mt-1">
                  <span>合计</span>
                  <span>{formatAmount(unitVariableCost)}</span>
                </div>
              </div>
            )}

            {/* 利润状态提示 */}
            <div
              className={`flex items-center gap-2 text-xs px-3 py-2.5 rounded-xl ${
                profitSign === 'positive'
                  ? 'bg-emerald-50 text-emerald-700'
                  : profitSign === 'negative'
                  ? 'bg-red-50 text-red-600'
                  : 'bg-gray-50 text-gray-600'
              }`}
            >
              <ProfitIcon size={14} />
              {profitSign === 'positive' &&
                `盈利中，还差 ${formatNumber(Math.max(0, (bepVolume || 0) - sliderValue))} 位客户达到盈亏平衡`}
              {profitSign === 'negative' &&
                `亏损中，需再获得 ${formatNumber(Math.ceil(Math.max(0, (totalFixedCost - currentProfit) / contributionMargin)))} 位客户才能盈利`}
              {profitSign === 'zero' && '恰好保本'}
            </div>
          </div>

          {/* 本量利曲线图 */}
          {chartData.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  本量利曲线
                </p>
                <div className="has-tooltip group">
                  <Info size={12} className="text-gray-400" />
                  <div className="tooltip">绿色=收入线，红色=成本线，交点=盈亏平衡点</div>
                </div>
              </div>
              <div className="card border border-gray-100 p-3">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="volume"
                      tickFormatter={v => formatNumber(v)}
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      label={{ value: '客户数量', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#9ca3af' }}
                    />
                    <YAxis
                      tickFormatter={v => v >= 10000 ? `${Math.round(v / 10000)}万` : formatNumber(v)}
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      width={42}
                    />
                    <Tooltip
                      formatter={(val: number) => [formatAmount(val), '']}
                      labelFormatter={(label: number) => `客户数量: ${formatNumber(label)}`}
                      contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />

                    {bepVolume && (
                      <>
                        <ReferenceLine
                          x={Math.round(breakEvenVolume)}
                          stroke="#0ea5e9"
                          strokeDasharray="4 4"
                          label={{ value: '盈亏平衡点', position: 'insideTopRight', fontSize: 10, fill: '#0ea5e9' }}
                        />
                        <ReferenceDot
                          x={Math.round(breakEvenVolume)}
                          y={Math.round(breakEvenVolume * sellingPrice)}
                          r={5}
                          fill="#0ea5e9"
                          stroke="white"
                          strokeWidth={2}
                        />
                      </>
                    )}

                    <Line type="monotone" dataKey="revenue" name="销售收入" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="totalCost" name="总成本" stroke="#f43f5e" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="fixedCost" name="固定成本" stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                绿色收入线与红色成本线交叉点 = 盈亏平衡点
              </p>
            </div>
          )}
        </>
      )}
    </section>
  )
}
