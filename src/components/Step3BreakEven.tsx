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
import { Target, AlertCircle, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'

interface Props {
  params: CVPParams
  result: CVPResult
  onUpdateParams: (updates: Partial<CVPParams>) => void
}

/**
 * 步骤 3：盈亏平衡与利润预测
 * - 盈亏平衡点核心指标（大数字卡片）
 * - 利润模拟器（客户数量滑块）
 * - 本量利曲线图（含 BEP 标注）
 */
export function Step3BreakEven({ params, result, onUpdateParams }: Props) {
  const { sellingPrice, targetVolume } = params
  const {
    totalFixedCost,
    unitVariableCost,
    contributionMargin,
    breakEvenVolume,
    breakEvenRevenue,
    profit,
    isViable,
  } = result

  const bepVolume = isViable && isFinite(breakEvenVolume) ? Math.ceil(breakEvenVolume) : null

  // 默认滑块填充盈亏平衡点的 1.5 倍
  const sliderMax = Math.max((bepVolume || 200) * 3, (targetVolume || 0) * 2, 100)
  const sliderValue = targetVolume || (bepVolume ? Math.ceil(bepVolume * 1.5) : 100)

  // 计算当前利润（用于滑块位置对应的利润）
  const currentProfit = (sellingPrice - unitVariableCost) * sliderValue - totalFixedCost

  // 图表数据
  const chartData = useMemo(() => {
    if (!isViable) return []
    return generateChartData(sliderMax, totalFixedCost, unitVariableCost, sellingPrice)
  }, [isViable, sliderMax, totalFixedCost, unitVariableCost, sellingPrice])

  const profitSign = currentProfit > 0 ? 'positive' : currentProfit < 0 ? 'negative' : 'zero'
  const ProfitIcon = currentProfit > 0 ? TrendingUp : currentProfit < 0 ? TrendingDown : Minus

  return (
    <section className="card p-6">
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 bg-sky-500 text-white text-sm font-bold rounded-lg flex items-center justify-center flex-shrink-0">
          3
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">盈亏平衡与利润预测</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            找到盈亏平衡点，预测不同客户量下的利润表现
          </p>
        </div>
      </div>

      {/* 上半部分：盈亏平衡点 */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">盈亏平衡点</p>

        {!isViable ? (
          <div className="alert-warning">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">无法计算盈亏平衡点</p>
              <p className="text-xs mt-0.5">边际贡献 ≤ 0，请先在步骤 2 调整定价。</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {/* 盈亏平衡客户数 — 核心大卡片 */}
            <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl p-5 border border-sky-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-sky-600 uppercase tracking-wide">
                  盈亏平衡客户数量
                </p>
                <div className="w-10 h-10 bg-white/70 rounded-xl flex items-center justify-center">
                  <Target className="text-sky-500" size={18} />
                </div>
              </div>
              <p className="text-4xl font-bold text-sky-700 leading-none">
                {bepVolume !== null ? formatNumber(bepVolume) : '—'}
              </p>
              <p className="text-sm text-sky-500 mt-1">客户</p>
              <div className="mt-3 p-2 bg-white/60 rounded-lg text-xs text-sky-700 font-mono">
                = {formatAmount(totalFixedCost)} ÷ {formatAmount(contributionMargin)}
              </div>
            </div>

            {/* 盈亏平衡销售额 */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  盈亏平衡销售额
                </p>
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <span className="text-lg">💰</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800 leading-none">
                {isFinite(breakEvenRevenue) ? formatAmount(breakEvenRevenue) : '—'}
              </p>
              <p className="text-sm text-gray-400 mt-1">元</p>
              <div className="mt-3 p-2 bg-white rounded-lg text-xs text-gray-500 font-mono">
                = {formatNumber(bepVolume || 0)} × {formatAmount(sellingPrice)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 下半部分：利润模拟器 */}
      {isViable && (
        <>
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">利润模拟器</p>

            {/* 客户数量滑块 */}
            <div className="card border border-gray-200 p-4 mb-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">预估客户数量</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    className="input-base w-28 text-right text-base font-bold"
                    value={sliderValue}
                    min={0}
                    onChange={e => onUpdateParams({ targetVolume: parseInt(e.target.value) || 0 })}
                  />
                  <span className="text-sm text-gray-500">客户</span>
                </div>
              </div>

              <input
                type="range"
                className="w-full h-2 bg-gray-100 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${
                    profitSign === 'positive' ? '#10b981' : profitSign === 'negative' ? '#f43f5e' : '#9ca3af'
                  } ${Math.min((sliderValue / sliderMax) * 100, 100)}%, #f1f5f9 ${Math.min((sliderValue / sliderMax) * 100, 100)}%)`,
                }}
                min={0}
                max={sliderMax}
                step={Math.max(1, Math.floor(sliderMax / 100))}
                value={sliderValue}
                onChange={e => onUpdateParams({ targetVolume: parseInt(e.target.value) })}
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>0</span>
                <span className="text-sky-500 font-medium">盈亏平衡点：{formatNumber(bepVolume || 0)}</span>
                <span>{formatNumber(sliderMax)}</span>
              </div>
            </div>

            {/* 当前预测结果 */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">销售收入</p>
                <p className="text-base font-bold text-gray-800">{formatAmount(sliderValue * sellingPrice)}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">总成本</p>
                <p className="text-base font-bold text-gray-800">
                  {formatAmount(totalFixedCost + sliderValue * unitVariableCost)}
                </p>
              </div>
              <div className={`rounded-xl p-3 text-center ${
                profitSign === 'positive' ? 'bg-emerald-50 border border-emerald-200' :
                profitSign === 'negative' ? 'bg-red-50 border border-red-200' :
                'bg-gray-50 border border-gray-200'
              }`}>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">预测利润</p>
                <p className={`text-base font-bold ${
                  profitSign === 'positive' ? 'text-emerald-700' :
                  profitSign === 'negative' ? 'text-red-600' : 'text-gray-700'
                }`}>
                  {formatAmount(currentProfit)}
                </p>
              </div>
            </div>

            {/* 利润状态提示 */}
            <div className={`mt-2 flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
              profitSign === 'positive' ? 'bg-emerald-50 text-emerald-700' :
              profitSign === 'negative' ? 'bg-red-50 text-red-600' :
              'bg-gray-50 text-gray-600'
            }`}>
              <ProfitIcon size={13} />
              {profitSign === 'positive' && `盈利中，还差 ${formatNumber(bepVolume ? Math.max(0, bepVolume - sliderValue) : 0)} 位客户达到盈亏平衡`}
              {profitSign === 'negative' && `亏损中，需再获得 ${formatNumber(Math.ceil(Math.max(0, (totalFixedCost - currentProfit) / contributionMargin)))} 位客户才能盈利`}
              {profitSign === 'zero' && '恰好保本'}
            </div>
          </div>

          {/* 本量利曲线图 */}
          {chartData.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  客户数量 vs 总成本 / 销售收入
                </p>
                <div className="group relative">
                  <Info size={12} className="text-gray-400 cursor-help" />
                  <div className="absolute bottom-full right-0 mb-1.5 px-2 py-1 bg-gray-800 text-white text-[10px] rounded-lg
                                  opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    绿色 = 收入线，红色 = 成本线，交点为盈亏平衡点
                  </div>
                </div>
              </div>
              <div className="card border border-gray-100 p-3">
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="volume"
                      tickFormatter={v => formatNumber(v)}
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      label={{ value: '客户数量', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#9ca3af' }}
                    />
                    <YAxis
                      tickFormatter={v => v >= 10000 ? `${(v / 10000).toFixed(0)}万` : formatNumber(v)}
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      width={48}
                    />
                    <Tooltip
                      formatter={(val: number, name: string) => [formatAmount(val), name]}
                      labelFormatter={(label: number) => `客户数量: ${formatNumber(label)}`}
                      contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />

                    {/* 盈亏平衡点标注 */}
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

                    {/* 收入线 */}
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="销售收入"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                    {/* 总成本线 */}
                    <Line
                      type="monotone"
                      dataKey="totalCost"
                      name="总成本"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                    {/* 固定成本线 */}
                    <Line
                      type="monotone"
                      dataKey="fixedCost"
                      name="固定成本"
                      stroke="#8b5cf6"
                      strokeWidth={1.5}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-2">
                绿色收入线与红色成本线交叉点 = 盈亏平衡点
              </p>
            </div>
          )}
        </>
      )}
    </section>
  )
}
