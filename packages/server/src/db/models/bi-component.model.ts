import mongoose, { Schema, type InferSchemaType } from 'mongoose'

import { COLLECTIONS } from '../constants'

const biComponentSchema = new Schema(
  {
    dashboardId: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'BiUser', required: true, index: true },
    componentKey: { type: String, required: true, trim: true },
    chartConfig: { type: Schema.Types.Mixed, default: {} },
    isLock: { type: Boolean, default: false },
    isHide: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: COLLECTIONS.BI_COMPONENT,
  },
)

biComponentSchema.index({ dashboardId: 1, componentKey: 1 }, { unique: true })

export type BiComponentDocument = InferSchemaType<typeof biComponentSchema> & {
  _id: mongoose.Types.ObjectId
}

export const BiComponentModel = mongoose.model('BiComponent', biComponentSchema)
