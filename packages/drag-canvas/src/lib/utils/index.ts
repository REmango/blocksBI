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
