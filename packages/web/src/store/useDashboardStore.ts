import { create } from 'zustand'

import { DashboardStore, CardLayout } from '@/types/dashboard'
import { generateId, getCardDefaultConfig } from '@/utils'
import { CARD_DEFAULT_LAYOUT } from '@/pages/dashboard/constants'
import { restrictToBounds } from '@block-bi/drag-canvas'

const useDashboardStore = create<DashboardStore>((set) => ({
  dashboardName: '看板标题',
  cardSearchName: '',
  currentPageIndex: 0,
  pageList: [[], []], // 初始为一个空画布
  currentEditingCardId: '',
  cardMap: {}, // 所有的组件
  canvasWidth: 1000,
  canvasHeight: 1400,
  setCardSearchName: (cardSearchName: string) => set({ cardSearchName }),
  setDashboardName: (dashboardName: string) => set({ dashboardName }),
  setCanvasWidth: (canvasWidth: number) => set({ canvasWidth }),
  setCanvasHeight: (canvasHeight: number) => set({ canvasHeight }),
  setCurrentPageIndex: (currentPageIndex: number) => set({ currentPageIndex }),
  setCurrentEditingCardId: (currentEditingCardId: string) => set({ currentEditingCardId }),
  addPage: () => set((state) => ({ pageList: [...state.pageList, []] })),
  setCurrentPageLayout: (layout: CardLayout[]) =>
    set((state) => ({
      pageList: state.pageList.map((page, index) => (index === state.currentPageIndex ? layout : page)),
    })),
  addCard: (cardKey: string, position: { x: number; y: number }) => {
    return set((state) => {
      const cardId = generateId()
      const defaultConfig = getCardDefaultConfig(cardKey)
      const componentName = defaultConfig.siderConfig.componentName
      const title = defaultConfig.siderConfig.name
      const cardConfig = CARD_DEFAULT_LAYOUT[componentName as keyof typeof CARD_DEFAULT_LAYOUT]

      const canvasWidth = state.canvasWidth
      const canvasHeight = state.canvasHeight
      const x = restrictToBounds(Math.round(position.x), 0, canvasWidth - cardConfig.width)
      const y = restrictToBounds(Math.round(position.y), 0, canvasHeight - cardConfig.height)

      const layoutInitialValue: CardLayout = {
        id: cardId,
        x,
        y,
        width: cardConfig.width,
        height: cardConfig.height,
      }

      const currentPageIndex = state.currentPageIndex
      const currentPage = state.pageList[currentPageIndex]
      const len = currentPage.length

      const newPageList = state.pageList.map((page, index) =>
        index === currentPageIndex ? [...page, layoutInitialValue] : page,
      )

      const newCardMap = {
        ...state.cardMap,
        [cardId]: {
          id: cardId,
          key: cardKey,
          componentName,
          name: title + `(${len + 1})`,
          props: defaultConfig,
        },
      }

      return { cardMap: newCardMap, pageList: newPageList }
    })
  },
}))

export default useDashboardStore
