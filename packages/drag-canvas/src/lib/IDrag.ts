interface Position {
  x: number
  y: number
}

interface DraggableItemProps {
  id: string
  minWidth: number
  minHeight: number
  maxWidth?: number
  maxHeight?: number
  initialPosition?: Position
  snapTolerance?: number
  children?: React.ReactNode
}

interface MouseDownClickPosition {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
  mouseX: number
  mouseY: number
}

interface ResizeLimit {
  minLeft: number | null
  maxLeft: number | null
  minTop: number | null
  maxTop: number | null
  minRight: number | null
  maxRight: number | null
  minBottom: number | null
  maxBottom: number | null
}

interface DragCanvasProps {
  width: number
  height: number
  children: React.ReactNode
}

export type { Position, DraggableItemProps, MouseDownClickPosition, ResizeLimit, DragCanvasProps }
