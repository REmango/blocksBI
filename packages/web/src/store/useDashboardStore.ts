import { create } from 'zustand'

import { DashboardStore } from '@/types/dashboard'

const useDashboardStore = create<DashboardStore>((set) => ({
  currentPageIndex: 0,
  pageList: [[], []], // 初始为一个空画布
  currentEditingCardId: '',
  cardMap: {}, // 所有的组件
  setCurrentPageIndex: (currentPageIndex: number) => set({ currentPageIndex }),
  setCurrentEditingCardId: (currentEditingCardId: string) => set({ currentEditingCardId }),
  addPage: () => set((state) => ({ pageList: [...state.pageList, []] })),
}))

export default useDashboardStore
