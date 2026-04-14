/**
 * PDF 导出工具 — 使用 jspdf 生成成本分解报告
 * 包含动态合作分成说明、公式及配置信息
 */
import { jsPDF } from 'jspdf'
import type { CostItem, CVPResult, CVPParams, PartnershipSplitConfig } from '../types'
import { formatAmount, formatNumber, formatPercent } from '../utils'

interface ReportData {
  costItems: CostItem[]
  params: CVPParams
  result: CVPResult
  partnershipSplit: PartnershipSplitConfig
}

function generateFileName(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  return `成本分解报告_${ts}.pdf`
}

function getReportDate(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}年${pad(now.getMonth() + 1)}月${pad(now.getDate())}日 ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

export async function exportPDF(data: ReportData): Promise<void> {
  const { costItems, params, result, partnershipSplit } = data
  const { sellingPrice } = params
  const {
    totalFixedCost,
    unitVariableCost,
    partnershipSplitAmount,
    contributionMargin,
    contributionMarginRate,
    breakEvenVolume,
    breakEvenRevenue,
    isViable,
    targetVolumeForProfit,
    targetRevenueForProfit,
  } = result

  const fixedItems = costItems.filter(i => i.type === 'fixed')
  const variableItems = costItems.filter(i => i.type === 'variable')
  const normalVariableItems = variableItems.filter(i => !i.isDynamic)
  const dynamicSplitItem = variableItems.find(i => i.isDynamic)
  const bepVol = isViable && isFinite(breakEvenVolume) ? Math.ceil(breakEvenVolume) : 0
  const dateStr = getReportDate()

  const pageW = 210
  const pageH = 297
  const margin = 14

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  // 标题栏
  doc.setFillColor(14, 116, 144)
  doc.rect(0, 0, pageW, 12, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(31, 41, 55)
  doc.text('成本分解分析报告', 14, 26)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(107, 114, 128)
  doc.text('健康管理产品 · CVP 本量利分析', 14, 34)
  doc.text(`生成时间：${dateStr}`, 14, 40)

  doc.setDrawColor(229, 231, 235)
  doc.setLineWidth(0.3)
  doc.line(14, 44, pageW - 14, 44)

  let y = 50

  // =============================================
  // 一、当前定价
  // =============================================
  y = drawSectionTitle(doc, '一、当前定价', y, pageW)
  y = drawMetricRow(
    doc, y,
    '单价（每客户收入）', `${formatAmount(sellingPrice)} / 客户`,
    '边际贡献率', isViable ? formatPercent(contributionMarginRate) : '—',
    pageW,
  )
  y += 4

  // =============================================
  // 二、盈亏平衡点
  // =============================================
  if (y > pageH - 60) { doc.addPage(); y = 20 }
  y = drawSectionTitle(doc, '二、盈亏平衡点', y, pageW)

  if (isViable && bepVol > 0) {
    y = drawMetricRow(
      doc, y,
      '盈亏平衡客户数量', `${formatNumber(bepVol)} 客户`,
      '盈亏平衡销售额', formatAmount(breakEvenRevenue),
      pageW,
    )
    y += 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.text(
      `公式：盈亏平衡客户数 = 总固定成本 ÷ (单价 − 单客户变动成本) = ${formatAmount(totalFixedCost)} ÷ ${formatAmount(contributionMargin)} ≈ ${formatNumber(bepVol)} 客户`,
      margin, y,
    )
    y += 8
  } else {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(239, 68, 68)
    doc.text('⚠ 当前定价无法覆盖变动成本，无法计算盈亏平衡点。', margin, y + 5)
    y += 10
  }

  // =============================================
  // 三、成本明细
  // =============================================
  if (y > pageH - 60) { doc.addPage(); y = 20 }
  y = drawSectionTitle(doc, '三、成本明细', y, pageW)

  // 变动成本
  if (normalVariableItems.length > 0) {
    y = drawSubTitle(doc, '  变动成本（随客户量线性变化）', y, pageW)
    normalVariableItems.forEach((item, i) => {
  
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(55, 65, 81)
      doc.text(`${i + 1}. ${item.name}`, margin, y + 5)
      const valStr = formatAmount(item.amount)
      doc.text(valStr, pageW - margin - doc.getTextWidth(valStr), y + 5)
      y += 7
    })
    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.3)
    doc.line(margin, y, pageW - margin, y)
    y += 4
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(245, 158, 11)
    doc.text('基数项合计（直接成本）', margin, y)
    const baseSum = normalVariableItems
      .filter(i => i.templateId && partnershipSplit.baseItemTemplateIds.includes(i.templateId!))
      .reduce((s, i) => s + (i.amount || 0), 0)
    doc.text(formatAmount(baseSum) + ' / 客户', pageW - margin - doc.getTextWidth(formatAmount(baseSum) + ' / 客户'), y)
    y += 8
  }

  // 动态合作分成
  if (dynamicSplitItem) {
    y = drawSubTitle(doc, '  ⚙️ 合作分成（动态计算）', y, pageW)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(14, 116, 144)
    doc.text('1. ' + dynamicSplitItem.name, margin, y + 5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(14, 116, 144)
    const valStr = formatAmount(partnershipSplitAmount) + ' / 客户'
    doc.text(valStr, pageW - margin - doc.getTextWidth(valStr), y + 5)
    y += 7

    // 合作分成配置说明
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(107, 114, 128)
    const baseSum = normalVariableItems
      .filter(i => i.templateId && partnershipSplit.baseItemTemplateIds.includes(i.templateId!))
      .reduce((s, i) => s + (i.amount || 0), 0)
    const splitFormula = `= (单价 − 基数项) × 分成比例 = (${formatAmount(sellingPrice)} − ${formatAmount(baseSum)}) × ${partnershipSplit.ratio}% = ${formatAmount(partnershipSplitAmount)}`
    doc.text(splitFormula, margin, y + 4)
    y += 9

    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.3)
    doc.line(margin, y, pageW - margin, y)
    y += 4

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(245, 158, 11)
    doc.text('单客户变动成本合计', margin, y)
    const varStr = formatAmount(unitVariableCost) + ' / 客户'
    doc.text(varStr, pageW - margin - doc.getTextWidth(varStr), y)
    y += 9
  }

  // 固定成本
  if (fixedItems.length > 0) {
    if (y > pageH - 50) { doc.addPage(); y = 20 }
    y = drawSubTitle(doc, '  固定成本（与客户量无关）', y, pageW)
    fixedItems.forEach((item, i) => {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(55, 65, 81)
      doc.text(`${i + 1}. ${item.name}`, margin, y + 5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(31, 41, 55)
      const valStr = formatAmount(item.amount)
      doc.text(valStr, pageW - margin - doc.getTextWidth(valStr), y + 5)
      y += 7
    })
    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.3)
    doc.line(margin, y, pageW - margin, y)
    y += 4
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(139, 92, 246)
    doc.text('固定成本合计', margin, y)
    const totalStr = formatAmount(totalFixedCost)
    doc.text(totalStr, pageW - margin - doc.getTextWidth(totalStr), y)
    y += 9
  }

  // =============================================
  // 四、利润预测（三个量级）
  // =============================================
  if (isViable && bepVol > 0) {
    if (y > pageH - 60) { doc.addPage(); y = 20 }
    y = drawSectionTitle(doc, '四、利润预测（三个客户量级）', y, pageW)

    const levels = [
      { label: '盈亏平衡点', vol: bepVol },
      { label: '1.5 倍盈亏平衡', vol: Math.ceil(bepVol * 1.5) },
      { label: '2 倍盈亏平衡', vol: Math.ceil(bepVol * 2) },
    ]

    const col1 = margin
    const col2 = margin + 52
    const col3 = margin + 90
    const col4 = margin + 132

    // 表头
    doc.setFillColor(249, 250, 251)
    doc.rect(margin, y, pageW - margin * 2, 8, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.text('客户量级', col1 + 3, y + 5.5)
    doc.text('客户数量', col2, y + 5.5)
    doc.text('销售收入', col3, y + 5.5)
    doc.text('利润', col4, y + 5.5)
    y += 10

    levels.forEach(lv => {
      const revenue = lv.vol * sellingPrice
      const totalCost = totalFixedCost + lv.vol * unitVariableCost
      const profit = revenue - totalCost

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(55, 65, 81)
      doc.text(lv.label, col1 + 3, y + 5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(31, 41, 55)
      doc.text(`${formatNumber(lv.vol)} 客户`, col2, y + 5)
      doc.text(formatAmount(revenue), col3, y + 5)
      doc.setTextColor(profit >= 0 ? 16 : 239, profit >= 0 ? 185 : 68, profit >= 0 ? 129 : 68)
      doc.text(formatAmount(profit), col4, y + 5)
      y += 8
    })
    y += 4
  }

  // =============================================
  // 五、目标利润推算
  // =============================================
  if (y > pageH - 50) { doc.addPage(); y = 20 }
  y = drawSectionTitle(doc, '五、目标利润推算', y, pageW)

  if (isViable && params.targetProfit > 0) {
    y = drawMetricRow(
      doc, y,
      '目标利润', formatAmount(params.targetProfit),
      '所需客户数量', `${formatNumber(Math.ceil(targetVolumeForProfit))} 客户`,
      pageW,
    )
    y += 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.text(`对应目标销售额：${formatAmount(targetRevenueForProfit)}`, margin, y)
    y += 6
    doc.text(
      `公式：目标客户数 = (总固定成本 + 目标利润) ÷ 边际贡献 = (${formatAmount(totalFixedCost)} + ${formatAmount(params.targetProfit)}) ÷ ${formatAmount(contributionMargin)}`,
      margin, y,
    )
  } else {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(107, 114, 128)
    doc.text('未设置目标利润，请在上方应用中输入。', margin, y + 5)
  }

  // 底部页码
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.text(`第 ${i} / ${totalPages} 页`, pageW / 2 - 10, pageH - 8)
    doc.setFillColor(14, 116, 144)
    doc.rect(0, pageH - 4, pageW, 4, 'F')
  }

  doc.save(generateFileName())
}

// =============================================
// 辅助函数
// =============================================

function drawSectionTitle(doc: jsPDF, title: string, y: number, pageW: number): number {
  doc.setFillColor(249, 250, 251)
  doc.rect(margin, y, pageW - margin * 2, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(14, 116, 144)
  doc.text(title, margin + 3, y + 6)
  return y + 11
}

function drawSubTitle(doc: jsPDF, title: string, y: number, _pageW: number): number {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(107, 114, 128)
  doc.text(title, margin, y)
  return y + 7
}

function drawMetricRow(
  doc: jsPDF,
  y: number,
  leftLabel: string,
  leftValue: string,
  rightLabel: string,
  rightValue: string,
  pageW: number,
): number {
  const colW = (pageW - margin * 2 - 8) / 2

  const drawBox = (x: number, label: string, value: string) => {
    doc.setDrawColor(229, 231, 235)
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(x, y, colW, 22, 3, 3, 'FD')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(107, 114, 128)
    doc.text(label, x + 4, y + 8)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(31, 41, 55)
    doc.text(value, x + 4, y + 18)
  }

  drawBox(margin, leftLabel, leftValue)
  drawBox(margin + colW + 8, rightLabel, rightValue)
  return y + 26
}

const margin = 14
