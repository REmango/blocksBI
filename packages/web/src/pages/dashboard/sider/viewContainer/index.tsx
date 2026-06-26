import type { CSSProperties } from 'react'
import { Collapse } from 'antd'
import { CaretRightOutlined } from '@ant-design/icons'
import type { CollapseProps } from 'antd'

import { leftMenuConfig } from '@block-bi/material'
import useDashboardStore from '@/store/useDashboardStore'

import Search from '../search'
import ChartPaletteItem from './ChartPaletteItem'
import WidgetPaletteItem from './WidgetPaletteItem'
import { WIDGET_GROUP_NAME } from './widgetIcons'

const ViewContainer = () => {
  const cardSearchName = useDashboardStore((state) => state.cardSearchName)

  const getItems: (panelStyle: CSSProperties) => CollapseProps['items'] = (panelStyle) => {
    const items: CollapseProps['items'] = []
    Object.entries(leftMenuConfig).forEach(([groupName, value]) => {
      const filteredItems = value.filter((item) => item.name.includes(cardSearchName))
      if (filteredItems.length === 0) return

      items.push({
        key: groupName,
        label: groupName,
        style: panelStyle,
        className: '',
        children: (
          <div className="flex flex-wrap">
            {filteredItems.map((item) =>
              groupName === WIDGET_GROUP_NAME ? (
                <WidgetPaletteItem key={item.key} itemKey={item.key} name={item.name} />
              ) : (
                <ChartPaletteItem key={item.key} itemKey={item.key} name={item.name} />
              ),
            )}
          </div>
        ),
      })
    })
    return items
  }

  const panelStyle: CSSProperties = {
    marginBottom: 0,
    background: 'transparent',
    borderRadius: 0,
    border: 'none',
  }

  const defaultActiveKey = Object.keys(leftMenuConfig).map((key) => key)

  return (
    <div className="chart-container">
      <div>
        <Search />
      </div>
      <div>
        <Collapse
          bordered={false}
          defaultActiveKey={defaultActiveKey}
          expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
          items={getItems(panelStyle)}
        />
      </div>
    </div>
  )
}

export default ViewContainer
