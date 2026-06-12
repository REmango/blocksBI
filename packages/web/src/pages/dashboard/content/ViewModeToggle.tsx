import { DesktopOutlined, MobileOutlined } from '@ant-design/icons'

import useDashboardStore from '@/store/useDashboardStore'
import { ViewMode } from '@/types/dashboard'

const VIEW_MODE_OPTIONS: { value: ViewMode; icon: typeof DesktopOutlined; title: string }[] = [
  { value: 'pc', icon: DesktopOutlined, title: 'PC' },
  { value: 'mobile', icon: MobileOutlined, title: '移动端' },
]

const ViewModeToggle = () => {
  const viewMode = useDashboardStore((state) => state.viewMode)
  const setViewMode = useDashboardStore((state) => state.setViewMode)

  const activeIndex = VIEW_MODE_OPTIONS.findIndex((item) => item.value === viewMode)

  return (
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
  )
}

export default ViewModeToggle
