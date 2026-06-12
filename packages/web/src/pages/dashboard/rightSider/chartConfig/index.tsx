import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import { Collapse } from 'antd'
import type { CollapseProps } from 'antd'
import { CaretRightOutlined } from '@ant-design/icons'
import { IChartConfig } from '@block-bi/material'

import useDashboardStore from '@/store/useDashboardStore'

import CardTitleField from './CardTitleField'
import StyleConfigField from './StyleConfigField'

const panelStyle: CSSProperties = {
  marginBottom: 0,
  background: 'transparent',
  borderRadius: 0,
  border: 'none',
}

const groupStyleConfig = (styleConfig: IChartConfig[]) => {
  const groupMap = new Map<string, string[]>()

  styleConfig.forEach((item) => {
    const groupName = item.groupName || '其他'
    const keys = groupMap.get(groupName) ?? []
    keys.push(item.key)
    groupMap.set(groupName, keys)
  })

  return Array.from(groupMap.entries())
}

const ChartConfig = () => {
  const currentEditingCardId = useDashboardStore((state) => state.currentEditingCardId)
  const cardMap = useDashboardStore((state) => state.cardMap)

  const currentCard = currentEditingCardId ? cardMap[currentEditingCardId] : null
  const styleConfig = currentCard?.props?.styleConfig as IChartConfig[] | undefined

  const styleConfigSignature =
    styleConfig?.map((item) => `${item.groupName}:${item.key}:${item.componentName}`).join('|') ?? ''

  const collapseItems = useMemo<CollapseProps['items']>(() => {
    if (!styleConfig?.length || !currentEditingCardId) return []

    return groupStyleConfig(styleConfig).map(([groupName, keys]) => ({
      key: groupName,
      label: groupName,
      style: panelStyle,
      children: (
        <div className="flex flex-col gap-4">
          {keys.map((configKey) => (
            <StyleConfigField key={configKey} cardId={currentEditingCardId} configKey={configKey} />
          ))}
        </div>
      ),
    }))
  }, [currentEditingCardId, styleConfigSignature, styleConfig])

  if (!currentCard) {
    return (
      <div className="chart-container chart-config-panel px-3 py-6 text-center text-xs text-slate-500">
        请先在画布或图层中选择图表
      </div>
    )
  }

  return (
    <div className="chart-container chart-config-panel px-1 py-2">
      <CardTitleField cardId={currentEditingCardId} />
      {styleConfig?.length ? (
        <Collapse
          bordered={false}
          defaultActiveKey={collapseItems?.map((item) => item.key as string)}
          expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
          items={collapseItems}
        />
      ) : (
        <div className="px-2 pb-2 text-xs text-slate-500">当前图表无可配置样式项</div>
      )}
    </div>
  )
}

export default ChartConfig
