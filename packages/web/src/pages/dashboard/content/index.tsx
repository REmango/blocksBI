import DragCanvas, { DraggableItem } from '@block-bi/drag-canvas'

import ViewFooter from './viewFooter'

// dndKit

const CANVAS_PARENT_ID = 'CANVAS_PARENT_ID'

const Content = () => {
  return (
    <>
      <div
        className="bg-zinc-800 overflow-y-auto overflow-x-auto h-full w-full pt-[60px] "
        style={{ background: '#282c34' }}
        id={CANVAS_PARENT_ID}
      >
        <div className="mb-[80px] px-[40px] ">
          <DragCanvas width={1000} height={1400} canvasParentId={CANVAS_PARENT_ID} className="mx-auto">
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
      <ViewFooter />
    </>
  )
}

export default Content
