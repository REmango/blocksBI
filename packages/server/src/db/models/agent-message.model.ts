import mongoose, { Schema, type InferSchemaType } from 'mongoose'

import { COLLECTIONS } from '../constants'

const agentMessageSchema = new Schema(
  {
    sessionId: { type: String, required: true, index: true },
    role: {
      type: String,
      enum: ['user', 'assistant', 'tool'],
      required: true,
    },
    content: { type: String, required: true, default: '' },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: COLLECTIONS.AGENT_MESSAGE,
  },
)

agentMessageSchema.index({ sessionId: 1, createdAt: 1 })

export type AgentMessageDocument = InferSchemaType<typeof agentMessageSchema> & {
  _id: mongoose.Types.ObjectId
}

export const AgentMessageModel = mongoose.model('AgentMessage', agentMessageSchema)
