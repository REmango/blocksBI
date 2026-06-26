import type { ChartData, IChartConfig } from '@block-bi/material'

import type { LayoutContainerKey } from '@/pages/dashboard/constants/layoutContainer'
import type { WidgetComponentName } from '@block-bi/material'

export interface CardLayout {
  id: string
  x: number
  y: number
  width: number
  height: number
}

type PageLayout = CardLayout[]

export interface CardItem<TProps = unknown> {
  id: string
  key: string
  componentName: string
  name: string
  showCardTitle?: boolean
  props: TProps
}

export interface CardIMap<TProps = unknown> {
  [key: string]: CardItem<TProps>
}

export interface CardSiderConfig {
  key: string
  name: string
  groupName: string
  icon: string
  description?: string
  componentName: string
}

export interface ChartCardProps {
  siderConfig: CardSiderConfig
  styleConfig: IChartConfig[]
  dataConfig: ChartData
  eventConfig: Record<string, unknown>
}

export interface LayoutContainerCardProps {
  columns: number
  layoutKey: LayoutContainerKey
}

export interface WidgetCardProps {
  siderConfig: CardSiderConfig
  styleConfig: IChartConfig[]
  dataConfig: Record<string, unknown>
  eventConfig: Record<string, unknown>
}

export interface ChartCardItem extends CardItem<ChartCardProps> {
  componentName: 'chart'
}

export interface WidgetCardItem extends CardItem<WidgetCardProps> {
  componentName: WidgetComponentName
}

export interface LayoutContainerCardItem extends CardItem<LayoutContainerCardProps> {
  componentName: 'layoutContainer'
  key: LayoutContainerKey
}

export type DashboardCardItem = ChartCardItem | WidgetCardItem | LayoutContainerCardItem

export type DashboardCardMap = Record<string, DashboardCardItem>

export type PushChannel = 'wecom' | 'dingtalk' | 'email'
export type PushScheduleType = 'hourly' | 'daily' | 'weekly' | 'monthly'
export type PushReportSize = 'pc' | 'largeScreen' | 'mobile'
export type ViewMode = 'pc' | 'mobile'

export type CacheStrategy = '10m' | '30m' | '1h' | '12h'
export type MaxQueryCount = 5000 | 10000 | 100000
export type QueryTimeout = 10 | 30 | 60
export type DataSortOrder = 'asc' | 'desc'
export type RefreshInterval = '1m' | '3m' | '10m'
export type NullValueHandling = 'zero' | 'hide' | 'dash'

export interface AdvancedConfigState {
  cacheStrategy: CacheStrategy
  maxQueryCount: MaxQueryCount
  queryTimeout: QueryTimeout
  dataSortOrder: DataSortOrder
  autoRefreshEnabled: boolean
  refreshInterval: RefreshInterval
  nullValueHandling: NullValueHandling
}

export interface DashboardPersistedState {
  dashboardName: string
  currentPageIndex: number
  pageList: PageLayout[]
  pageNames: string[]
  cardMap: DashboardCardMap
  canvasWidth: number
  canvasHeight: number
  viewMode: ViewMode
  mobileDeviceId: string
  savedPcCanvasWidth: number
  savedPcCanvasHeight: number
  pushConfig: PushConfigState
  advancedConfig: AdvancedConfigState
  hiddenCardIdsByPage: Record<number, string[]>
}

export interface PushConfigState {
  pushName: string
  receiveMembers: string[]
  channels: PushChannel[]
  emailName: string
  scheduleType: PushScheduleType
  weeklyDays: number[]
  monthlyDays: number[]
  reportSize: PushReportSize
  retryCount: number
}

export interface DashboardStore {
  dashboardName: string
  cardSearchName: string
  setDashboardName: (dashboardName: string) => void
  currentPageIndex: number
  pageList: PageLayout[]
  pageNames: string[]
  setPageName: (pageIndex: number, name: string) => void
  cardMap: DashboardCardMap
  currentEditingCardId: string
  canvasWidth: number
  canvasHeight: number
  viewMode: ViewMode
  mobileDeviceId: string
  savedPcCanvasWidth: number
  savedPcCanvasHeight: number
  setViewMode: (viewMode: ViewMode) => void
  setMobileDeviceId: (mobileDeviceId: string) => void
  setCardSearchName: (cardSearchName: string) => void
  setCurrentPageIndex: (currentPageIndex: number) => void
  setCurrentEditingCardId: (currentEditingCardId: string) => void
  addPage: () => void
  addCard: (cardKey: string, position: { x: number; y: number }) => void
  addLayoutContainer: (layoutKey: string, position: { x: number; y: number }) => void
  updateCardLayout: (cardId: string, layout: Partial<CardLayout>) => void
  setCurrentPageLayout: (layout: CardLayout[]) => void
  setCanvasWidth: (canvasWidth: number) => void
  setCanvasHeight: (canvasHeight: number) => void
  updateCardStyleValue: (cardId: string, key: string, value: unknown) => void
  setCardName: (cardId: string, name: string) => void
  setCardShowTitle: (cardId: string, showCardTitle: boolean) => void
  pushConfig: PushConfigState
  updatePushConfig: (patch: Partial<PushConfigState>) => void
  hiddenCardIdsByPage: Record<number, string[]>
  setPageHiddenCardIds: (pageIndex: number, cardIds: string[]) => void
  advancedConfig: AdvancedConfigState
  updateAdvancedConfig: (patch: Partial<AdvancedConfigState>) => void
}
