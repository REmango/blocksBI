import React, { useState, useRef, useEffect, memo, useContext } from 'react'
import { useDraggable, useDndContext } from '@dnd-kit/core'
import { CSS, Transform } from '@dnd-kit/utilities'
import classNames from 'classnames'
import eventBus from './utils/eventBus'
import { addEvent, removeEvent, restrictToBounds, round, isIntersect } from './utils'
import CanvasContext from './canvasContext'
import { handles } from './constants'
import { DraggableItemProps, MouseDownClickPosition, ResizeLimit } from './IDrag'

import './index.css'
import { Store } from 'antd/es/form/interface'

const DraggableItem: React.FC<DraggableItemProps> = (props) => {
  const { id, maxWidth, maxHeight, initialPosition, snapTolerance = 5, minWidth, minHeight, children } = props

  const { store, setStore } = useContext(CanvasContext)

  const [isInSelectedArea, setIsInSelectedArea] = useState(false)

  const storeRef = useRef(store)

  useEffect(() => {
    storeRef.current = store
  }, [store])

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  })
  const context = useDndContext()

  const [width, setWidth] = useState(150)
  const [height, setHeight] = useState(150)
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
    const temArr = () => new Array(3).fill({ display: false, position: '', origin: '', lineLength: '' })
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

      const hc = Math.abs(activeTop + height / 2 - (t + h / 2)) <= snapTolerance // 水平中线
      const vc = Math.abs(activeLeft + width / 2 - (l + w / 2)) <= snapTolerance // 垂直中线

      const ts = Math.abs(t - activeBottom) <= snapTolerance // 从上到下
      const TS = Math.abs(b - activeBottom) <= snapTolerance // 从上到下
      const bs = Math.abs(t - activeTop) <= snapTolerance // 从下到上
      const BS = Math.abs(b - activeTop) <= snapTolerance // 从下到上

      const ls = Math.abs(l - activeRight) <= snapTolerance // 外左
      const LS = Math.abs(r - activeRight) <= snapTolerance // 外左
      const rs = Math.abs(l - activeLeft) <= snapTolerance // 外右
      const RS = Math.abs(r - activeLeft) <= snapTolerance // 外右

      tem['display'] = [ts, TS, bs, BS, hc, hc, ls, LS, rs, RS, vc, vc]
      tem['position'] = [t, b, t, b, t + h / 2, t + h / 2, l, r, l, r, l + w / 2, l + w / 2]

      // fix：中线自动对齐，元素可能超过父元素边界的问题

      let snapX = null
      let snapY = null
      if (ts) {
        snapY = t - height
        tem.value.y[0].push(l, r, activeLeft, activeRight)
      }
      if (bs) {
        snapY = t
        tem.value.y[0].push(l, r, activeLeft, activeRight)
      }
      if (TS) {
        snapY = b - height

        tem.value.y[1].push(l, r, activeLeft, activeRight)
      }
      if (BS) {
        snapY = b

        tem.value.y[1].push(l, r, activeLeft, activeRight)
      }

      if (ls) {
        snapX = l - width

        tem.value.x[0].push(t, b, activeTop, activeBottom)
      }
      if (rs) {
        snapX = l

        tem.value.x[0].push(t, b, activeTop, activeBottom)
      }
      if (LS) {
        snapX = r - width

        tem.value.x[1].push(t, b, activeTop, activeBottom)
      }
      if (RS) {
        snapX = r
        tem.value.x[1].push(t, b, activeTop, activeBottom)
      }

      if (hc) {
        snapY = t + h / 2 - height / 2

        tem.value.y[2].push(l, r, activeLeft, activeRight)
      }
      if (vc) {
        snapX = l + w / 2 - width / 2
        tem.value.x[2].push(t, b, activeTop, activeBottom)
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
    }
  }

  useEffect(() => {
    if (transform !== null) {
      transformRef.current = transform
      snapCheck()
    }
  }, [transform])

  // 监听事件
  useEffect(() => {
    const cb = () => {
      setPosition((prevPositions) => ({
        x: prevPositions.x + round((transformRef.current as Transform).x),
        y: prevPositions.y + round((transformRef.current as Transform).y),
      }))
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
        setStore((prevStore: Store) => ({
          ...prevStore,
          selectedIds: [...new Set([...prevStore.selectedIds, id])],
        }))
        setIsInSelectedArea(false)
      }
    }
    eventBus.on('selectedAreaEnd', cb)
    return () => {
      eventBus.off('selectedAreaEnd', cb)
    }
  }, [store, isInSelectedArea, setStore])

  const mouseDownClickPosition = useRef<MouseDownClickPosition | null>(null)
  const resizeLimitsRef = useRef<ResizeLimit | null>(null)
  const isResizing = useRef(false)
  const handleRef = useRef<string>('')

  const style: React.CSSProperties = {
    position: 'absolute',
    top: position.y,
    left: position.x,
    transform: transform ? CSS.Translate.toString(transformRef.current) : undefined,
    width: width,
    height: height,
    backgroundColor: id === 'item1' ? '#ddd' : '#aaa',
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
    // 单选
    setStore({
      ...store,
      selectedIds: [id],
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
              active: store.selectedIds.includes(id) && !isInSelectedArea,
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
