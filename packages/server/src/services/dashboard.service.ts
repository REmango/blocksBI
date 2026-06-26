import mongoose from 'mongoose'

import { getAdminUserId } from '../constants/admin'
import { BiComponentModel, BiDashboardModel } from '../db/models'
import { assertDashboardId, createDashboardId } from '../utils/dashboard-id'

export interface SaveDashboardPayload {
  dashboardName: string
  currentPageIndex: number
  pageNames: string[]
  pageList: Array<
    Array<{
      id: string
      x: number
      y: number
      width: number
      height: number
    }>
  >
  canvasWidth: number
  canvasHeight: number
  cardMap: Record<string, Record<string, unknown>>
  viewMode?: string
  mobileDeviceId?: string
  savedPcCanvasWidth?: number
  savedPcCanvasHeight?: number
  pushConfig?: Record<string, unknown>
  advancedConfig?: Record<string, unknown>
  hiddenCardIdsByPage?: Record<number, string[]>
}

export interface SaveDashboardResult {
  dashboardId: string
  version: number
  componentCount: number
}

export interface CreateDashboardResult {
  dashboardId: string
}

export interface DashboardListItem {
  dashboardId: string
  name: string
  pageCount: number
  componentCount: number
  canvasWidth: number
  canvasHeight: number
  version: number
  updatedAt: string
  createdAt: string
}

function toUserObjectId(userId: string): mongoose.Types.ObjectId {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid userId')
  }
  return new mongoose.Types.ObjectId(userId)
}

export async function createDashboard(name = '大盘数据'): Promise<CreateDashboardResult> {
  const userId = await getAdminUserId()
  const dashboardId = createDashboardId()

  await BiDashboardModel.create({
    dashboardId,
    userId: toUserObjectId(userId),
    name,
    pageNames: ['画布1'],
    pageList: [[]],
    currentPageIndex: 0,
    canvasWidth: 1000,
    canvasHeight: 1400,
    version: 1,
    isTemplate: false,
    isPublish: false,
    extraConfig: {},
  })

  return { dashboardId }
}

export async function saveDashboard(
  dashboardId: string,
  payload: SaveDashboardPayload,
): Promise<SaveDashboardResult> {
  const normalizedDashboardId = assertDashboardId(dashboardId)
  const userId = await getAdminUserId()
  const userObjectId = toUserObjectId(userId)

  const hiddenCardIds = new Set(
    Object.values(payload.hiddenCardIdsByPage ?? {}).flat(),
  )

  const extraConfig = {
    viewMode: payload.viewMode,
    mobileDeviceId: payload.mobileDeviceId,
    savedPcCanvasWidth: payload.savedPcCanvasWidth,
    savedPcCanvasHeight: payload.savedPcCanvasHeight,
    pushConfig: payload.pushConfig,
    advancedConfig: payload.advancedConfig,
    hiddenCardIdsByPage: payload.hiddenCardIdsByPage,
  }

  const existing = await BiDashboardModel.findOne({ dashboardId: normalizedDashboardId })

  const dashboard = existing
    ? await BiDashboardModel.findOneAndUpdate(
        { dashboardId: normalizedDashboardId },
        {
          $set: {
            userId: userObjectId,
            name: payload.dashboardName,
            pageNames: payload.pageNames,
            pageList: payload.pageList,
            currentPageIndex: payload.currentPageIndex,
            canvasWidth: payload.canvasWidth,
            canvasHeight: payload.canvasHeight,
            extraConfig,
          },
          $inc: { version: 1 },
        },
        { new: true },
      )
    : await BiDashboardModel.create({
        dashboardId: normalizedDashboardId,
        userId: userObjectId,
        name: payload.dashboardName,
        pageNames: payload.pageNames,
        pageList: payload.pageList,
        currentPageIndex: payload.currentPageIndex,
        canvasWidth: payload.canvasWidth,
        canvasHeight: payload.canvasHeight,
        extraConfig,
        version: 1,
        isTemplate: false,
        isPublish: false,
      })

  if (!dashboard) {
    throw new Error('Failed to save dashboard')
  }

  const cardIds = Object.keys(payload.cardMap)

  if (cardIds.length > 0) {
    await Promise.all(
      cardIds.map((componentKey) =>
        BiComponentModel.findOneAndUpdate(
          { dashboardId: normalizedDashboardId, componentKey },
          {
            $set: {
              userId: userObjectId,
              dashboardId: normalizedDashboardId,
              chartConfig: { card: payload.cardMap[componentKey] },
              isHide: hiddenCardIds.has(componentKey),
              isLock: false,
            },
          },
          { upsert: true, new: true },
        ),
      ),
    )
  }

  await BiComponentModel.deleteMany({
    dashboardId: normalizedDashboardId,
    componentKey: { $nin: cardIds },
  })

  return {
    dashboardId: dashboard.dashboardId,
    version: dashboard.version,
    componentCount: cardIds.length,
  }
}

export async function getDashboard(dashboardId: string) {
  const normalizedDashboardId = assertDashboardId(dashboardId)
  const dashboard = await BiDashboardModel.findOne({ dashboardId: normalizedDashboardId })

  if (!dashboard) {
    return null
  }

  const components = await BiComponentModel.find({ dashboardId: normalizedDashboardId })

  return { dashboard, components }
}

export async function listDashboards(): Promise<DashboardListItem[]> {
  const dashboards = await BiDashboardModel.aggregate([
    { $sort: { updatedAt: -1 } },
    {
      $project: {
        dashboardId: 1,
        name: 1,
        canvasWidth: 1,
        canvasHeight: 1,
        version: 1,
        createdAt: 1,
        updatedAt: 1,
        pageCount: { $size: { $ifNull: ['$pageList', []] } },
        componentCount: {
          $sum: {
            $map: {
              input: { $ifNull: ['$pageList', []] },
              as: 'page',
              in: { $size: { $ifNull: ['$$page', []] } },
            },
          },
        },
      },
    },
  ])

  return dashboards.map((dashboard) => ({
    dashboardId: dashboard.dashboardId,
    name: dashboard.name,
    pageCount: dashboard.pageCount ?? 0,
    componentCount: dashboard.componentCount ?? 0,
    canvasWidth: dashboard.canvasWidth,
    canvasHeight: dashboard.canvasHeight,
    version: dashboard.version,
    updatedAt: dashboard.updatedAt?.toISOString?.() ?? '',
    createdAt: dashboard.createdAt?.toISOString?.() ?? '',
  }))
}
