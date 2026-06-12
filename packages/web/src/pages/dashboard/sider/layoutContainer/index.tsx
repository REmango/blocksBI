import { LAYOUT_CONTAINER_MAP } from '@/pages/dashboard/constants/layoutContainer'
import LayoutDraggableItem from '@/pages/dashboard/layoutDrag/LayoutDraggableItem'

import LayoutIcon from './LayoutIcon'

const LAYOUT_OPTIONS = Object.values(LAYOUT_CONTAINER_MAP)

const LayoutContainer = () => {
  return (
    <div className="layout-container px-2 py-3">
      <div className="flex flex-col gap-2">
        {LAYOUT_OPTIONS.map((item) => (
          <LayoutDraggableItem key={item.key} layoutKey={item.key}>
            <div
              className="layout-item flex cursor-grab flex-col items-start gap-2 rounded px-2 py-3 transition-colors hover:bg-slate-800/60 active:cursor-grabbing"
            >
              <div className="text-[10px] text-orange-400">{item.label}</div>
              <div className="text-orange-400">
                <LayoutIcon columns={item.columns} />
              </div>
            </div>
          </LayoutDraggableItem>
        ))}
      </div>
    </div>
  )
}

export default LayoutContainer
