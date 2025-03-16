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
