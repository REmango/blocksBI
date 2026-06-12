import { create } from 'zustand'

import {
  AdvancedConfigState,
  DashboardStore,
  CardLayout,
  PushConfigState,
  ViewMode,
} from '@/types/dashboard'
import { generateId, getCardDefaultConfig } from '@/utils'
import { CARD_DEFAULT_LAYOUT } from '@/pages/dashboard/constants'
import { DEFAULT_ADVANCED_CONFIG } from '@/pages/dashboard/constants/advancedConfig'
import { DEFAULT_PUSH_CONFIG } from '@/pages/dashboard/constants/pushConfig'
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
  viewMode: 'pc',
  pushConfig: DEFAULT_PUSH_CONFIG,
  advancedConfig: DEFAULT_ADVANCED_CONFIG,
  hiddenCardIdsByPage: {},
  setCardSearchName: (cardSearchName: string) => set({ cardSearchName }),
  setDashboardName: (dashboardName: string) => set({ dashboardName }),
  setCanvasWidth: (canvasWidth: number) => set({ canvasWidth }),
  setCanvasHeight: (canvasHeight: number) => set({ canvasHeight }),
  setViewMode: (viewMode: ViewMode) => set({ viewMode }),
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
          showCardTitle: true,
          props: defaultConfig,
        },
      }

      return { cardMap: newCardMap, pageList: newPageList }
    })
  },
  setCardName: (cardId: string, name: string) =>
    set((state) => {
      const card = state.cardMap[cardId]
      if (!card) return state

      return {
        cardMap: {
          ...state.cardMap,
          [cardId]: {
            ...card,
            name,
          },
        },
      }
    }),
  setCardShowTitle: (cardId: string, showCardTitle: boolean) =>
    set((state) => {
      const card = state.cardMap[cardId]
      if (!card) return state

      return {
        cardMap: {
          ...state.cardMap,
          [cardId]: {
            ...card,
            showCardTitle,
          },
        },
      }
    }),
  updatePushConfig: (patch: Partial<PushConfigState>) =>
    set((state) => ({
      pushConfig: {
        ...state.pushConfig,
        ...patch,
      },
    })),
  setPageHiddenCardIds: (pageIndex: number, cardIds: string[]) =>
    set((state) => ({
      hiddenCardIdsByPage: {
        ...state.hiddenCardIdsByPage,
        [pageIndex]: cardIds,
      },
    })),
  updateAdvancedConfig: (patch: Partial<AdvancedConfigState>) =>
    set((state) => ({
      advancedConfig: {
        ...state.advancedConfig,
        ...patch,
      },
    })),
  updateCardStyleValue: (cardId: string, key: string, value: unknown) =>
    set((state) => {
      const card = state.cardMap[cardId]
      if (!card?.props?.styleConfig) return state

      const styleConfig = card.props.styleConfig.map((item: { key: string; defaultValue: unknown }) =>
        item.key === key ? { ...item, defaultValue: value } : item,
      )

      return {
        cardMap: {
          ...state.cardMap,
          [cardId]: {
            ...card,
            props: {
              ...card.props,
              styleConfig,
            },
          },
        },
      }
    }),
}))

export default useDashboardStore
