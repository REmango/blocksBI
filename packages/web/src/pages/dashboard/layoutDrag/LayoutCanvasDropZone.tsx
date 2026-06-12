import { useDroppable } from '@dnd-kit/core'

import { LAYOUT_CANVAS_DROPPABLE_ID } from '../constants/layoutContainer'

interface LayoutCanvasDropZoneProps {
  children: React.ReactNode
}

const LayoutCanvasDropZone = ({ children }: LayoutCanvasDropZoneProps) => {
  const { setNodeRef } = useDroppable({ id: LAYOUT_CANVAS_DROPPABLE_ID })

  return (
    <div ref={setNodeRef} className="h-full w-full min-h-full">
      {children}
    </div>
  )
}

export default LayoutCanvasDropZone
