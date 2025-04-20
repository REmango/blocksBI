import { create } from 'zustand'

import { DashboardStore } from '@/types/dashboard'

const useDashboardStore = create<DashboardStore>((set) => ({
  currentPageIndex: 0,
  pageList: [],
  setCurrentPageIndex: (currentPageIndex: number) => set({ currentPageIndex }),
}))

export default useDashboardStore
