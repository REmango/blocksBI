import type { CSSProperties } from 'react'
import { Collapse } from 'antd'
import { CaretRightOutlined } from '@ant-design/icons'
import type { CollapseProps } from 'antd'

import classNames from 'classnames'
import { COMPONENT_ICON_ITEM } from '@/pages/dashboard/constants'

import { leftMenuConfig } from '@block-bi/material'
console.log(leftMenuConfig)

import Search from '../search'

const ViewContainer = () => {
  const getItems: (panelStyle: CSSProperties) => CollapseProps['items'] = (panelStyle) => {
    const items: CollapseProps['items'] = []
    Object.entries(leftMenuConfig).forEach(([key, value]) => {
      items.push({
        key,
        label: key,
        style: panelStyle,
        className: '',
        children: (
          <div className="flex flex-wrap">
            {value.map((item) => (
              <div
                key={item.key}
                className={classNames('basis-1/3 flex flex-col items-center cursor-pointer ', COMPONENT_ICON_ITEM)}
                data-id={item.key}
              >
                <div className="mb-[4px]">
                  <div className={classNames('iconfont text-chart text-orange-400', item.icon)}></div>
                </div>
                <div className="text-[10px] text-center text-orange-400  text-ellipsis overflow-hidden">
                  {item.name}
                </div>
              </div>
            ))}
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

  // 获取默认展开的key
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
