import { useEffect } from 'react'
import { Layout } from 'antd'
import { useParams } from 'react-router'

import { initDashboardPersistence } from '@/store/dashboardPersistence'
import { bindDashboardWsLifecycle } from '@/ws'

import { useDashboardCanvasToolBridge } from '@/agent/useDashboardCanvasToolBridge'

import BiHeader from './header'
import BiSider from './sider'
import BiContent from './content'
import BiRightSider from './rightSider'
import LayoutDragProvider from './layoutDrag/LayoutDragProvider'

const { Header, Content } = Layout

const Dashboard = () => {
  const { dashboardId } = useParams<{ dashboardId: string }>()

  useDashboardCanvasToolBridge()

  useEffect(() => {
    return bindDashboardWsLifecycle()
  }, [])

  useEffect(() => {
    void initDashboardPersistence(dashboardId)
  }, [dashboardId])

  return (
    <Layout className="h-screen  overflow-hidden">
      <Header
        className="h-[40px]  flex leading-[40px] justify-between text-slate-200	pl-[18px] pr-[18px] items-center "
        style={{ background: '#111' }}
      >
        <BiHeader />
      </Header>
      <LayoutDragProvider>
        <Layout className="min-h-0 flex-1">
          <BiSider />
          <Layout className="min-h-0">
            <Content className="relative flex min-h-0 flex-1 overflow-hidden">
              <BiContent />
            </Content>
            <BiRightSider />
          </Layout>
        </Layout>
      </LayoutDragProvider>
    </Layout>
  )
}

export default Dashboard
