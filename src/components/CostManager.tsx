import { useState } from 'react'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import type { CostItem, CostType } from '../types'
import { COST_TEMPLATES } from '../utils'
import { formatAmount } from '../utils'

interface Props {
  costItems: CostItem[]
  onAdd: (item: Omit<CostItem, 'id'>) => void
  onUpdate: (id: string, updates: Partial<Omit<CostItem, 'id'>>) => void
  onRemove: (id: string) => void
  onApplyTemplate: (items: Omit<CostItem, 'id'>[]) => void
}

/** 新成本项初始值 */
const initNewItem = () => ({
  name: '',
  amount: 0,
  type: 'variable' as CostType,
})

/**
 * 成本项管理面板
 * - 增删改成本项
 * - 切换固定 / 变动类型
 * - 一键套用模板
 */
export function CostManager({ costItems, onAdd, onUpdate, onRemove, onApplyTemplate }: Props) {
  const [newItem, setNewItem] = useState(initNewItem)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBuffer, setEditBuffer] = useState<Partial<CostItem>>({})
  const [showTemplates, setShowTemplates] = useState(false)

  // ---- 新增 ----
  const handleAdd = () => {
    if (!newItem.name.trim() || newItem.amount < 0) return
    onAdd({ name: newItem.name.trim(), amount: newItem.amount, type: newItem.type })
    setNewItem(initNewItem())
  }

  // ---- 编辑 ----
  const startEdit = (item: CostItem) => {
    setEditingId(item.id)
    setEditBuffer({ name: item.name, amount: item.amount, type: item.type })
  }

  const confirmEdit = (id: string) => {
    onUpdate(id, {
      name: editBuffer.name?.trim() || '',
      amount: editBuffer.amount ?? 0,
      type: editBuffer.type,
    })
    setEditingId(null)
  }

  const cancelEdit = () => setEditingId(null)

  // ---- 数据汇总 ----
  const fixedTotal = costItems
    .filter(i => i.type === 'fixed')
    .reduce((s, i) => s + i.amount, 0)
  const variableTotal = costItems
    .filter(i => i.type === 'variable')
    .reduce((s, i) => s + i.amount, 0)

  return (
    <div className="flex flex-col gap-4">
      {/* 标题区 */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">📋 成本项管理</h2>
        <button
          className="text-xs text-sky-600 font-medium hover:text-sky-700"
          onClick={() => setShowTemplates(v => !v)}
        >
          {showTemplates ? '收起模板' : '套用模板'}
        </button>
      </div>

      {/* 模板区 */}
      {showTemplates && (
        <div className="card p-3 bg-sky-50 border-sky-100">
          <p className="text-xs text-sky-700 font-medium mb-2">选择成本模板（将替换当前成本项）</p>
          <div className="grid grid-cols-3 gap-2">
            {COST_TEMPLATES.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => {
                  onApplyTemplate(tpl.items)
                  setShowTemplates(false)
                }}
                className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white border border-sky-200 hover:border-sky-400 hover:bg-sky-50 transition-all duration-150 text-center"
              >
                <span className="text-xl">{tpl.icon}</span>
                <span className="text-xs font-medium text-gray-800">{tpl.name}</span>
                <span className="text-[10px] text-gray-500">{tpl.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 汇总行 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="card px-3 py-2">
          <div className="text-[10px] font-semibold text-violet-600 uppercase tracking-wide mb-0.5">总固定成本</div>
          <div className="text-lg font-bold text-gray-900">{formatAmount(fixedTotal)}</div>
        </div>
        <div className="card px-3 py-2">
          <div className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide mb-0.5">单件变动成本</div>
          <div className="text-lg font-bold text-gray-900">{formatAmount(variableTotal)}</div>
        </div>
      </div>

      {/* 成本明细表 */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>名称</th>
                <th className="text-right">金额（元）</th>
                <th className="text-center">类型</th>
                <th className="text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {costItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-gray-400 py-6 text-xs">
                    暂无成本项，请在下方添加
                  </td>
                </tr>
              )}
              {costItems.map(item =>
                editingId === item.id ? (
                  <tr key={item.id} className="bg-sky-50">
                    <td>
                      <input
                        className="input-base text-xs py-1"
                        value={editBuffer.name ?? item.name}
                        onChange={e => setEditBuffer(b => ({ ...b, name: e.target.value }))}
                        autoFocus
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="input-base text-xs py-1 text-right"
                        value={editBuffer.amount ?? item.amount}
                        min={0}
                        onChange={e => setEditBuffer(b => ({ ...b, amount: parseFloat(e.target.value) || 0 }))}
                      />
                    </td>
                    <td className="text-center">
                      <select
                        className="input-base text-xs py-1"
                        value={editBuffer.type ?? item.type}
                        onChange={e => setEditBuffer(b => ({ ...b, type: e.target.value as CostType }))}
                      >
                        <option value="fixed">固定</option>
                        <option value="variable">变动</option>
                      </select>
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => confirmEdit(item.id)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded">
                          <Check size={14} />
                        </button>
                        <button onClick={cancelEdit} className="p-1 text-gray-500 hover:bg-gray-100 rounded">
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={item.id}>
                    <td className="font-medium text-gray-800">{item.name}</td>
                    <td className="text-right font-mono text-sm">
                      {item.amount.toLocaleString('zh-CN')}
                    </td>
                    <td className="text-center">
                      {item.type === 'fixed'
                        ? <span className="badge-fixed">固定</span>
                        : <span className="badge-variable">变动</span>
                      }
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => startEdit(item)} className="p-1 text-gray-400 hover:text-sky-500 hover:bg-sky-50 rounded transition-colors">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => onRemove(item.id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 添加新成本项 */}
      <div className="card p-3 border-dashed border-gray-200 bg-gray-50">
        <p className="text-xs font-medium text-gray-600 mb-2">添加成本项</p>
        <div className="flex flex-col gap-2">
          <input
            className="input-base"
            placeholder="成本项名称（如：原材料）"
            value={newItem.name}
            onChange={e => setNewItem(v => ({ ...v, name: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <div className="flex gap-2">
            <input
              type="number"
              className="input-base flex-1"
              placeholder="金额（元）"
              value={newItem.amount || ''}
              min={0}
              onChange={e => setNewItem(v => ({ ...v, amount: parseFloat(e.target.value) || 0 }))}
            />
            <select
              className="input-base w-28"
              value={newItem.type}
              onChange={e => setNewItem(v => ({ ...v, type: e.target.value as CostType }))}
            >
              <option value="variable">变动成本</option>
              <option value="fixed">固定成本</option>
            </select>
          </div>
          <button
            className="btn-primary flex items-center justify-center gap-1.5"
            onClick={handleAdd}
            disabled={!newItem.name.trim()}
          >
            <Plus size={14} />
            添加成本项
          </button>
        </div>
      </div>
    </div>
  )
}
