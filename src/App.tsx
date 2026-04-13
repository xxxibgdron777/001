import { useCostAgent } from './hooks/useCostAgent'
import { Step1CostConfig } from './components/Step1CostConfig'
import { Step2Pricing } from './components/Step2Pricing'
import { Step3BreakEven } from './components/Step3BreakEven'
import { Step4TargetProfit } from './components/Step4TargetProfit'
import { RotateCcw } from 'lucide-react'

/**
 * 产品成本分解 Agent — 四步骤任务流
 * 布局：顶部导航 + 四个垂直大卡片，用户按顺序操作
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
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">💰</span>
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-tight">产品成本分解 Agent</h1>
              <p className="text-[10px] text-gray-400">CVP 本量利分析 · 实时计算 · 数据持久化</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-400 hidden sm:block">
              数据仅保存在本地浏览器
            </span>
            <button
              className="btn-secondary flex items-center gap-1.5 text-xs"
              onClick={resetToDefault}
              title="重置为默认数据"
            >
              <RotateCcw size={13} />
              重置
            </button>
          </div>
        </div>
      </header>

      {/* 进度指示器 */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-1 h-10">
            {[
              { n: 1, label: '成本结构' },
              { n: 2, label: '定价' },
              { n: 3, label: '盈亏分析' },
              { n: 4, label: '目标推算' },
            ].map((step, idx) => (
              <div key={step.n} className="flex items-center gap-1 flex-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center">
                    {step.n}
                  </div>
                  <span className="text-xs font-medium text-gray-600 hidden sm:block">{step.label}</span>
                </div>
                {idx < 3 && <div className="flex-1 h-px bg-gray-200 mx-1" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 四步骤主内容 */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {/* 步骤 1：成本结构配置 */}
        <Step1CostConfig
          costItems={costItems}
          result={result}
          onAdd={addCostItem}
          onUpdate={updateCostItem}
          onRemove={removeCostItem}
          onApplyTemplate={applyCostTemplate}
        />

        {/* 步骤 2：定价与边际贡献 */}
        <Step2Pricing
          params={params}
          result={result}
          onUpdateParams={updateParams}
        />

        {/* 步骤 3：盈亏平衡与利润预测 */}
        <Step3BreakEven
          params={params}
          result={result}
          onUpdateParams={updateParams}
        />

        {/* 步骤 4：目标利润倒推 */}
        <Step4TargetProfit
          params={params}
          result={result}
          onUpdateParams={updateParams}
        />

        {/* 底部说明 */}
        <footer className="text-center text-[11px] text-gray-300 py-4">
          产品成本分解 Agent v2.0 · 四步骤任务流 · localStorage 持久化
        </footer>
      </main>
    </div>
  )
}
