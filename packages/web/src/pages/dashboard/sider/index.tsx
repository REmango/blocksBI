import { Layout, Tabs } from 'antd'
import type { TabsProps } from 'antd'

import ViewContainer from './viewContainer'

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
      children: 'Content of Tab Pane 2',
    },
    {
      key: '3',
      label: '布局',
      children: 'Content of Tab Pane 3',
    },
  ]

  return (
    <Sider width={260} className="sider text-slate-300 	" style={{ background: '#181a1b' }}>
      <Tabs defaultActiveKey="1" items={items} centered />
    </Sider>
  )
}

export default BiSider
