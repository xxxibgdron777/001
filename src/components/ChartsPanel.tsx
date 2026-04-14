import { useMemo } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import type { CVPResult, CVPParams, CostItem } from '../types'
import { generateChartData, generatePriceProfitData, formatAmount, formatNumber } from '../utils'

interface Props {
  costItems: CostItem[]
  params: CVPParams
  result: CVPResult
}

/** 成本结构饼图颜色 */
const PIE_COLORS = ['#8b5cf6', '#f59e0b']

/** 通用 Tooltip 格式化（整数） */
const numberFormatter = (val: number) =>
  val >= 10000
    ? `${Math.round(val / 10000)}万`
    : formatNumber(val)

/**
 * 图表区
 * 1. 成本结构饼图（固定 vs 变动）
 * 2. 销量 vs 总成本 vs 销售收入（BEP 标注）
 * 3. 不同售价下的利润变化曲线
 */
export function ChartsPanel({ costItems, params, result }: Props) {
  const { sellingPrice, targetVolume } = params
  const {
    totalFixedCost,
    unitVariableCost,
    breakEvenVolume,
    isViable,
  } = result

  // ---- 成本结构饼图数据 ----
  const pieData = useMemo(() => {
    const variableTotal = costItems
      .filter(i => i.type === 'variable')
      .reduce((s, i) => s + i.amount, 0)
    return [
      { name: '固定成本', value: totalFixedCost },
      { name: '单件变动成本', value: variableTotal },
    ].filter(d => d.value > 0)
  }, [costItems, totalFixedCost])

  // ---- BEP 折线图数据 ----
  const bepChartData = useMemo(() => {
    if (!isViable) return []
    const bep = isFinite(breakEvenVolume) ? breakEvenVolume : 0
    const maxVol = Math.max(bep * 2.5, targetVolume * 1.5, 100)
    return generateChartData(maxVol, totalFixedCost, unitVariableCost, sellingPrice)
  }, [isViable, breakEvenVolume, totalFixedCost, unitVariableCost, sellingPrice, targetVolume])

  // ---- 不同售价利润曲线数据 ----
  const priceProfitData = useMemo(() => {
    const vol = targetVolume || Math.max(Math.ceil(breakEvenVolume) * 2, 100)
    if (vol <= 0 || !isViable) return []
    const minP = Math.max(unitVariableCost * 0.5, 1)
    const maxP = Math.max(sellingPrice * 2.5, unitVariableCost * 3, 100)
    return generatePriceProfitData(minP, maxP, totalFixedCost, unitVariableCost, vol)
  }, [targetVolume, breakEvenVolume, sellingPrice, totalFixedCost, unitVariableCost, isViable])

  const bepX = isFinite(breakEvenVolume) ? Math.round(breakEvenVolume) : null

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-semibold text-gray-900">📊 数据可视化</h2>

      {/* 成本结构饼图 */}
      <div className="card p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">成本结构占比</p>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(1)}%`
                }
                labelLine={false}
              >
                {pieData.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: number) => [formatAmount(val), '']}
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-32 flex items-center justify-center text-sm text-gray-400">
            暂无成本数据
          </div>
        )}
      </div>

      {/* BEP 销量图 */}
      <div className="card p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          销量 vs 总成本 vs 销售收入
          {bepX && (
            <span className="ml-2 text-sky-600 normal-case font-normal">
              （盈亏平衡点：{formatNumber(bepX)} 件）
            </span>
          )}
        </p>
        {bepChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={bepChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="volume"
                tickFormatter={numberFormatter}
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={numberFormatter}
                tick={{ fontSize: 11 }}
                tickLine={false}
                width={50}
              />
              <Tooltip
                formatter={(val: number, name: string) => [formatAmount(val), name]}
                labelFormatter={(label: number) => `销量: ${formatNumber(label)} 件`}
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {bepX && (
                <ReferenceLine
                  x={bepX}
                  stroke="#0ea5e9"
                  strokeDasharray="4 4"
                  label={{ value: 'BEP', position: 'insideTopRight', fontSize: 10, fill: '#0ea5e9' }}
                />
              )}
              <Line
                type="monotone"
                dataKey="revenue"
                name="销售收入"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="totalCost"
                name="总成本"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
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
        ) : (
          <div className="h-32 flex items-center justify-center text-sm text-gray-400">
            调整售价后图表将显示
          </div>
        )}
      </div>

      {/* 不同售价利润曲线 */}
      <div className="card p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          不同售价下的利润变化
          {targetVolume > 0 && (
            <span className="ml-2 text-gray-400 normal-case font-normal">
              （基于销量 {formatNumber(targetVolume)} 件）
            </span>
          )}
        </p>
        {priceProfitData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={priceProfitData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="price"
                tickFormatter={v => `¥${v}`}
                tick={{ fontSize: 10 }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={numberFormatter}
                tick={{ fontSize: 11 }}
                tickLine={false}
                width={50}
              />
              <Tooltip
                formatter={(val: number, name: string) => [formatAmount(val), name]}
                labelFormatter={(label: number) => `售价: ¥${label}`}
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
              />
              <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1} />
              <Bar
                dataKey="profit"
                name="利润"
                radius={[3, 3, 0, 0]}
                fill="#0ea5e9"
              >
                {priceProfitData.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={entry.profit >= 0 ? '#0ea5e9' : '#f43f5e'}
                    opacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-32 flex items-center justify-center text-sm text-gray-400">
            请先设置目标销量
          </div>
        )}
      </div>
    </div>
  )
}
