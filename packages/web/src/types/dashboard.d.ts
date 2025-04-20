export interface CardLayout {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export interface Page {
  id: string
  name: string
  cardLayoutList: CardLayout[]
}

export interface CardViewMap<T> {
  props: T
}

export interface DashboardStore {
  currentPageIndex: number
  pageList: Page[]
  currentEditingCardId: string
}
