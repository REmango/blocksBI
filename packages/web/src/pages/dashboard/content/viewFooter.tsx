import { PlusCircleOutlined, QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons'

import useDashboardStore from '@/store/useDashboardStore'

import { Tooltip, Tabs } from 'antd'

const ViewFooter = () => {
  const { pageList, setCurrentPageIndex, currentPageIndex, addPage } = useDashboardStore()

  const switchPage = (key: string) => {
    setCurrentPageIndex(Number(key))
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[36px] bg-zinc-800 text-white view-footer select-none">
      <div className="flex items-center justify-between px-[20px] h-full">
        <div className="view-footer-left basis-1/2 flex items-center">
          <Tooltip title="新建画布">
            <div className="cursor-pointer mr-[20px]" onClick={addPage}>
              <PlusCircleOutlined />
            </div>
          </Tooltip>

          <div className="flex-1">
            <Tabs
              defaultActiveKey="0"
              onChange={switchPage}
              activeKey={String(currentPageIndex)}
              items={pageList.map((page, index) => ({
                key: String(index),
                label: `画布${index + 1}  `,
              }))}
            />
          </div>
        </div>

        <div className="view-footer-right flex items-center gap-[10px]">
          <Tooltip title="设置">
            <div
              className="cursor-pointer mr-[6px]"
              onClick={() => {
                console.log('设置')
              }}
            >
              <SettingOutlined />
            </div>
          </Tooltip>

          <Tooltip title="帮助">
            <div className="cursor-pointer">
              <QuestionCircleOutlined />
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

export default ViewFooter
