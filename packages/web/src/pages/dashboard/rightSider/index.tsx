import type { ReactNode } from 'react'
import { Layout, Tabs } from 'antd'
import type { TabsProps } from 'antd'

import ChartConfig from './chartConfig'
import PushConfig from './pushConfig'
import AdvancedConfig from './advancedConfig'

const { Sider } = Layout

const wrapTabContent = (content: ReactNode) => (
  <div className="right-sider-tab-content">{content}</div>
)

const BiRightSider = () => {
  const items: TabsProps['items'] = [
    {
      key: 'chart',
      label: '图表配置',
      children: wrapTabContent(<ChartConfig />),
    },
    {
      key: 'push',
      label: '推送配置',
      children: wrapTabContent(<PushConfig />),
    },
    {
      key: 'advanced',
      label: '高级配置',
      children: wrapTabContent(<AdvancedConfig />),
    },
  ]

  return (
    <Sider
      width={300}
      className="sider right-sider text-slate-300 select-none"
      style={{ background: '#181a1b' }}
    >
      <Tabs defaultActiveKey="chart" className="right-sider-tabs" items={items} centered />
    </Sider>
  )
}

export default BiRightSider
