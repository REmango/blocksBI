import mongoose, { Schema, type InferSchemaType } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

import { COLLECTIONS } from '../constants'

const agentSessionSchema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      default: uuidv4,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'BiUser', required: true, index: true },
    dashboardId: { type: String, required: true, index: true },
    sessionTitle: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    collection: COLLECTIONS.AGENT_SESSION,
  },
)

agentSessionSchema.index({ userId: 1, updatedAt: -1 })
agentSessionSchema.index({ dashboardId: 1, updatedAt: -1 })
agentSessionSchema.index({ userId: 1, status: 1, updatedAt: -1 })

export type AgentSessionDocument = InferSchemaType<typeof agentSessionSchema> & {
  _id: mongoose.Types.ObjectId
}

export const AgentSessionModel = mongoose.model('AgentSession', agentSessionSchema)
