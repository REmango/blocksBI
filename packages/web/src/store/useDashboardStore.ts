import { create } from 'zustand'

import {
  AdvancedConfigState,
  ChartCardItem,
  DashboardCardItem,
  DashboardCardMap,
  DashboardStore,
  CardLayout,
  LayoutContainerCardItem,
  PushConfigState,
  ViewMode,
  WidgetCardItem,
} from '@/types/dashboard'
import { generateId, getCardDefaultConfig } from '@/utils'
import { CARD_DEFAULT_LAYOUT, LAYOUT_CONTAINER_COMPONENT_NAME } from '@/pages/dashboard/constants'
import {
  LAYOUT_CONTAINER_MAP,
  LAYOUT_CONTAINER_MIN_HEIGHT,
  LayoutContainerKey,
} from '@/pages/dashboard/constants/layoutContainer'
import { DEFAULT_ADVANCED_CONFIG } from '@/pages/dashboard/constants/advancedConfig'
import {
  DEFAULT_IPHONE_MODEL_ID,
  getIphoneModel,
} from '@/pages/dashboard/constants/iphoneModels'
import { DEFAULT_PUSH_CONFIG } from '@/pages/dashboard/constants/pushConfig'
import { restrictToBounds } from '@block-bi/drag-canvas'
import { isWidgetComponentName, type IChartConfig } from '@block-bi/material'

export const defaultDashboardState = {
  dashboardName: '未命名',
  currentPageIndex: 0,
  pageList: [[], []] as CardLayout[][],
  pageNames: ['画布1', '画布2'],
  cardMap: {} as DashboardCardMap,
  canvasWidth: 1000,
  canvasHeight: 1400,
  viewMode: 'pc' as ViewMode,
  mobileDeviceId: DEFAULT_IPHONE_MODEL_ID,
  savedPcCanvasWidth: 1000,
  savedPcCanvasHeight: 1400,
  pushConfig: DEFAULT_PUSH_CONFIG,
  advancedConfig: DEFAULT_ADVANCED_CONFIG,
  hiddenCardIdsByPage: {},
}

const useDashboardStore = create<DashboardStore>((set) => ({
  ...defaultDashboardState,
  cardSearchName: '',
  currentEditingCardId: '',
  setCardSearchName: (cardSearchName: string) => set({ cardSearchName }),
  setDashboardName: (dashboardName: string) => set({ dashboardName }),
  setCanvasWidth: (canvasWidth: number) =>
    set((state) =>
      state.viewMode === 'pc'
        ? { canvasWidth, savedPcCanvasWidth: canvasWidth }
        : { canvasWidth },
    ),
  setCanvasHeight: (canvasHeight: number) =>
    set((state) =>
      state.viewMode === 'pc'
        ? { canvasHeight, savedPcCanvasHeight: canvasHeight }
        : { canvasHeight },
    ),
  setViewMode: (viewMode: ViewMode) =>
    set((state) => {
      if (viewMode === 'mobile') {
        const device = getIphoneModel(state.mobileDeviceId)
        return {
          viewMode,
          savedPcCanvasWidth: state.canvasWidth,
          savedPcCanvasHeight: state.canvasHeight,
          canvasWidth: device.width,
          canvasHeight: device.height,
        }
      }

      return {
        viewMode,
        canvasWidth: state.savedPcCanvasWidth,
        canvasHeight: state.savedPcCanvasHeight,
      }
    }),
  setMobileDeviceId: (mobileDeviceId: string) =>
    set((state) => {
      const device = getIphoneModel(mobileDeviceId)
      if (state.viewMode !== 'mobile') {
        return { mobileDeviceId }
      }

      return {
        mobileDeviceId,
        canvasWidth: device.width,
        canvasHeight: device.height,
      }
    }),
  setCurrentPageIndex: (currentPageIndex: number) => set({ currentPageIndex }),
  setCurrentEditingCardId: (currentEditingCardId: string) => set({ currentEditingCardId }),
  addPage: () =>
    set((state) => ({
      pageList: [...state.pageList, []],
      pageNames: [...state.pageNames, `画布${state.pageList.length + 1}`],
    })),
  setPageName: (pageIndex: number, name: string) =>
    set((state) => {
      if (pageIndex < 0 || pageIndex >= state.pageNames.length) return state
      const trimmed = name.trim()
      const nextName = trimmed || `画布${pageIndex + 1}`
      if (state.pageNames[pageIndex] === nextName) return state

      return {
        pageNames: state.pageNames.map((pageName, index) =>
          index === pageIndex ? nextName : pageName,
        ),
      }
    }),
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
      const cardConfig =
        CARD_DEFAULT_LAYOUT[componentName as keyof typeof CARD_DEFAULT_LAYOUT] ??
        CARD_DEFAULT_LAYOUT.chart

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

      const newCardMap: DashboardCardMap = {
        ...state.cardMap,
        [cardId]: {
          id: cardId,
          key: cardKey,
          componentName,
          name: title + `(${len + 1})`,
          showCardTitle: !isWidgetComponentName(componentName),
          props: defaultConfig,
        } as DashboardCardItem,
      }

      return { cardMap: newCardMap, pageList: newPageList }
    })
  },
  addLayoutContainer: (layoutKey: string, position: { x: number; y: number }) =>
    set((state) => {
      if (state.viewMode !== 'pc') return state

      const meta = LAYOUT_CONTAINER_MAP[layoutKey as LayoutContainerKey]
      if (!meta) return state

      const cardId = generateId()
      const canvasWidth = state.canvasWidth
      const canvasHeight = state.canvasHeight
      const height = meta.defaultHeight
      const y = restrictToBounds(Math.round(position.y), 0, canvasHeight - height)

      const layoutInitialValue: CardLayout = {
        id: cardId,
        x: 0,
        y,
        width: canvasWidth,
        height,
      }

      const currentPageIndex = state.currentPageIndex
      const currentPage = state.pageList[currentPageIndex]
      const len = currentPage.length

      const newPageList = state.pageList.map((page, index) =>
        index === currentPageIndex ? [...page, layoutInitialValue] : page,
      )

      const newCardMap: DashboardCardMap = {
        ...state.cardMap,
        [cardId]: {
          id: cardId,
          key: meta.key,
          componentName: LAYOUT_CONTAINER_COMPONENT_NAME,
          name: `${meta.label}(${len + 1})`,
          showCardTitle: false,
          props: {
            columns: meta.columns,
            layoutKey: meta.key,
          },
        } satisfies LayoutContainerCardItem,
      }

      return { cardMap: newCardMap, pageList: newPageList }
    }),
  updateCardLayout: (cardId: string, layout: Partial<CardLayout>) =>
    set((state) => {
      const currentPageIndex = state.currentPageIndex
      const currentPage = state.pageList[currentPageIndex]
      const cardIndex = currentPage.findIndex((item) => item.id === cardId)
      if (cardIndex < 0) return state

      const card = state.cardMap[cardId]
      const isLayoutContainer = card?.componentName === LAYOUT_CONTAINER_COMPONENT_NAME
      const canvasWidth = state.canvasWidth

      const currentLayout = currentPage[cardIndex]
      const nextLayout = { ...currentLayout, ...layout }
      if (isLayoutContainer) {
        nextLayout.x = 0
        nextLayout.width = canvasWidth
      }

      if (
        nextLayout.x === currentLayout.x &&
        nextLayout.y === currentLayout.y &&
        nextLayout.width === currentLayout.width &&
        nextLayout.height === currentLayout.height
      ) {
        return state
      }

      const newPage = currentPage.map((item, index) =>
        index === cardIndex ? nextLayout : item,
      )

      return {
        pageList: state.pageList.map((page, index) =>
          index === currentPageIndex ? newPage : page,
        ),
      }
    }),
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
      if (!card || (card.componentName !== 'chart' && !isWidgetComponentName(card.componentName))) {
        return state
      }

      const styleConfigCard = card as ChartCardItem | WidgetCardItem
      const styleConfig = styleConfigCard.props.styleConfig.map((item: IChartConfig) =>
        item.key === key ? { ...item, defaultValue: value } : item,
      )

      const updatedCard: ChartCardItem | WidgetCardItem =
        styleConfigCard.componentName === 'chart'
          ? {
              ...styleConfigCard,
              props: {
                ...styleConfigCard.props,
                styleConfig,
              },
            }
          : {
              ...(styleConfigCard as WidgetCardItem),
              props: {
                ...(styleConfigCard as WidgetCardItem).props,
                styleConfig,
              },
            }

      return {
        cardMap: {
          ...state.cardMap,
          [cardId]: updatedCard,
        },
      }
    }),
}))

export default useDashboardStore
