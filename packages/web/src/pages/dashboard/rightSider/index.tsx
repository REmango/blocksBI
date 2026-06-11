import { Layout, Tabs } from 'antd'
import type { TabsProps } from 'antd'

import ChartConfig from './chartConfig'
import PushConfig from './pushConfig'
import AdvancedConfig from './advancedConfig'

const { Sider } = Layout

const BiRightSider = () => {
  const items: TabsProps['items'] = [
    {
      key: 'chart',
      label: '图表配置',
      children: <ChartConfig />,
    },
    {
      key: 'push',
      label: '推送配置',
      children: <PushConfig />,
    },
    {
      key: 'advanced',
      label: '高级配置',
      children: <AdvancedConfig />,
    },
  ]

  return (
    <Sider width={300} className="sider text-slate-300 select-none" style={{ background: '#181a1b' }}>
      <Tabs defaultActiveKey="chart" items={items} centered />
    </Sider>
  )
}

export default BiRightSider
