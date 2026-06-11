import { useEffect, useState } from 'react'
import { Input, Tooltip } from 'antd'
import {
  DashboardOutlined,
  SaveOutlined,
  ShareAltOutlined,
  CaretRightOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import useDashboardStore from '@/store/useDashboardStore'

const Header = () => {
  const dashboardName = useDashboardStore((state) => state.dashboardName)
  const setDashboardName = useDashboardStore((state) => state.setDashboardName)
  const [isNameEditing, setIsNameEditing] = useState<boolean>(false)

  return (
    <>
      <div className="left text-blue-500 font-semibold basis-[400px] ">
        {isNameEditing ? (
          <Input
            value={dashboardName}
            onChange={(e) => setDashboardName(e.target.value)}
            onBlur={() => setIsNameEditing(false)}
            onFocus={() => setIsNameEditing(true)}
            autoFocus
          />
        ) : (
          <div onClick={() => setIsNameEditing(true)} className="cursor-pointer">
            <DashboardOutlined className="pr-[5px]" />
            {dashboardName}
          </div>
        )}
      </div>
      <div className="center flex text-slate-300">
        <Tooltip title="保存">
          <div className="cursor-pointer border border-slate-300 rounded h-[24px] w-[24px] mr-[10px] flex items-center justify-center rounded-md">
            <SaveOutlined />
          </div>
        </Tooltip>
        <Tooltip title="分享">
          <div className="cursor-pointer border border-slate-300 rounded h-[24px] w-[24px] mr-[10px] flex items-center justify-center rounded-md">
            <ShareAltOutlined />
          </div>
        </Tooltip>
        <Tooltip title="预览">
          <div className="cursor-pointer border border-slate-300 rounded h-[24px] w-[24px] mr-[10px] flex items-center justify-center rounded-md">
            <CaretRightOutlined />
          </div>
        </Tooltip>
      </div>
      <div className="right basis-[300px] flex justify-end text-slate-300 cursor-pointer">
        <SettingOutlined className="mr-[5px] " />
        设置
      </div>
    </>
  )
}

export default Header
