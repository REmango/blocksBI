import type { CSSProperties } from 'react'
import { Collapse } from 'antd'
import { CaretRightOutlined } from '@ant-design/icons'
import type { CollapseProps } from 'antd'

import classNames from 'classnames'
import { COMPONENT_ICON_ITEM } from '@/pages/dashboard/constants'

import Search from '../search'

const ViewContainer = () => {
  const text = 'sdfsf'

  const chartList = [
    {
      key: '1',
      label: '简单线图',
      icon: <div className="iconfont icon-tubiao-zhexiantu text-chart text-orange-400"></div>,
    },
    {
      key: '2',
      label: '堆叠面积图',
      icon: <div className="iconfont icon-chart-line-full text-chart text-orange-400"></div>,
    },
    {
      key: '3',
      label: '面积图',
      icon: <div className="iconfont icon-chart-line-full text-chart text-orange-400"></div>,
    },
  ]

  const getItems: (panelStyle: CSSProperties) => CollapseProps['items'] = (panelStyle) => [
    {
      key: '1',
      label: '线图',
      children: (
        <div className="flex flex-wrap">
          {chartList.map((item) => (
            <div
              key={item.key}
              className={classNames('basis-1/3 flex flex-col items-center cursor-pointer  ', COMPONENT_ICON_ITEM)}
            >
              <div className="mb-[4px]">{item.icon}</div>
              <div className="text-[10px] text-center text-orange-400  text-ellipsis overflow-hidden">{item.label}</div>
            </div>
          ))}
        </div>
      ),
      style: panelStyle,
      className: '',
    },
    {
      key: '2',
      label: '柱状图',
      children: <p>{text}</p>,
      style: panelStyle,
    },
    {
      key: '3',
      label: '饼图',
      children: <p>{text}</p>,
      style: panelStyle,
    },
  ]

  const panelStyle: CSSProperties = {
    marginBottom: 0,
    background: 'transparent',
    borderRadius: 0,
    border: 'none',
  }

  return (
    <div className="chart-container">
      <div>
        <Search />
      </div>
      <div>
        <Collapse
          bordered={false}
          defaultActiveKey={['1']}
          expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
          items={getItems(panelStyle)}
        />
      </div>
    </div>
  )
}

export default ViewContainer
