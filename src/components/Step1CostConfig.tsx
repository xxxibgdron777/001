import { useState } from 'react'
import type { CostItem, CostType, CVPResult } from '../types'
import { COST_TEMPLATES } from '../utils'
import { formatAmount } from '../utils'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'

interface Props {
  costItems: CostItem[]
  result: CVPResult
  onAdd: (item: Omit<CostItem, 'id'>) => void
  onUpdate: (id: string, updates: Partial<Omit<CostItem, 'id'>>) => void
  onRemove: (id: string) => void
  onApplyTemplate: (items: Omit<CostItem, 'id'>[]) => void
}

/**
 * 步骤 1：成本结构配置
 * - 添加成本项表单（名称、金额、类型）
 * - 成本项明细表（支持编辑、删除）
 * - 底部关键指标卡片 + 预设模板
 */
export function Step1CostConfig({
  costItems,
  result,
  onAdd,
  onUpdate,
  onRemove,
  onApplyTemplate,
}: Props) {
  // 新增表单状态
  const [formName, setFormName] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [formType, setFormType] = useState<CostType>('variable')

  // 编辑状态
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editType, setEditType] = useState<CostType>('variable')

  const { totalFixedCost, unitVariableCost } = result

  // 提交新增
  const handleAdd = () => {
    const amount = parseFloat(formAmount)
    if (!formName.trim() || isNaN(amount) || amount <= 0) return
    onAdd({ name: formName.trim(), amount, type: formType })
    setFormName('')
    setFormAmount('')
  }

  // 开始编辑
  const startEdit = (item: CostItem) => {
    setEditingId(item.id)
    setEditName(item.name)
    setEditAmount(String(item.amount))
    setEditType(item.type)
  }

  // 确认编辑
  const confirmEdit = () => {
    if (!editingId) return
    const amount = parseFloat(editAmount)
    if (!editName.trim() || isNaN(amount) || amount <= 0) return
    onUpdate(editingId, { name: editName.trim(), amount, type: editType })
    setEditingId(null)
  }

  // 取消编辑
  const cancelEdit = () => setEditingId(null)

  // 键盘快捷键
  const handleKeyDown = (e: React.KeyboardEvent, action: 'add' | 'edit') => {
    if (e.key === 'Enter') {
      e.preventDefault()
      action === 'add' ? handleAdd() : confirmEdit()
    }
  }

  // 固定/变动成本分开显示
  const fixedItems = costItems.filter(i => i.type === 'fixed')
  const variableItems = costItems.filter(i => i.type === 'variable')

  return (
    <section className="card p-6">
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 bg-sky-500 text-white text-sm font-bold rounded-lg flex items-center justify-center flex-shrink-0">
          1
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">成本结构配置</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            固定成本（与客户量无关，如房租、研发） · 变动成本（随客户量线性变化，如服务成本、物料）
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 左列：新增表单 */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-gray-700">添加成本项</h3>

          {/* 名称 */}
          <input
            type="text"
            className="input-base"
            placeholder="成本项名称，如：服务器费用"
            value={formName}
            onChange={e => setFormName(e.target.value)}
            onKeyDown={e => handleKeyDown(e, 'add')}
          />

          {/* 金额 */}
          <div className="relative">
            <input
              type="number"
              className="input-base pr-12"
              placeholder="金额（元）"
              value={formAmount}
              min={0}
              onChange={e => setFormAmount(e.target.value)}
              onKeyDown={e => handleKeyDown(e, 'add')}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">元</span>
          </div>

          {/* 类型选择 */}
          <div className="flex gap-2">
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all duration-150 ${
                formType === 'fixed'
                  ? 'bg-violet-50 border-violet-300 text-violet-700'
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
              onClick={() => setFormType('fixed')}
            >
              固定成本
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all duration-150 ${
                formType === 'variable'
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
              onClick={() => setFormType('variable')}
            >
              变动成本
            </button>
          </div>

          {/* 添加按钮 */}
          <button className="btn-primary flex items-center justify-center gap-2" onClick={handleAdd}>
            <Plus size={15} />
            添加成本项
          </button>
        </div>

        {/* 右列：成本明细表 */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-gray-700">成本明细</h3>

          {costItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-400 py-8 border border-dashed border-gray-200 rounded-xl">
              暂无成本项，请添加或使用下方模板
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* 固定成本 */}
              {fixedItems.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-2">
                    固定成本
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {fixedItems.map(item => (
                      <CostRow
                        key={item.id}
                        item={item}
                        isEditing={editingId === item.id}
                        editName={editName}
                        editAmount={editAmount}
                        editType={editType}
                        onEditName={setEditName}
                        onEditAmount={setEditAmount}
                        onEditType={setEditType}
                        onStartEdit={() => startEdit(item)}
                        onConfirmEdit={confirmEdit}
                        onCancelEdit={cancelEdit}
                        onRemove={() => onRemove(item.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 变动成本 */}
              {variableItems.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">
                    变动成本
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {variableItems.map(item => (
                      <CostRow
                        key={item.id}
                        item={item}
                        isEditing={editingId === item.id}
                        editName={editName}
                        editAmount={editAmount}
                        editType={editType}
                        onEditName={setEditName}
                        onEditAmount={setEditAmount}
                        onEditType={setEditType}
                        onStartEdit={() => startEdit(item)}
                        onConfirmEdit={confirmEdit}
                        onCancelEdit={cancelEdit}
                        onRemove={() => onRemove(item.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 底部：指标卡片 + 预设模板 */}
      <div className="mt-5 pt-5 border-t border-gray-100">
        {/* 关键指标 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-violet-50 rounded-xl p-3">
            <p className="text-[10px] font-semibold text-violet-500 uppercase tracking-wide mb-1">总固定成本</p>
            <p className="text-xl font-bold text-violet-700">{formatAmount(totalFixedCost)}</p>
            <p className="text-[10px] text-violet-400 mt-0.5">与客户量无关</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3">
            <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-wide mb-1">单客户变动成本</p>
            <p className="text-xl font-bold text-amber-700">{formatAmount(unitVariableCost)}</p>
            <p className="text-[10px] text-amber-400 mt-0.5">元 / 客户</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">成本项合计</p>
            <p className="text-xl font-bold text-gray-700">{costItems.length}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">项</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">成本结构</p>
            <p className="text-sm font-bold text-gray-600 mt-1">
              {fixedItems.length > 0 && <span className="text-violet-600">{fixedItems.length}项固定</span>}
              {fixedItems.length > 0 && variableItems.length > 0 && <span className="text-gray-400"> · </span>}
              {variableItems.length > 0 && <span className="text-amber-600">{variableItems.length}项变动</span>}
            </p>
          </div>
        </div>

        {/* 预设模板 */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-500 font-medium">一键套用预设模板</p>
          <div className="flex flex-wrap gap-2">
            {COST_TEMPLATES.map(template => (
              <button
                key={template.id}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600
                           hover:border-sky-400 hover:text-sky-600 hover:bg-sky-50 transition-all duration-150"
                onClick={() => onApplyTemplate(template.items)}
                title={template.description}
              >
                <span>{template.icon}</span>
                <span className="font-medium">{template.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// 单行成本项（行内编辑）
// ============================================================
interface CostRowProps {
  item: CostItem
  isEditing: boolean
  editName: string
  editAmount: string
  editType: CostType
  onEditName: (v: string) => void
  onEditAmount: (v: string) => void
  onEditType: (v: CostType) => void
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
  editType,
  onEditName,
  onEditAmount,
  onEditType,
  onStartEdit,
  onConfirmEdit,
  onCancelEdit,
  onRemove,
}: CostRowProps) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-150 ${
        isEditing
          ? 'border-sky-300 bg-sky-50'
          : item.type === 'fixed'
          ? 'border-violet-100 bg-violet-50/50'
          : 'border-amber-100 bg-amber-50/50'
      }`}
    >
      {/* 类型标签 */}
      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
        item.type === 'fixed'
          ? 'bg-violet-200 text-violet-700'
          : 'bg-amber-200 text-amber-700'
      }`}>
        {item.type === 'fixed' ? '固定' : '变动'}
      </span>

      {isEditing ? (
        <>
          <input
            type="text"
            className="input-base flex-1 text-xs py-1"
            value={editName}
            onChange={e => onEditName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onConfirmEdit()}
            autoFocus
          />
          <input
            type="number"
            className="input-base w-20 text-xs py-1 text-right"
            value={editAmount}
            min={0}
            onChange={e => onEditAmount(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onConfirmEdit()}
          />
          <select
            className="input-base w-16 text-xs py-1"
            value={editType}
            onChange={e => onEditType(e.target.value as CostType)}
          >
            <option value="fixed">固定</option>
            <option value="variable">变动</option>
          </select>
          <button className="p-1 text-emerald-500 hover:bg-emerald-100 rounded" onClick={onConfirmEdit}>
            <Check size={13} />
          </button>
          <button className="p-1 text-gray-400 hover:bg-gray-200 rounded" onClick={onCancelEdit}>
            <X size={13} />
          </button>
        </>
      ) : (
        <>
          <span className="flex-1 text-sm text-gray-700 truncate">{item.name}</span>
          <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
            {formatAmount(item.amount)}
          </span>
          <button className="p-1 text-gray-400 hover:text-sky-500 hover:bg-sky-100 rounded" onClick={onStartEdit}>
            <Edit2 size={12} />
          </button>
          <button className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded" onClick={onRemove}>
            <Trash2 size={12} />
          </button>
        </>
      )}
    </div>
  )
}
