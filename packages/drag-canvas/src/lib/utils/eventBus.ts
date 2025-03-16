type EventHandler = (...args: any[]) => void

class EventBus {
  private events: { [key: string]: EventHandler[] } = {}

  // 订阅事件
  on(event: string, handler: EventHandler): void {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(handler)
  }

  // 取消订阅事件
  off(event: string, handler: EventHandler): void {
    if (!this.events[event]) return

    this.events[event] = this.events[event].filter((h) => h !== handler)
  }

  // 触发事件
  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return

    this.events[event].forEach((handler) => handler(...args))
  }
}

const eventBus = new EventBus()
export default eventBus
