import React, { useState, memo, useEffect, useReducer } from 'react'
import { DndContext, useDraggable, useDndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToParentElement } from '@dnd-kit/modifiers'

import eventBus from './utils/eventBus'
import { getSelectedAreaByDomIds } from './utils/'
import CanvasContext, { CanvasActionType, canvasReducer } from './canvasContext'
import SelectCanvas from './selectCanvas'
import SelectItem from './selectCanvas/selectItem'
import SnapCanvas from './snapCanvas'
import { DragCanvasProps } from './IDrag'
import './index.css'

const DragCanvas: React.FC<DragCanvasProps> = (props) => {
  const { width, height, children, canvasParentId, className, canvasRef } = props

  const [selectedArea, setSelectedArea] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)

  const [groupSelectedArea, setGroupSelectedArea] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 120,
        tolerance: 3,
      },
    }),
  )

  const handleDragEnd = (event: any) => {
    const { active, delta } = event
    const { id } = active

    const eventName = `${id}-dragEnd`

    eventBus.emit(eventName, { delta })
    eventBus.emit(`canvas-dragEnd`, { delta })
  }

  const [store, dispatch] = useReducer(canvasReducer, {
    canvasWidth: width,
    canvasHeight: height,
    selectedIds: [],
    isGroupSelected: false,
  })

  // 更新画布
  useEffect(() => {
    dispatch({
      type: CanvasActionType.SET_CANVAS_WIDTH,
      payload: width,
    })
    dispatch({
      type: CanvasActionType.SET_CANVAS_HEIGHT,
      payload: height,
    })
  }, [width, height])

  useEffect(() => {
    if (store.selectedIds.length > 1) {
      dispatch({
        type: CanvasActionType.SET_IS_GROUP_SELECTED,
        payload: true,
      })

      // 同时计算选中的区域
      setGroupSelectedArea(getSelectedAreaByDomIds(store.selectedIds))
    } else {
      dispatch({
        type: CanvasActionType.SET_IS_GROUP_SELECTED,
        payload: false,
      })
    }
  }, [store.selectedIds])

  return (
    <CanvasContext.Provider value={{ store, dispatch }}>
      <div
        style={{
          position: 'relative',
          width: store.canvasWidth,
          height: store.canvasHeight,
        }}
        className={className}
        ref={canvasRef}
      >
        <div className="drag-canvas-bg"></div>
        <SelectCanvas setSelectedArea={setSelectedArea} canvasParentId={canvasParentId} />
        <DndContext onDragEnd={handleDragEnd} modifiers={[restrictToParentElement]} sensors={sensors}>
          {children}

          {/* 选中区域 */}
          {store.isGroupSelected && groupSelectedArea && (
            <SelectItem
              id="select-area"
              x={groupSelectedArea.x - 1}
              y={groupSelectedArea.y - 1}
              width={groupSelectedArea.width + 2}
              height={groupSelectedArea.height + 2}
              selectedIds={store.selectedIds}
            />
          )}
        </DndContext>
        <div className="drag-canvas-selected-area">
          {selectedArea && (
            <div
              className="drag-canvas-selected-area-content"
              style={{
                left: selectedArea.x,
                top: selectedArea.y,
                width: selectedArea.width,
                height: selectedArea.height,
              }}
            />
          )}
        </div>

        <div className="offscreen-canvas">
          <SnapCanvas />
        </div>
      </div>
    </CanvasContext.Provider>
  )
}

export default memo(DragCanvas)
