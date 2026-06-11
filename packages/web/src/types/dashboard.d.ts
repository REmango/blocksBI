export interface CardLayout {
  id: string
  x: number
  y: number
  width: number
  height: number
}

type PageLayout = CardLayout[]

export interface CardItem<T> {
  id: string
  key: string
  componentName: string
  name: string
  props: T
}

export interface CardIMap<T> {
  [key: string]: CardItem<T>
}

export interface DashboardStore {
  dashboardName: string
  cardSearchName: string
  setDashboardName: (dashboardName: string) => void
  currentPageIndex: number
  pageList: PageLayout[]
  cardMap: CardIMap<any>
  currentEditingCardId: string
  canvasWidth: number
  canvasHeight: number
  setCardSearchName: (cardSearchName: string) => void
  setCurrentPageIndex: (currentPageIndex: number) => void
  setCurrentEditingCardId: (currentEditingCardId: string) => void
  addPage: () => void
  addCard: (cardKey: string, position: { x: number; y: number }) => void
  setCanvasWidth: (canvasWidth: number) => void
  setCanvasHeight: (canvasHeight: number) => void
}
