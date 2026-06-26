import { useRef, useState } from 'react'
import { Input, Popover, Tooltip, message } from 'antd'
import {
  DashboardOutlined,
  SaveOutlined,
  ShareAltOutlined,
  SettingOutlined,
  RobotOutlined,
} from '@ant-design/icons'
import { useParams } from 'react-router'

import { isValidDashboardId, saveDashboard, TEST_DASHBOARD_ID } from '@/api/dashboard'
import { pickPersistedState } from '@/store/dashboardPersistence'
import useDashboardStore, { defaultDashboardState } from '@/store/useDashboardStore'

import SettingsPanel from './settingsPanel'
import AiAssistantDrawer from './aiAssistantDrawer'

const Header = () => {
  const { dashboardId } = useParams<{ dashboardId: string }>()
  const dashboardName = useDashboardStore((state) => state.dashboardName)
  const setDashboardName = useDashboardStore((state) => state.setDashboardName)
  const [isNameEditing, setIsNameEditing] = useState<boolean>(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [nameSaving, setNameSaving] = useState(false)
  const nameBeforeEditRef = useRef(dashboardName)

  const beginNameEdit = () => {
    nameBeforeEditRef.current = dashboardName
    setIsNameEditing(true)
  }

  const commitNameEdit = async () => {
    setIsNameEditing(false)

    const trimmed = dashboardName.trim() || defaultDashboardState.dashboardName
    const previousName = nameBeforeEditRef.current

    if (trimmed !== dashboardName) {
      setDashboardName(trimmed)
    }

    if (trimmed === previousName) {
      return
    }

    if (!dashboardId) {
      message.warning(`请通过 /:dashboardId 路由访问后再保存名称，例如 /${TEST_DASHBOARD_ID}`)
      setDashboardName(previousName)
      return
    }

    if (!isValidDashboardId(dashboardId)) {
      message.warning(`dashboardId 必须是 UUID v4，测试可用：/${TEST_DASHBOARD_ID}`)
      setDashboardName(previousName)
      return
    }

    setNameSaving(true)
    try {
      await saveDashboard(dashboardId, {
        ...pickPersistedState(useDashboardStore.getState()),
        dashboardName: trimmed,
      })
      nameBeforeEditRef.current = trimmed
      message.success('名称已保存')
    } catch (error) {
      setDashboardName(previousName)
      message.error(error instanceof Error ? error.message : '名称保存失败')
    } finally {
      setNameSaving(false)
    }
  }

  const handleSave = async () => {
    if (!dashboardId) {
      message.warning(`请通过 /:dashboardId 路由访问后再保存，例如 /${TEST_DASHBOARD_ID}`)
      return
    }

    if (!isValidDashboardId(dashboardId)) {
      message.warning(`dashboardId 必须是 UUID v4，测试可用：/${TEST_DASHBOARD_ID}`)
      return
    }

    const state = useDashboardStore.getState()

    setSaving(true)
    try {
      const result = await saveDashboard(dashboardId, {
        dashboardName: state.dashboardName,
        currentPageIndex: state.currentPageIndex,
        pageList: state.pageList,
        pageNames: state.pageNames,
        cardMap: state.cardMap,
        canvasWidth: state.canvasWidth,
        canvasHeight: state.canvasHeight,
        viewMode: state.viewMode,
        mobileDeviceId: state.mobileDeviceId,
        savedPcCanvasWidth: state.savedPcCanvasWidth,
        savedPcCanvasHeight: state.savedPcCanvasHeight,
        pushConfig: state.pushConfig,
        advancedConfig: state.advancedConfig,
        hiddenCardIdsByPage: state.hiddenCardIdsByPage,
      })
      message.success(`保存成功（版本 v${result.version}，${result.componentCount} 个组件）`)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      message.success('链接已复制到剪贴板')
    } catch {
      message.error('复制失败，请手动复制地址栏链接')
    }
  }

  return (
    <>
      <div className="left text-blue-500 font-semibold basis-[250px] ">
        {isNameEditing ? (
          <Input
            value={dashboardName}
            onChange={(e) => setDashboardName(e.target.value)}
            onBlur={() => void commitNameEdit()}
            onPressEnter={(event) => event.currentTarget.blur()}
            disabled={nameSaving}
            autoFocus
          />
        ) : (
          <div
            onClick={beginNameEdit}
            className={`cursor-pointer ${nameSaving ? 'opacity-60' : ''}`}
          >
            <DashboardOutlined className="pr-[5px]" />
            {dashboardName}
          </div>
        )}
      </div>
      <div className="center flex text-slate-300">
        <Tooltip title="保存">
          <div
            className={`cursor-pointer border border-slate-300 rounded h-[24px] w-[24px] mr-[10px] flex items-center justify-center rounded-md ${
              saving ? 'opacity-50 pointer-events-none' : ''
            }`}
            onClick={() => void handleSave()}
          >
            <SaveOutlined />
          </div>
        </Tooltip>
        <Tooltip title="分享">
          <div
            className="cursor-pointer border border-slate-300 rounded h-[24px] w-[24px] mr-[10px] flex items-center justify-center rounded-md"
            onClick={() => void handleShare()}
          >
            <ShareAltOutlined />
          </div>
        </Tooltip>

      </div>
      <div className="right basis-[280px] flex justify-end items-center text-slate-300">
        <Popover
          content={<SettingsPanel />}
          trigger="click"
          placement="bottom"
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          overlayClassName="dashboard-settings-popover"
          arrow={{ pointAtCenter: true }}
          align={{ offset: [0, 6] }}
          getPopupContainer={() => document.body}
        >
          <div className="flex items-center cursor-pointer hover:text-slate-100">
            <SettingOutlined className="mr-[5px]" />
            设置
          </div>
        </Popover>
        <Tooltip title="AI助手">
          <div
            className="flex items-center cursor-pointer hover:text-slate-100 ml-[15px]"
            onClick={() => setAiAssistantOpen(true)}
          >
            <RobotOutlined className="mr-[5px]" />
            AI助手
          </div>
        </Tooltip>
      </div>
      <AiAssistantDrawer open={aiAssistantOpen} onClose={() => setAiAssistantOpen(false)} />
    </>
  )
}

export default Header
