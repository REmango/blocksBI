import DragCanvas, { DraggableItem } from '@block-bi/drag-canvas'

// dndKit

const CANVAS_PARENT_ID = 'CANVAS_PARENT_ID'

const Content = () => {
  return (
    <div
      className="bg-zinc-800 overflow-scroll h-full w-full pt-[40px] px-[60px]"
      style={{ background: '#282c34' }}
      id={CANVAS_PARENT_ID}
    >
      <div className="mb-[80px]">
        <DragCanvas width={1000} height={1400} canvasParentId={CANVAS_PARENT_ID}>
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
    </div>
  )
}

export default Content
