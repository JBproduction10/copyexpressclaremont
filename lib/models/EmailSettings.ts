// lib/models/EmailSettings.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmailSettings extends Document {
  // SMTP Configuration
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPassword: string;
  
  // Email Addresses
  fromEmail: string;
  fromName: string;
  replyToEmail: string;
  adminEmail: string; // Where to receive contact form submissions
  
  // Email Templates
  customerSubject: string;
  adminSubject: string;
  
  // Settings
  isActive: boolean;
  testMode: boolean; // For testing without sending real emails
  
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy?: string;
}

const EmailSettingsSchema = new Schema<IEmailSettings>({
  smtpHost: {
    type: String,
    required: true,
    default: 'smtp.gmail.com'
  },
  smtpPort: {
    type: Number,
    required: true,
    default: 587
  },
  smtpSecure: {
    type: Boolean,
    default: false
  },
  smtpUser: {
    type: String,
    required: true
  },
  smtpPassword: {
    type: String,
    required: true
  },
  fromEmail: {
    type: String,
    required: true
  },
  fromName: {
    type: String,
    required: true,
    default: 'CopyExpress Claremont'
  },
  replyToEmail: {
    type: String,
    required: true
  },
  adminEmail: {
    type: String,
    required: true
  },
  customerSubject: {
    type: String,
    default: 'We received your quote request - CopyExpress Claremont'
  },
  adminSubject: {
    type: String,
    default: 'New Quote Request from {name}'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  testMode: {
    type: Boolean,
    default: false
  },
  lastModifiedBy: String
}, {
  timestamps: true
});

// Ensure only one settings document exists
EmailSettingsSchema.index({ isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

const EmailSettings: Model<IEmailSettings> = 
  mongoose.models.EmailSettings || mongoose.model<IEmailSettings>('EmailSettings', EmailSettingsSchema);

export default EmailSettings;