import { DesktopOutlined, MobileOutlined } from '@ant-design/icons'
import { Select } from 'antd'

import useDashboardStore from '@/store/useDashboardStore'
import { ViewMode } from '@/types/dashboard'

import { IPHONE_MODELS } from '../constants/iphoneModels'

const VIEW_MODE_OPTIONS: { value: ViewMode; icon: typeof DesktopOutlined; title: string }[] = [
  { value: 'pc', icon: DesktopOutlined, title: 'PC' },
  { value: 'mobile', icon: MobileOutlined, title: '移动端' },
]

const IPHONE_MODEL_OPTIONS = IPHONE_MODELS.map((item) => ({
  label: item.label,
  value: item.id,
}))

const ViewModeToggle = () => {
  const viewMode = useDashboardStore((state) => state.viewMode)
  const mobileDeviceId = useDashboardStore((state) => state.mobileDeviceId)
  const setViewMode = useDashboardStore((state) => state.setViewMode)
  const setMobileDeviceId = useDashboardStore((state) => state.setMobileDeviceId)

  const activeIndex = VIEW_MODE_OPTIONS.findIndex((item) => item.value === viewMode)

  return (
    <div className="view-mode-bar">
      <div className="view-mode-toggle">
        <div
          className="view-mode-toggle-slider"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        />
        {VIEW_MODE_OPTIONS.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.value}
              type="button"
              title={item.title}
              className={`view-mode-toggle-item${viewMode === item.value ? ' is-active' : ''}`}
              onClick={() => setViewMode(item.value)}
            >
              <Icon />
            </button>
          )
        })}
      </div>

      {viewMode === 'mobile' && (
        <Select
          className="view-mode-device-select"
          value={mobileDeviceId}
          options={IPHONE_MODEL_OPTIONS}
          popupClassName="view-mode-device-select-dropdown"
          onChange={setMobileDeviceId}
        />
      )}
    </div>
  )
}

export default ViewModeToggle
