import mongoose, { Schema, type InferSchemaType } from 'mongoose'

import { COLLECTIONS } from '../constants'

const cardLayoutSchema = new Schema(
  {
    id: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  { _id: false },
)

const biDashboardSchema = new Schema(
  {
    dashboardId: { type: String, required: true, unique: true, trim: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'BiUser', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    pageNames: { type: [String], default: [] },
    pageList: { type: [[cardLayoutSchema]], default: [] },
    currentPageIndex: { type: Number, default: 0 },
    canvasWidth: { type: Number, required: true },
    canvasHeight: { type: Number, required: true },
    isTemplate: { type: Boolean, default: false },
    isPublish: { type: Boolean, default: false },
    snapshot: { type: String },
    version: { type: Number, default: 1 },
    extraConfig: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    collection: COLLECTIONS.BI_DASHBOARD,
  },
)

biDashboardSchema.index({ userId: 1, updatedAt: -1 })
biDashboardSchema.index({ isPublish: 1 }, { sparse: true })
biDashboardSchema.index({ isTemplate: 1 }, { sparse: true })

export type BiDashboardDocument = InferSchemaType<typeof biDashboardSchema> & {
  _id: mongoose.Types.ObjectId
}

export const BiDashboardModel = mongoose.model('BiDashboard', biDashboardSchema)
