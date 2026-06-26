import mongoose, { Schema, type InferSchemaType } from 'mongoose'

import { COLLECTIONS } from '../constants'

const biUserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    avatar: { type: String },
    role: {
      type: String,
      enum: ['admin', 'editor', 'viewer'],
      required: true,
    },
  },
  {
    timestamps: true,
    collection: COLLECTIONS.BI_USER,
  },
)

biUserSchema.index({ role: 1 })

export type BiUserDocument = InferSchemaType<typeof biUserSchema> & {
  _id: mongoose.Types.ObjectId
}

export const BiUserModel = mongoose.model('BiUser', biUserSchema)
