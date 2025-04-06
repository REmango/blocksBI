import { PlusCircleOutlined, QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons'

import { Tooltip } from 'antd'

const ViewFooter = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[36px] bg-zinc-800 text-white ">
      <div className="flex items-center justify-between px-[20px] h-full">
        <div className="view-footer-left">
          <Tooltip title="新建画布">
            <div className="cursor-pointer">
              <PlusCircleOutlined />
            </div>
          </Tooltip>
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
