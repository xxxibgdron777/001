import { useCostAgent } from './hooks/useCostAgent'
import { CostManager } from './components/CostManager'
import { CVPCalculator } from './components/CVPCalculator'
import { BreakEvenPanel } from './components/BreakEvenPanel'
import { TargetProfitPanel } from './components/TargetProfitPanel'
import { ChartsPanel } from './components/ChartsPanel'
import { MetricCards } from './components/MetricCards'
import { RotateCcw } from 'lucide-react'

/**
 * 产品成本分解 Agent 主应用
 */
export default function App() {
  const {
    costItems,
    params,
    result,
    addCostItem,
    updateCostItem,
    removeCostItem,
    applyCostTemplate,
    resetToDefault,
    updateParams,
  } = useCostAgent()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">💰</span>
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-tight">产品成本分解 Agent</h1>
              <p className="text-[10px] text-gray-400">CVP 本量利分析 · 实时计算 · 数据持久化</p>
            </div>
          </div>
          <button
            className="btn-secondary flex items-center gap-1.5 text-xs"
            onClick={resetToDefault}
            title="重置为默认数据"
          >
            <RotateCcw size={13} />
            重置
          </button>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-5 space-y-5">
        {/* 核心指标卡片行 */}
        <MetricCards result={result} />

        {/* 三栏主内容 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 左栏：成本管理 */}
          <div className="space-y-4">
            <CostManager
              costItems={costItems}
              onAdd={addCostItem}
              onUpdate={updateCostItem}
              onRemove={removeCostItem}
              onApplyTemplate={applyCostTemplate}
            />
          </div>

          {/* 中栏：本量利 + 盈亏平衡 */}
          <div className="space-y-4">
            <CVPCalculator
              params={params}
              result={result}
              onUpdateParams={updateParams}
            />
            <div className="card p-4">
              <BreakEvenPanel result={result} />
            </div>
          </div>

          {/* 右栏：目标利润 + 图表 */}
          <div className="space-y-4">
            <div className="card p-4">
              <TargetProfitPanel
                params={params}
                result={result}
                onUpdateParams={updateParams}
              />
            </div>
            <ChartsPanel
              costItems={costItems}
              params={params}
              result={result}
            />
          </div>
        </div>

        {/* 底部说明 */}
        <footer className="text-center text-[11px] text-gray-300 py-4">
          数据仅保存在本地浏览器（localStorage），刷新不丢失 · 产品成本分解 Agent v1.0
        </footer>
      </main>
    </div>
  )
}
