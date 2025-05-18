import React, { useState, useRef, useEffect, memo, useContext } from 'react'
import { useDraggable, useDndContext } from '@dnd-kit/core'
import { CSS, Transform } from '@dnd-kit/utilities'
import classNames from 'classnames'
import eventBus from './utils/eventBus'
import { addEvent, removeEvent, restrictToBounds, round, isIntersect, calcLineValues } from './utils'
import CanvasContext, { CanvasActionType } from './canvasContext'
import { handles } from './constants'
import { DraggableItemProps, MouseDownClickPosition, ResizeLimit } from './IDrag'

import './index.css'

const DraggableItem: React.FC<DraggableItemProps> = (props) => {
  const {
    id,
    maxWidth,
    maxHeight,
    initialPosition,
    snapTolerance = 8,
    minWidth,
    minHeight,
    children,
    notifyItemLayoutChange,
    initialSize,
  } = props

  const { store, dispatch } = useContext(CanvasContext)

  const [isInSelectedArea, setIsInSelectedArea] = useState(false)

  const storeRef = useRef(store)

  useEffect(() => {
    storeRef.current = store
  }, [store])

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  })
  const context = useDndContext()

  const [width, setWidth] = useState(initialSize?.width ?? 200)
  const [height, setHeight] = useState(initialSize?.height ?? 200)
  const [position, setPosition] = useState(initialPosition || { x: 0, y: 0 })
  const [isMouseEnter, setIsMouseEnter] = useState(false)

  const transformRef = useRef<Transform>(null)

  function snapCheck() {
    if (!transformRef.current) return
    const x = position.x + transformRef.current.x
    const y = position.y + transformRef.current.y
    let activeLeft = x
    let activeRight = x + width
    let activeTop = y
    let activeBottom = y + height

    // 初始化辅助线数据
    const temArr = () => new Array(3).fill(0).map(() => ({ display: false, position: '', origin: '', lineLength: '' }))
    const refLine: Record<string, any> = { vLine: temArr(), hLine: temArr() }

    // 获取所有节点
    const { draggableNodes, active } = context

    // 除了本节点
    const nodes = [...draggableNodes.values()].filter((node) => active?.id !== node?.id)

    let tem: {
      value: any
      display: boolean[]
      position: number[]
    } = {
      value: { x: [[], [], []], y: [[], [], []] },
      display: [],
      position: [],
    }

    for (let item of nodes) {
      const dom = item?.node.current as HTMLElement
      const w = +dom.style.width.replace(/px/g, '')
      const h = +dom.style.height.replace(/px/g, '')
      const l = +dom.style.left.replace(/px/g, '')
      const t = +dom.style.top.replace(/px/g, '')

      const r = l + w // 对齐目标right
      const b = t + h // 对齐目标的bottom

      const hc = t + h / 2
      const vc = l + w / 2
      const activeHCenter = activeTop + height / 2
      const activeVCenter = activeLeft + width / 2

      // 水平中线
      const hcC = Math.abs(hc - activeHCenter) <= snapTolerance // 水平中线和中线
      const hcT = Math.abs(hc - activeTop) <= snapTolerance // 水平中线和top
      const hcB = Math.abs(hc - activeBottom) <= snapTolerance // 水平中线和bottom
      const htC = Math.abs(t - activeHCenter) <= snapTolerance // 水平中线和top
      const hbC = Math.abs(b - activeHCenter) <= snapTolerance // 水平中线和bottom

      // 垂直中线
      const vcC = Math.abs(vc - activeVCenter) <= snapTolerance // 垂直中线和中线
      const vcL = Math.abs(vc - activeLeft) <= snapTolerance // 垂直中线和left
      const vcR = Math.abs(vc - activeRight) <= snapTolerance // 垂直中线和right
      const vlC = Math.abs(l - activeVCenter) <= snapTolerance // 垂直中线和left
      const vrC = Math.abs(r - activeVCenter) <= snapTolerance // 垂直中线和right

      const tB = Math.abs(t - activeBottom) <= snapTolerance // 上下
      const bB = Math.abs(b - activeBottom) <= snapTolerance // 下下
      const tT = Math.abs(t - activeTop) <= snapTolerance // 上上
      const bT = Math.abs(b - activeTop) <= snapTolerance // 下上

      const lR = Math.abs(l - activeRight) <= snapTolerance // 左右
      const rR = Math.abs(r - activeRight) <= snapTolerance // 右右
      const lL = Math.abs(l - activeLeft) <= snapTolerance // 左左
      const rL = Math.abs(r - activeLeft) <= snapTolerance // 右左

      tem['display'] = [tB, bB, tT, bT, hcC, hcT, hcB, htC, hbC, lR, rR, lL, rL, vcC, vcL, vcR, vlC, vrC]

      tem['position'] = [t, b, t, b, hc, hc, hc, t, b, l, r, l, r, vc, vc, vc, l, r]
      // 辅助线坐标与是否显示(display)对应的数组,易于循环遍历
      const arrTem = [0, 1, 0, 1, 2, 2, 2, 0, 1, 0, 1, 0, 1, 2, 2, 2, 0, 1]

      // fix：中线自动对齐，元素可能超过父元素边界的问题

      let snapX = null
      let snapY = null
      if (tB) {
        snapY = t - height
        tem.value.y[0].push(l, r, activeLeft, activeRight)
      }
      if (tT) {
        snapY = t
        tem.value.y[0].push(l, r, activeLeft, activeRight)
      }
      if (bB) {
        snapY = b - height
        tem.value.y[1].push(l, r, activeLeft, activeRight)
      }
      if (bT) {
        snapY = b
        tem.value.y[1].push(l, r, activeLeft, activeRight)
      }

      if (lR) {
        snapX = l - width
        tem.value.x[0].push(t, b, activeTop, activeBottom)
      }
      if (lL) {
        snapX = l
        tem.value.x[0].push(t, b, activeTop, activeBottom)
      }
      if (rR) {
        snapX = r - width
        tem.value.x[1].push(t, b, activeTop, activeBottom)
      }
      if (rL) {
        snapX = r
        tem.value.x[1].push(t, b, activeTop, activeBottom)
      }

      if (hcC) {
        snapY = t + h / 2 - height / 2
        tem.value.y[2].push(l, r, activeLeft, activeRight)
      }
      if (vcC) {
        snapX = l + w / 2 - width / 2
        tem.value.x[2].push(t, b, activeTop, activeBottom)
      }

      if (hcT) {
        snapY = hc
        tem.value.y[2].push(l, r, activeLeft, activeRight)
      }
      if (hcB) {
        snapY = hc - height
        tem.value.y[2].push(l, r, activeLeft, activeRight)
      }
      if (htC) {
        snapY = t - height / 2
        tem.value.y[0].push(l, r, activeLeft, activeRight)
      }
      if (hbC) {
        snapY = b - height / 2
        tem.value.y[1].push(l, r, activeLeft, activeRight)
      }
      if (vcL) {
        snapX = vc
        tem.value.x[2].push(t, b, activeTop, activeBottom)
      }
      if (vcR) {
        snapX = vc - width
        tem.value.x[2].push(t, b, activeTop, activeBottom)
      }
      if (vlC) {
        snapX = l - width / 2
        tem.value.x[0].push(t, b, activeTop, activeBottom)
      }
      if (vrC) {
        snapX = r - width / 2
        tem.value.x[1].push(t, b, activeTop, activeBottom)
      }

      // 设置吸附
      if (transformRef.current && snapX !== null) {
        transformRef.current.x = snapX - position.x
      }
      if (transformRef.current && snapY !== null) {
        transformRef.current = {
          ...transformRef.current,
          y: snapY - position.y,
        }
      }

      for (let i = 0; i <= arrTem.length; i++) {
        // 前6为Y辅助线,后6为X辅助线
        const xory = i < 9 ? 'y' : 'x'
        const horv = i < 9 ? 'hLine' : 'vLine'
        if (tem.display[i]) {
          const { origin, length } = calcLineValues(tem.value[xory][arrTem[i]])
          refLine[horv][arrTem[i]].display = tem.display[i]
          refLine[horv][arrTem[i]].position = tem.position[i] + 'px'
          refLine[horv][arrTem[i]].origin = origin
          refLine[horv][arrTem[i]].lineLength = length
        }
      }
    }

    // 发送吸附事件
    eventBus.emit(`snapLine`, refLine)
  }

  // 通知外层事件更新布局
  useEffect(() => {
    notifyItemLayoutChange?.({ x: position.x, y: position.y, width, height })
  }, [position, width, height, notifyItemLayoutChange])

  useEffect(() => {
    if (transform !== null) {
      transformRef.current = transform
      snapCheck()
    }
  }, [transform])

  // 监听选中区域移动事件
  useEffect(() => {
    const cb = (data: { transform: Transform }) => {
      transformRef.current = data.transform
    }
    eventBus.on(`${id}-transform`, cb)
    return () => {
      eventBus.off(`${id}-transform`, cb)
    }
  }, [])

  // 监听事件
  useEffect(() => {
    const cb = () => {
      // 使用回调函数更新位置 避免闭包问题
      setPosition((prevPositions) => {
        const tmp = transformRef.current as Transform
        // 将transformRef.current重置
        transformRef.current = null
        return {
          x: prevPositions.x + round(tmp?.x ?? 0),
          y: prevPositions.y + round(tmp?.y ?? 0),
        }
      })

      notifyItemLayoutChange?.({ x: position.x, y: position.y, width, height })
    }
    eventBus.on(`${id}-dragEnd`, cb)

    return () => {
      eventBus.off(`${id}-dragEnd`, cb)
    }
  }, [])

  // 监听选中区域事件
  useEffect(() => {
    const cb = (area: { x: number; y: number; width: number; height: number }) => {
      const isIn = isIntersect(area, { x: position.x, y: position.y, width, height })
      // 如果选中区域发生变化，则更新选中状态 减少不必要的渲染
      if (isIn !== isInSelectedArea) {
        setIsInSelectedArea(isIn)
      }
    }
    eventBus.on('selectedAreaChange', cb)

    return () => {
      eventBus.off('selectedAreaChange', cb)
    }
  }, [position, width, height, isInSelectedArea])

  // 监听选中状态结束
  useEffect(() => {
    const cb = () => {
      // 将选中状态设置为false
      if (isInSelectedArea) {
        // 更新选择状态
        dispatch({
          type: CanvasActionType.MERGE_SELECTED_IDS,
          payload: [id],
        })
        setIsInSelectedArea(false)
      }
    }
    eventBus.on('selectedAreaEnd', cb)
    return () => {
      eventBus.off('selectedAreaEnd', cb)
    }
  }, [store, isInSelectedArea, dispatch])

  const mouseDownClickPosition = useRef<MouseDownClickPosition | null>(null)
  const resizeLimitsRef = useRef<ResizeLimit | null>(null)
  const isResizing = useRef(false)
  const handleRef = useRef<string>('')

  const style: React.CSSProperties = {
    position: 'absolute',
    top: position.y,
    left: position.x,
    transform: transform || store.isGroupSelected ? CSS.Translate.toString(transformRef.current) : undefined,
    width: width,
    height: height,
    userSelect: 'none',
    backgroundColor: '#fff',
  }

  const handleOnMouseDown = (handle: string, event: React.MouseEvent<HTMLDivElement>) => {
    const { canvasWidth, canvasHeight } = storeRef.current
    event.stopPropagation()
    // 只有鼠标左键按下时才触发
    if (event.button !== 0) {
      return
    }

    isResizing.current = true
    handleRef.current = handle

    mouseDownClickPosition.current = {
      left: position.x,
      top: position.y,
      right: canvasWidth - width - position.x, // 距离右边的位置
      bottom: canvasHeight - height - position.y, // 距离底部的位置
      width,
      height,
      mouseX: event.pageX,
      mouseY: event.pageY,
    }

    const bounds = calcResizeLimits()
    resizeLimitsRef.current = bounds

    addEvent(document.documentElement, 'mousemove', mouseMove)
    addEvent(document.documentElement, 'mouseup', mouseUp)
  }

  const mouseMove = (event: MouseEvent) => {
    const { canvasWidth, canvasHeight } = storeRef.current
    const curHandle = handleRef.current
    const bounds = resizeLimitsRef.current as ResizeLimit
    // 如果鼠标没有按下，则不进行操作
    if (!isResizing.current) {
      return
    }

    // 获取当前位置
    let left = position.x
    let top = position.y
    let bottom = canvasHeight - height - top
    let right = canvasWidth - width - left

    const mouseClickPosition = mouseDownClickPosition.current as MouseDownClickPosition

    // 计算鼠标移动的距离
    const deltaX = mouseClickPosition.mouseX - event.pageX
    const deltaY = mouseClickPosition.mouseY - event.pageY

    if (curHandle.includes('b')) {
      bottom = restrictToBounds(mouseClickPosition.bottom + deltaY, bounds.minBottom, bounds.maxBottom)
    }
    if (curHandle.includes('r')) {
      right = restrictToBounds(mouseClickPosition.right + deltaX, bounds.minRight, bounds.maxRight)
    }
    if (curHandle.includes('t')) {
      top = restrictToBounds(mouseClickPosition.top - deltaY, bounds.minTop, bounds.maxTop)
    }
    if (curHandle.includes('l')) {
      left = restrictToBounds(mouseClickPosition.left - deltaX, bounds.minLeft, bounds.maxLeft)
    }
    const newWidth = canvasWidth - left - right
    const newHeight = canvasHeight - top - bottom

    setWidth(newWidth)
    setHeight(newHeight)

    setPosition({
      x: left,
      y: top,
    })
  }

  const mouseUp = () => {
    if (isResizing.current) {
      isResizing.current = false
      resetBoundsAndMouseState()
      // 清除事件
      removeEvent(document.documentElement, 'mousemove', mouseMove)
      removeEvent(document.documentElement, 'mouseup', mouseUp)
    }
  }

  const resetBoundsAndMouseState = () => {
    mouseDownClickPosition.current = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      mouseX: 0,
      mouseY: 0,
    }

    resizeLimitsRef.current = null
  }

  const calcResizeLimits = (): ResizeLimit => {
    const { canvasWidth, canvasHeight } = storeRef.current
    const resizeLimits: ResizeLimit = {
      minLeft: null,
      maxLeft: null,
      minTop: null,
      maxTop: null,
      minRight: null,
      maxRight: null,
      minBottom: null,
      maxBottom: null,
    }
    if (!mouseDownClickPosition.current) {
      return resizeLimits
    }

    const { left, top, right, bottom, width, height } = mouseDownClickPosition.current

    let maxW = maxWidth ?? canvasWidth
    let maxH = maxHeight ?? canvasHeight

    resizeLimits.minLeft = 0
    resizeLimits.maxLeft = left + Math.floor(width - minWidth)
    resizeLimits.minTop = 0
    resizeLimits.maxTop = top + Math.floor(height - minHeight)
    resizeLimits.minRight = 0
    resizeLimits.maxRight = right + Math.floor(width - minWidth)
    resizeLimits.minBottom = 0
    resizeLimits.maxBottom = bottom + Math.floor(height - minHeight)

    if (maxW) {
      resizeLimits.minLeft = Math.max(resizeLimits.minLeft, canvasWidth - right - maxW)
      resizeLimits.minRight = Math.max(resizeLimits.minRight, canvasWidth - left - maxW)
    }

    if (maxH) {
      resizeLimits.minTop = Math.max(resizeLimits.minTop, canvasHeight - bottom - maxH)
      resizeLimits.minBottom = Math.max(resizeLimits.minBottom, canvasHeight - top - maxH)
    }

    return resizeLimits
  }

  const handleMouseEnter = () => {
    setIsMouseEnter(true)
  }

  const handleMouseLeave = () => {
    setIsMouseEnter(false)
  }

  const handleMouseClick = () => {
    const { selectedIds, isGroupSelected } = store
    // 分为两种情况，包含id 或者 不包含id
    if (selectedIds.includes(id) && isGroupSelected) {
      return
    }

    // 单选
    dispatch({
      type: CanvasActionType.SET_SELECTED_IDS,
      payload: [id],
    })
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      id={id}
      key={id}
    >
      <div
        className={classNames('draggable-item', {
          active: isMouseEnter || store.selectedIds.includes(id) || isInSelectedArea,
        })}
        onMouseDown={handleMouseClick}
      >
        {handles.map((handle) => (
          <div
            key={handle}
            className={classNames('handle', `handle-${handle}`, {
              active:
                store.selectedIds.length === 1 &&
                store.selectedIds.includes(id) &&
                !isInSelectedArea &&
                !store.isGroupSelected,
            })}
            onMouseDown={(event) => handleOnMouseDown(handle, event)}
            onPointerDown={(event) => {
              // 阻止默认的拖拽
              event.stopPropagation()
            }}
          />
        ))}
        {children}
      </div>
    </div>
  )
}

const DraggableItemMemo = memo(DraggableItem)

export default DraggableItemMemo
