export interface CardLayout {
  id: string
  x: number
  y: number
  width: number
  height: number
}

type PageLayout = CardLayout[]

export interface CardItem<T> {
  props: T
}

export interface CardIMap<T> {
  [key: string]: CardItem<T>
}

export interface DashboardStore {
  currentPageIndex: number
  pageList: PageLayout[]
  cardMap: CardIMap<any>
  currentEditingCardId: string
  setCurrentPageIndex: (currentPageIndex: number) => void
  setCurrentEditingCardId: (currentEditingCardId: string) => void
  addPage: () => void
}
