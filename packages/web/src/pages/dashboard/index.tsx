import { Layout } from 'antd'
import BiHeader from './header'
import BiSider from './sider'
import BiContent from './content'

const { Header, Sider, Content } = Layout

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
      <Layout>
        <BiSider />
        <Layout>
          <Content className="relative overflow-hidden">
            <BiContent />
          </Content>
          <Sider width={300} className="sider text-slate-300 	" style={{ background: '#181a1b' }}>
            hhh
          </Sider>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default Dashboard
