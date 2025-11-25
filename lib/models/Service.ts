// lib/models/Service.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IService extends Document {
  id: string;
  icon: string;
  title: string;
  description: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    icon: {
      type: String,
      required: true,
      default: "Printer",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for sorting and filtering
ServiceSchema.index({ order: 1, createdAt: -1 });
ServiceSchema.index({ isActive: 1 });

const Service: Model<IService> =
  mongoose.models.Service || mongoose.model<IService>("Service", ServiceSchema);

export default Service;