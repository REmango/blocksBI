import { create } from 'zustand'

import { DashboardStore, CardLayout } from '@/types/dashboard'
import { generateId, getCardDefaultConfig } from '@/utils'

const useDashboardStore = create<DashboardStore>((set) => ({
  currentPageIndex: 0,
  pageList: [[], []], // 初始为一个空画布
  currentEditingCardId: '',
  cardMap: {}, // 所有的组件
  setCurrentPageIndex: (currentPageIndex: number) => set({ currentPageIndex }),
  setCurrentEditingCardId: (currentEditingCardId: string) => set({ currentEditingCardId }),
  addPage: () => set((state) => ({ pageList: [...state.pageList, []] })),
  addCard: (cardKey: string, position: { x: number; y: number }) => {
    return set((state) => {
      const cardId = generateId()
      const layoutInitialValue: CardLayout = {
        id: cardId,
        x: position.x,
        y: position.y,
        width: 300,
        height: 250,
      }

      const currentPage = state.pageList[state.currentPageIndex]
      currentPage.push(layoutInitialValue)
      const newCardMap = { ...state.cardMap }
      newCardMap[cardId] = {
        id: cardId,
        key: cardKey,
        props: getCardDefaultConfig(cardKey),
      }
      return { cardMap: newCardMap, pageList: state.pageList }
    })
  },
}))

export default useDashboardStore
