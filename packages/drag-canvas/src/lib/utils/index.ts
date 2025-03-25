// 添加事件
export function addEvent<K extends keyof HTMLElementEventMap>(
  el: HTMLElement,
  event: K,
  handler: (ev: HTMLElementEventMap[K]) => void,
) {
  if (!el) return
  el.addEventListener(event, handler, true)
}

// 删除事件
export function removeEvent<K extends keyof HTMLElementEventMap>(
  el: HTMLElement,
  event: K,
  handler: (ev: HTMLElementEventMap[K]) => void,
) {
  if (!el) return
  el.removeEventListener(event, handler, true)
}

export function restrictToBounds(value: number, min: number | null, max: number | null) {
  if (min !== null && value < min) {
    return min
  }

  if (max !== null && max < value) {
    return max
  }

  return value
}

// 数字取整
export function round(value: number) {
  return Math.round(value)
}

// 判断两个矩形是否相交
export function isIntersect(
  rect1: { x: number; y: number; width: number; height: number },
  rect2: { x: number; y: number; width: number; height: number },
) {
  const rect1Right = rect1.x + rect1.width
  const rect1Bottom = rect1.y + rect1.height
  const rect2Right = rect2.x + rect2.width
  const rect2Bottom = rect2.y + rect2.height

  return rect1.x < rect2Right && rect1Right > rect2.x && rect1.y < rect2Bottom && rect1Bottom > rect2.y
}

// 获取选中的区域
export function getSelectedAreaByDomIds(domIds: string[]) {
  const doms = domIds.map((id) => document.getElementById(id))

  const xAxis = []
  const yAxis = []

  // 获取所有选中dom的position、width、height属性

  for (const dom of doms) {
    if (dom) {
      const w = +dom.style.width.replace(/px/g, '')
      const h = +dom.style.height.replace(/px/g, '')
      const l = +dom.style.left.replace(/px/g, '')
      const t = +dom.style.top.replace(/px/g, '')

      console.log(w, h, l, t)

      xAxis.push(l)
      xAxis.push(l + w)
      yAxis.push(t)
      yAxis.push(t + h)
    }
  }

  console.log(xAxis, yAxis)

  const x = Math.min(...xAxis)
  const y = Math.min(...yAxis)
  const width = Math.max(...xAxis) - x
  const height = Math.max(...yAxis) - y

  return { x, y, width, height }
}

export function calcLineValues(arr: number[]) {
  const length = Math.max(...arr) - Math.min(...arr) + 'px'
  const origin = Math.min(...arr) + 'px'
  return { length, origin }
}
