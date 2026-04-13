import type { CVPResult } from '../types'
import { formatAmount, formatNumber } from '../utils'
import { DollarSign, Target, TrendingUp, BarChart2 } from 'lucide-react'

interface Props {
  result: CVPResult
}

/**
 * 顶部核心指标大卡片
 * - 利润 / 盈亏平衡点 / 总固定成本 / 单件变动成本
 */
export function MetricCards({ result }: Props) {
  const { profit, breakEvenVolume, totalFixedCost, unitVariableCost, isViable } = result

  const metrics = [
    {
      label: '当前利润',
      value: formatAmount(profit),
      icon: <TrendingUp size={18} />,
      color: profit >= 0 ? 'text-emerald-600' : 'text-red-500',
      bg: profit >= 0 ? 'bg-emerald-50' : 'bg-red-50',
      iconColor: profit >= 0 ? 'text-emerald-500' : 'text-red-500',
      sub: profit >= 0 ? '正在盈利' : '亏损中',
    },
    {
      label: '盈亏平衡销量',
      value: isViable && isFinite(breakEvenVolume)
        ? `${formatNumber(Math.ceil(breakEvenVolume))} 件`
        : '无法计算',
      icon: <Target size={18} />,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      iconColor: 'text-sky-500',
      sub: isViable ? '最低保本销量' : '贡献毛益 ≤ 0',
    },
    {
      label: '总固定成本',
      value: formatAmount(totalFixedCost),
      icon: <BarChart2 size={18} />,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      iconColor: 'text-violet-500',
      sub: '不随销量变化',
    },
    {
      label: '单件变动成本',
      value: formatAmount(unitVariableCost),
      icon: <DollarSign size={18} />,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      sub: '每生产一件的成本',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {metrics.map(m => (
        <div key={m.label} className="card p-4 flex items-start gap-3">
          <div className={`w-9 h-9 ${m.bg} rounded-xl flex items-center justify-center flex-shrink-0 ${m.iconColor}`}>
            {m.icon}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide truncate">{m.label}</p>
            <p className={`text-lg font-bold leading-tight mt-0.5 ${m.color}`}>{m.value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{m.sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
