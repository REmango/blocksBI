import React, { useState, useRef, useEffect, memo } from 'react'
import { DndContext, useDraggable, useDndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToParentElement } from '@dnd-kit/modifiers'

import SelectCanvas from './selectCanvas'
import eventBus from './utils/eventBus'
import CanvasContext, { CanvasContextType } from './canvasContext'

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

  const [store, setStore] = useState<CanvasContextType['store']>({
    canvasWidth: width,
    canvasHeight: height,
    selectedIds: [],
  })

  // 更新画布
  useEffect(() => {
    setStore({
      ...store,
      canvasWidth: width,
      canvasHeight: height,
    })
  }, [width, height])

  return (
    <CanvasContext.Provider value={{ store, setStore }}>
      <div
        style={{
          position: 'relative',
          width: store.canvasWidth,
          height: store.canvasHeight,
          border: '1px solid black',
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
