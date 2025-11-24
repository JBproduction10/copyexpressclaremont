/* eslint-disable @typescript-eslint/no-explicit-any */
//lib/models
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId;
  username: string;
  email: string;
  action: string;
  targetType: 'category' | 'subcategory' | 'data' | 'user' | 'service' | 'about' | 'contact' | 'hero';
  targetId: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete', 'export', 'import', 'login', 'logout', 'register', 'reorder']
  },
  targetType: {
    type: String,
    required: true,
    enum: ['category', 'subcategory', 'data', 'user', 'service', 'about', 'contact', 'hero']
  },
  targetId: String,
  details: {
    type: Schema.Types.Mixed,
    default: {}
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Index for querying logs efficiently
ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ action: 1, createdAt: -1 });
ActivityLogSchema.index({ createdAt: -1 });

const ActivityLog =
  mongoose.models.ActivityLog ||
  mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);

export default ActivityLog;