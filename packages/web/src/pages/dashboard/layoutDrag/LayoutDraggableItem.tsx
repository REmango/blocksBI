import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

import { LayoutContainerKey } from '../constants/layoutContainer'

interface LayoutDraggableItemProps {
  layoutKey: LayoutContainerKey
  children: React.ReactNode
}

const LayoutDraggableItem = ({ layoutKey, children }: LayoutDraggableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `layout-sider-${layoutKey}`,
    data: { type: 'layout-sider', layoutKey },
  })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.45 : 1,
    touchAction: 'none',
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  )
}

export default LayoutDraggableItem
