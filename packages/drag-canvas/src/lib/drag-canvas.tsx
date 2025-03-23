import React, { useState, useRef, useEffect, useReducer } from 'react'
import { DndContext, useDraggable, useDndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToParentElement } from '@dnd-kit/modifiers'

import SelectCanvas from './selectCanvas'
import eventBus from './utils/eventBus'
import CanvasContext, { CanvasActionType, canvasReducer } from './canvasContext'

import { DragCanvasProps } from './IDrag'
import './index.css'

const DragCanvas: React.FC<DragCanvasProps> = (props) => {
  const { width, height, children } = props

  const [selectedArea, setSelectedArea] = useState<{
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
          border: '1px solid #eee',
        }}
      >
        <div className="drag-canvas-bg"></div>
        <SelectCanvas setSelectedArea={setSelectedArea} />
        <DndContext onDragEnd={handleDragEnd} modifiers={[restrictToParentElement]} sensors={sensors}>
          {children}
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
      </div>
    </CanvasContext.Provider>
  )
}

export default DragCanvas
