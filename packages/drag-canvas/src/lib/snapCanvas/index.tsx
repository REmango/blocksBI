import React, { useState, useRef, useEffect, memo } from 'react'
import { CanvasSnapLines } from '../IDrag'
import eventBus from '../utils/eventBus'

const SnapCanvas = () => {
  const [snapLines, setSnapLines] = useState<CanvasSnapLines | null>(null)

  useEffect(() => {
    eventBus.on(`snapLine`, (snapLines: CanvasSnapLines) => {
      setSnapLines(snapLines)
    })
  }, [])

  // 当移动结束时，清除snapLines
  useEffect(() => {
    eventBus.on(`canvas-dragEnd`, () => {
      setSnapLines(null)
    })
  }, [])

  if (!snapLines) return null

  const { vLine, hLine } = snapLines
  // 获取所有的可见的snapLine
  const vLineList = vLine.filter((line) => line.display)
  const hLineList = hLine.filter((line) => line.display)

  if (vLineList.length === 0 && hLineList.length === 0) return null

  return (
    <>
      {vLineList.map((line) => (
        <div
          className="snap-line"
          style={{
            height: line.lineLength,
            width: 1,
            left: line.position,
            top: line.origin,
          }}
        ></div>
      ))}
      {hLineList.map((line) => (
        <div
          className="snap-line"
          style={{
            left: line.origin,
            width: line.lineLength,
            height: 1,
            top: line.position,
          }}
        ></div>
      ))}
    </>
  )
}

export default memo(SnapCanvas)
