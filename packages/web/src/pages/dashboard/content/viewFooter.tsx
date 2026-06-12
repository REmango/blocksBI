import { PlusCircleOutlined, QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons'

import useDashboardStore from '@/store/useDashboardStore'

import { Tooltip, Tabs } from 'antd'

import CanvasTabLabel from './viewFooter/CanvasTabLabel'

const ViewFooter = () => {
  const pageList = useDashboardStore((state) => state.pageList)
  const pageNames = useDashboardStore((state) => state.pageNames)
  const setCurrentPageIndex = useDashboardStore((state) => state.setCurrentPageIndex)
  const currentPageIndex = useDashboardStore((state) => state.currentPageIndex)
  const addPage = useDashboardStore((state) => state.addPage)
  const setPageName = useDashboardStore((state) => state.setPageName)

  const switchPage = (key: string) => {
    setCurrentPageIndex(Number(key))
  }

  const handleRename = (pageIndex: number, name: string) => {
    setPageName(pageIndex, name)
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
              items={pageList.map((_, index) => ({
                key: String(index),
                label: (
                  <CanvasTabLabel
                    name={pageNames[index] ?? `画布${index + 1}`}
                    pageIndex={index}
                    onRename={handleRename}
                  />
                ),
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
