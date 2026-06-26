import { Layout, Tabs } from 'antd'
import type { TabsProps } from 'antd'

import ViewContainer from './viewContainer'
import LayerContainer from './layerContainer'
import LayoutContainer from './layoutContainer'

const { Sider } = Layout

const BiSider = () => {
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: '组件',
      children: <ViewContainer />,
    },
    {
      key: '2',
      label: '图层',
      children: <LayerContainer />,
    },
    {
      key: '3',
      label: '布局',
      children: <LayoutContainer />,
    },
  ]

  return (
    <Sider width={260} className="sider text-slate-300  select-none	" style={{ background: '#181a1b' }}>
      <Tabs defaultActiveKey="1" items={items} centered />
    </Sider>
  )
}

export default BiSider
