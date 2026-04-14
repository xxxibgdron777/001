/**
 * 步骤 1：成本结构配置
 * - 动态增删成本项
 * - 合作分成（动态成本项）可通过 ⚙️ 配置基数和分成比例
 * - 底部指标卡片 + 健康管理产品模板
 */
import { useState } from 'react'
import type {
  CostItem,
  CostType,
  CVPResult,
  PartnershipSplitConfig,
} from '../types'
import {
  formatAmount,
  calcPartnershipSplit,
} from '../utils'
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Info,
  Settings,
  ChevronRight,
} from 'lucide-react'

// ============================================================
// Props
// ============================================================
interface Props {
  costItems: CostItem[]
  result: CVPResult
  partnershipSplit: PartnershipSplitConfig
  onAdd: (item: Omit<CostItem, 'id'>) => void
  onUpdate: (id: string, updates: Partial<Omit<CostItem, 'id'>>) => void
  onRemove: (id: string) => void
  onApplyTemplate: () => void
  onUpdatePartnershipSplit: (updates: Partial<PartnershipSplitConfig>) => void
}

// ============================================================
// 合作分成配置 Modal
// ============================================================
function PartnershipSplitModal({
  costItems,
  partnershipSplit,
  sellingPrice,
  onClose,
  onUpdate,
}: {
  costItems: CostItem[]
  partnershipSplit: PartnershipSplitConfig
  sellingPrice: number
  onClose: () => void
  onUpdate: (updates: Partial<PartnershipSplitConfig>) => void
}) {
  // 本地编辑状态
  const [localBaseIds, setLocalBaseIds] = useState<string[]>(
    partnershipSplit.baseItemTemplateIds,
  )
  const [localRatio, setLocalRatio] = useState<number>(partnershipSplit.ratio)

  // 可作为基数的变动成本项（不含动态项自身）
  const availableItems = costItems.filter(
    i => i.type === 'variable' && !i.isDynamic && i.templateId,
  )

  // 本地预览合作分成金额
  const baseSum = availableItems
    .filter(i => localBaseIds.includes(i.templateId!))
    .reduce((s, i) => s + (i.amount || 0), 0)
  const previewSplit = calcPartnershipSplit(sellingPrice, baseSum, localRatio)

  const toggleItem = (templateId: string) => {
    setLocalBaseIds(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId],
    )
  }

  const handleSave = () => {
    onUpdate({
      baseItemTemplateIds: localBaseIds,
      ratio: localRatio,
    })
    onClose()
  }

  return (
    /* 遮罩 */
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center px-0"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-[440px] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h3 className="text-base font-bold text-gray-900">⚙️ 合作分成配置</h3>
            <p className="text-xs text-gray-400 mt-0.5">设置分成基数与比例</p>
          </div>
          <button
            className="p-2 text-gray-400 active:text-gray-600 rounded-xl"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* 启用开关 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">启用合作分成</p>
              <p className="text-xs text-gray-400 mt-0.5">关闭后不计入变动成本</p>
            </div>
            <button
              className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                partnershipSplit.enabled ? 'bg-sky-500' : 'bg-gray-200'
              }`}
              onClick={() => onUpdate({ enabled: !partnershipSplit.enabled })}
              role="switch"
              aria-checked={partnershipSplit.enabled}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                  partnershipSplit.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* 分成比例 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-semibold text-gray-700">分成比例</p>
              <div className="has-tooltip group">
                <Info size={13} className="text-gray-400" />
                <div className="tooltip">合作分成占分成基数的百分比</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                className="flex-1"
                min={1}
                max={50}
                value={localRatio}
                onChange={e => setLocalRatio(Number(e.target.value))}
              />
              <div className="relative w-24">
                <input
                  type="number"
                  className="input-base pr-8 text-center font-bold py-2"
                  value={localRatio}
                  min={1}
                  max={100}
                  inputMode="numeric"
                  onChange={e => setLocalRatio(Number(e.target.value) || 1)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
              </div>
            </div>
          </div>

          {/* 分成基数项勾选 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-semibold text-gray-700">分成基数</p>
              <div className="has-tooltip group">
                <Info size={13} className="text-gray-400" />
                <div className="tooltip">分成基数 = 单价 − 勾选项之和，合作分成 = 分成基数 × 比例</div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              勾选哪些变动成本项计入分成基数（可多选）：
            </p>
            <div className="space-y-2">
              {availableItems.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">暂无变动成本项</p>
              ) : (
                availableItems.map(item => {
                  const checked = localBaseIds.includes(item.templateId!)
                  return (
                    <label
                      key={item.id}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                        checked
                          ? 'border-sky-400 bg-sky-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                          checked ? 'bg-sky-500' : 'border border-gray-300 bg-white'
                        }`}
                        onClick={() => toggleItem(item.templateId!)}
                      >
                        {checked && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path
                              d="M1 4L3.5 6.5L9 1"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() => toggleItem(item.templateId!)}
                      />
                      <span className="flex-1 text-sm text-gray-700">{item.name}</span>
                      <span className="text-sm font-semibold text-gray-500">
                        {formatAmount(item.amount)}
                      </span>
                    </label>
                  )
                })
              )}
            </div>
            <div className="mt-2 flex justify-end">
              <button
                className="text-xs text-sky-500 active:text-sky-700 px-2 py-1 rounded-lg active:bg-sky-50"
                onClick={() =>
                  setLocalBaseIds(
                    availableItems.map(i => i.templateId!).filter(Boolean),
                  )
                }
              >
                全选
              </button>
              <button
                className="text-xs text-gray-400 active:text-gray-600 px-2 py-1 rounded-lg active:bg-gray-100"
                onClick={() => setLocalBaseIds([])}
              >
                清除
              </button>
            </div>
          </div>

          {/* 实时预览 */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">实时预览</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">单价</span>
              <span className="font-semibold text-gray-700">{formatAmount(sellingPrice)} / 客户</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">基数项之和</span>
              <span className="font-semibold text-gray-700">− {formatAmount(baseSum)}</span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-gray-200 pt-1.5">
              <span className="text-gray-500">分成基数</span>
              <span className="font-semibold text-gray-700">
                = {formatAmount(Math.max(0, sellingPrice - baseSum))}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">分成比例</span>
              <span className="font-semibold text-gray-700">× {localRatio}%</span>
            </div>
            <div className="flex items-center justify-between text-base border-t border-gray-200 pt-1.5 mt-1">
              <span className="font-semibold text-gray-700">合作分成金额</span>
              <span className={`font-bold ${previewSplit > 0 ? 'text-sky-600' : 'text-gray-400'}`}>
                ≈ {formatAmount(previewSplit)} / 客户
              </span>
            </div>
          </div>

          {/* 公式说明 */}
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
            <p className="text-xs font-semibold text-amber-700 mb-1">计算公式</p>
            <p className="text-xs text-amber-700 font-mono leading-relaxed">
              分成金额 = (单价 − 基数项之和) × 分成比例%
            </p>
            <p className="text-xs text-amber-600 font-mono leading-relaxed mt-1">
              = ({formatAmount(sellingPrice)} − {formatAmount(baseSum)}) × {localRatio}%
              = {formatAmount(previewSplit)}
            </p>
          </div>
        </div>

        {/* 底部保存按钮 */}
        <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            className="btn-primary w-full"
            onClick={handleSave}
          >
            保存配置
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 成本项行（普通 + 动态行）
// ============================================================
interface CostRowProps {
  item: CostItem
  isEditing: boolean
  editName: string
  editAmount: string
  onEditName: (v: string) => void
  onEditAmount: (v: string) => void
  onStartEdit: () => void
  onConfirmEdit: () => void
  onCancelEdit: () => void
  onRemove: () => void
}

function CostRow({
  item,
  isEditing,
  editName,
  editAmount,
  onEditName,
  onEditAmount,
  onStartEdit,
  onConfirmEdit,
  onCancelEdit,
  onRemove,
}: CostRowProps) {
  const baseClass =
    item.type === 'fixed' ? 'cost-row-fixed' : 'cost-row-variable'

  if (isEditing) {
    return (
      <div className="cost-row border-sky-300 bg-sky-50">
        <input
          type="text"
          className="input-base flex-1 text-sm py-2"
          value={editName}
          onChange={e => onEditName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onConfirmEdit()}
          autoFocus
        />
        <input
          type="number"
          className="input-base w-24 text-sm py-2 text-right"
          value={editAmount}
          min={0}
          onChange={e => onEditAmount(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onConfirmEdit()}
          inputMode="decimal"
        />
        <button
          className="p-2 text-emerald-500 active:bg-emerald-100 rounded-lg min-w-[2.75rem] flex items-center justify-center"
          onClick={onConfirmEdit}
        >
          <Check size={16} />
        </button>
        <button
          className="p-2 text-gray-400 active:bg-gray-200 rounded-lg min-w-[2.75rem] flex items-center justify-center"
          onClick={onCancelEdit}
        >
          <X size={16} />
        </button>
      </div>
    )
  }

  return (
    <div className={`cost-row ${baseClass}`}>
      <span className="flex-1 text-sm text-gray-700 truncate">{item.name}</span>
      <span className="text-sm font-semibold text-gray-900 flex-shrink-0 ml-2">
        {item.isDynamic ? (
          <span className="text-sky-600">{formatAmount(item.amount)}</span>
        ) : (
          formatAmount(item.amount)
        )}
      </span>
      {!item.isDynamic && (
        <>
          <button
            className="p-2 text-gray-400 active:text-sky-500 active:bg-sky-50 rounded-lg min-w-[2.75rem] flex items-center justify-center"
            onClick={onStartEdit}
          >
            <Edit2 size={14} />
          </button>
          <button
            className="p-2 text-gray-400 active:text-red-500 active:bg-red-50 rounded-lg min-w-[2.75rem] flex items-center justify-center"
            onClick={onRemove}
          >
            <Trash2 size={14} />
          </button>
        </>
      )}
      {item.isDynamic && (
        <span className="text-xs text-sky-500 bg-sky-50 border border-sky-200 rounded-full px-2 py-0.5 ml-1">
          动态
        </span>
      )}
    </div>
  )
}

// ============================================================
// 步骤 1 主组件
// ============================================================
export function Step1CostConfig({
  costItems,
  result,
  partnershipSplit,
  onAdd,
  onUpdate,
  onRemove,
  onApplyTemplate,
  onUpdatePartnershipSplit,
}: Props) {
  const [formName, setFormName] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [formType, setFormType] = useState<CostType>('variable')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [showSplitModal, setShowSplitModal] = useState(false)

  const { totalFixedCost, unitVariableCost, partnershipSplitAmount } = result

  const fixedItems = costItems.filter(i => i.type === 'fixed')
  const variableItems = costItems.filter(i => i.type === 'variable')

  // 普通变动成本项（不含动态合作分成）
  const normalVariableItems = variableItems.filter(i => !i.isDynamic)
  // 动态合作分成项
  const dynamicSplitItem = variableItems.find(i => i.isDynamic)

  const handleAdd = () => {
    const amount = parseFloat(formAmount)
    if (!formName.trim() || isNaN(amount) || amount <= 0) return
    onAdd({ name: formName.trim(), amount, type: formType })
    setFormName('')
    setFormAmount('')
  }

  const startEdit = (item: CostItem) => {
    setEditingId(item.id)
    setEditName(item.name)
    setEditAmount(String(item.amount))
  }

  const confirmEdit = () => {
    if (!editingId) return
    const amount = parseFloat(editAmount)
    if (!editName.trim() || isNaN(amount) || amount <= 0) return
    onUpdate(editingId, { name: editName.trim(), amount })
    setEditingId(null)
  }



  return (
    <section className="card card-pad mb-3">
      {/* 步骤头部 */}
      <div className="step-header">
        <div className="step-num">1</div>
        <div>
          <h2 className="step-title">成本结构配置</h2>
          <p className="step-desc">
            固定成本（与客户量无关）· 变动成本（随客户量线性变化）
          </p>
        </div>
      </div>

      {/* 添加成本项表单 */}
      <div className="space-y-3 mb-5">
        <p className="text-sm font-semibold text-gray-700">添加成本项</p>

        <input
          type="text"
          className="input-base"
          placeholder="成本项名称，如：服务器费用"
          value={formName}
          onChange={e => setFormName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          inputMode="text"
        />

        <div className="relative">
          <input
            type="number"
            className="input-base pr-10"
            placeholder="金额（元）"
            value={formAmount}
            min={0}
            inputMode="decimal"
            onChange={e => setFormAmount(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
            元
          </span>
        </div>

        {/* 类型选择 */}
        <div className="flex gap-2">
          <button
            className={`type-btn ${formType === 'fixed' ? 'bg-violet-50 border-violet-400 text-violet-700' : 'bg-white border-gray-200 text-gray-500'}`}
            onClick={() => setFormType('fixed')}
          >
            <span className="text-base">🏠</span>
            <span className="text-sm font-medium">固定成本</span>
          </button>
          <button
            className={`type-btn ${formType === 'variable' ? 'bg-amber-50 border-amber-400 text-amber-700' : 'bg-white border-gray-200 text-gray-500'}`}
            onClick={() => setFormType('variable')}
          >
            <span className="text-base">📦</span>
            <span className="text-sm font-medium">变动成本</span>
          </button>
        </div>

        <button className="btn-primary w-full" onClick={handleAdd}>
          <Plus size={18} />
          添加成本项
        </button>
      </div>

      {/* 成本明细表 */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-700 mb-2">成本明细</p>

        {costItems.length === 0 ? (
          <div className="flex items-center justify-center text-sm text-gray-400 py-8 border border-dashed border-gray-200 rounded-xl">
            暂无成本项，请添加或使用下方模板
          </div>
        ) : (
          <div className="space-y-4">
            {/* 变动成本（普通项 + 动态合作分成） */}
            {normalVariableItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="badge-variable">变动</span>
                  <span className="text-xs text-gray-500">随客户量线性变化（每客户增加的成本）</span>
                  <div className="has-tooltip ml-auto">
                    <Info size={13} className="text-gray-400" />
                    <div className="tooltip">每增加一个客户，增加的成本</div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {normalVariableItems.map(item => (
                    <CostRow
                      key={item.id}
                      item={item}
                      isEditing={editingId === item.id}
                      editName={editName}
                      editAmount={editAmount}
                      onEditName={setEditName}
                      onEditAmount={setEditAmount}
                      onStartEdit={() => startEdit(item)}
                      onConfirmEdit={confirmEdit}
                      onCancelEdit={() => setEditingId(null)}
                      onRemove={() => onRemove(item.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 动态合作分成行（特殊样式） */}
            {dynamicSplitItem && (
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="badge-variable">变动</span>
                  <span className="text-xs text-sky-600 font-medium">⚙️ 合作分成（动态计算）</span>
                  <div className="has-tooltip ml-auto">
                    <Info size={13} className="text-gray-400" />
                    <div className="tooltip">分成金额 = (单价 − 基数项之和) × 分成比例%</div>
                  </div>
                </div>
                <div className="cost-row border-sky-200 bg-sky-50/60 flex-wrap gap-y-1">
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <span className="text-sm text-sky-700 truncate">{dynamicSplitItem.name}</span>
                    <span className="text-xs text-sky-500 bg-sky-100 border border-sky-200 rounded-full px-1.5 py-0.5 flex-shrink-0">
                      动态
                    </span>
                  </div>
                  <span className="text-sm font-bold text-sky-600 ml-2">
                    {formatAmount(partnershipSplitAmount)} / 客户
                  </span>
                  <button
                    className="p-2 text-sky-500 active:text-sky-700 active:bg-sky-100 rounded-lg min-w-[2.75rem] flex items-center justify-center flex-shrink-0"
                    onClick={() => setShowSplitModal(true)}
                  >
                    <Settings size={14} />
                  </button>
                </div>
                {/* 公式提示 */}
                {partnershipSplit.enabled && (
                  <p className="text-xs text-sky-500 mt-1 px-1 font-mono">
                    = (单价 − 已勾选基数) × {partnershipSplit.ratio}% ≈{' '}
                    {formatAmount(partnershipSplitAmount)}
                  </p>
                )}
                {!partnershipSplit.enabled && (
                  <p className="text-xs text-gray-400 mt-1 px-1">已禁用，不计入变动成本</p>
                )}
              </div>
            )}

            {/* 固定成本 */}
            {fixedItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="badge-fixed">固定</span>
                  <span className="text-xs text-gray-500">与客户量无关（房租/工资等）</span>
                  <div className="has-tooltip ml-auto">
                    <Info size={13} className="text-gray-400" />
                    <div className="tooltip">无论是否有客户，这部分成本都会发生</div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {fixedItems.map(item => (
                    <CostRow
                      key={item.id}
                      item={item}
                      isEditing={editingId === item.id}
                      editName={editName}
                      editAmount={editAmount}
                      onEditName={setEditName}
                      onEditAmount={setEditAmount}
                      onStartEdit={() => startEdit(item)}
                      onConfirmEdit={confirmEdit}
                      onCancelEdit={() => setEditingId(null)}
                      onRemove={() => onRemove(item.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 底部指标卡片 */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-violet-50 rounded-xl p-3 text-center border border-violet-100">
          <p className="text-xs font-semibold text-violet-500 uppercase tracking-wide mb-1">
            总固定成本
          </p>
          <p className="metric-value text-2xl text-violet-700">
            {formatAmount(totalFixedCost)}
          </p>
          <p className="text-xs text-violet-400 mt-0.5">与客户量无关</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-1">
            单客户变动成本
          </p>
          <p className="metric-value text-2xl text-amber-700">
            {formatAmount(unitVariableCost)}
          </p>
          <p className="text-xs text-amber-400 mt-0.5">元 / 客户</p>
        </div>
      </div>

      {/* 预设模板 */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 font-medium">一键套用预设模板</p>
        <button className="template-card" onClick={onApplyTemplate}>
          <span className="text-2xl">🏥</span>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-gray-800">
              健康管理产品
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              体检/慢病管理/疗程服务，含动态合作分成
            </p>
          </div>
          <ChevronRight size={16} className="text-gray-300" />
        </button>
      </div>

      {/* 合作分成配置 Modal */}
      {showSplitModal && (
        <PartnershipSplitModal
          costItems={costItems}
          partnershipSplit={partnershipSplit}
          sellingPrice={result.contributionMargin + unitVariableCost}
          onClose={() => setShowSplitModal(false)}
          onUpdate={onUpdatePartnershipSplit}
        />
      )}
    </section>
  )
}
