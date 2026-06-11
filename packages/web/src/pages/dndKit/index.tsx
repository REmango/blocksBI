import DragCanvas, { DraggableItem } from '@block-bi/drag-canvas'

// dndKit

const DndKit = () => {
  return (
    <div>
      <DragCanvas width={1000} height={800}>
        <DraggableItem
          id="item1"
          initialPosition={{ x: 0, y: 0 }}
          minWidth={100}
          minHeight={100}
          initialSize={{
            width: 100,
            height: 100,
          }}
        >
          item1
        </DraggableItem>
        <DraggableItem
          id="item2"
          initialPosition={{ x: 500, y: 500 }}
          minWidth={100}
          minHeight={100}
          initialSize={{
            width: 200,
            height: 200,
          }}
        >
          item2
        </DraggableItem>
      </DragCanvas>
    </div>
  )
}

export default DndKit
