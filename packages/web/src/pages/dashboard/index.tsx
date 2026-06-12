import { Layout } from 'antd'
import BiHeader from './header'
import BiSider from './sider'
import BiContent from './content'
import BiRightSider from './rightSider'

const { Header, Content } = Layout

// 首页
const Dashboard = () => {
  return (
    <Layout className="h-screen  overflow-hidden">
      <Header
        className="h-[40px]  flex leading-[40px] justify-between text-slate-200	pl-[18px] pr-[18px] items-center "
        style={{ background: '#111' }}
      >
        <BiHeader />
      </Header>
      <Layout className="min-h-0 flex-1">
        <BiSider />
        <Layout className="min-h-0">
          <Content className="relative overflow-hidden">
            <BiContent />
          </Content>
          <BiRightSider />
        </Layout>
      </Layout>
    </Layout>
  )
}

export default Dashboard
