import { useState, useCallback } from 'react'
import { useCostAgent } from './hooks/useCostAgent'
import { Step1CostConfig } from './components/Step1CostConfig'
import { Step2Pricing } from './components/Step2Pricing'
import { Step3BreakEven } from './components/Step3BreakEven'
import { Step4TargetProfit } from './components/Step4TargetProfit'
import { RotateCcw, FileDown, CheckCircle2 } from 'lucide-react'

/**
 * 产品成本分解 Agent — 移动端优先 + 四步骤任务流
 * 布局：顶部导航 + PDF 导出 + 垂直排列四个大卡片
 */
export default function App() {
  const {
    costItems,
    params,
    result,
    partnershipSplit,
    addCostItem,
    updateCostItem,
    removeCostItem,
    applyCostTemplate,
    resetToDefault,
    updateParams,
    updatePartnershipSplit,
  } = useCostAgent()

  const [isExporting, setIsExporting] = useState(false)
  const [exportDone, setExportDone] = useState(false)

  // 导出 PDF
  const handleExportPDF = useCallback(async () => {
    if (isExporting) return
    setIsExporting(true)
    setExportDone(false)
    try {
      const { exportPDF } = await import('./utils/pdfExport')
      await exportPDF({ costItems, params, result, partnershipSplit })
      setExportDone(true)
      setTimeout(() => setExportDone(false), 2500)
    } catch (err) {
      console.error('PDF export failed:', err)
    } finally {
      setIsExporting(false)
    }
  }, [costItems, params, result, partnershipSplit, isExporting])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== 顶部导航栏 ===== */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 safe-top">
        <div className="page-container px-4 h-14 flex items-center justify-between">
          {/* 左侧标题 */}
          <div className="flex items-center gap-2.5">
            <span className="text-xl">💰</span>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">成本分解助手</h1>
              <p className="text-[10px] text-gray-400">CVP 本量利分析 · 实时计算</p>
            </div>
          </div>

          {/* 右侧操作 */}
          <div className="flex items-center gap-2">
            {/* 重置按钮 */}
            <button
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-500 rounded-xl
                         active:bg-gray-100 transition-colors duration-150 select-none"
              onClick={resetToDefault}
              title="重置为默认数据"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">重置</span>
            </button>

            {/* 导出 PDF 按钮 */}
            <button
              className={`flex items-center gap-1.5 px-3 py-2 min-h-[2.5rem] text-xs font-semibold rounded-xl transition-all duration-150 select-none ${
                exportDone
                  ? 'bg-emerald-500 text-white'
                  : 'bg-sky-500 text-white active:bg-sky-600 active:scale-95'
              }`}
              onClick={handleExportPDF}
              disabled={isExporting}
            >
              {exportDone ? (
                <>
                  <CheckCircle2 size={15} />
                  <span>已导出</span>
                </>
              ) : (
                <>
                  <FileDown size={15} />
                  <span>PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ===== 进度指示器 ===== */}
      <div className="bg-white border-b border-gray-100 sticky top-14 z-20">
        <div className="page-container px-4">
          <div className="flex items-center h-12">
            {[1, 2, 3, 4].map((n, idx) => (
              <div key={n} className="flex items-center" style={{ flex: idx < 3 ? 1 : 'none' }}>
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center select-none">
                    {n}
                  </div>
                  <span className="text-xs font-medium text-gray-500 hidden max-xs:hidden">
                    {['成本', '定价', '盈亏', '目标'][n - 1]}
                  </span>
                </div>
                {idx < 3 && <div className="flex-1 h-px bg-gray-200 mx-2" style={{ minWidth: 8 }} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== 四步骤主内容 ===== */}
      <main className="page-container px-4 py-4 space-y-0">
        {/* 步骤 1：成本结构配置 */}
        <Step1CostConfig
          costItems={costItems}
          result={result}
          partnershipSplit={partnershipSplit}
          onAdd={addCostItem}
          onUpdate={updateCostItem}
          onRemove={removeCostItem}
          onApplyTemplate={applyCostTemplate}
          onUpdatePartnershipSplit={updatePartnershipSplit}
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
        <footer className="text-center text-xs text-gray-300 py-6 pb-12">
          成本分解助手 v4.0 · 健康管理产品模板 · localStorage 本地持久化
        </footer>
      </main>
    </div>
  )
}
