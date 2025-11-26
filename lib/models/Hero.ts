// lib/models/Hero.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHero extends Document {
  title: string;
  highlightedText: string;
  subtitle: string;
  primaryButtonText: string;
  primaryButtonAction: string;
  secondaryButtonText: string;
  secondaryButtonAction: string;
  backgroundImage: string;
  backgroundImagePublicId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HeroSchema = new Schema<IHero>({
  title: {
    type: String,
    required: true,
    default: 'CopyExpress'
  },
  highlightedText: {
    type: String,
    required: true,
    default: 'Claremont'
  },
  subtitle: {
    type: String,
    required: true,
    default: 'Your One-Stop Print Shop for Everything from Lamination to Custom Apparel'
  },
  primaryButtonText: {
    type: String,
    default: 'Get a Quote'
  },
  primaryButtonAction: {
    type: String,
    default: 'contact'
  },
  secondaryButtonText: {
    type: String,
    default: 'Our Services'
  },
  secondaryButtonAction: {
    type: String,
    default: 'services'
  },
  backgroundImage: {
    type: String,
    default: '/copyexpresshero.jpeg'
  },
  backgroundImagePublicId: {
    type: String,
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Hero: Model<IHero> = 
  mongoose.models.Hero || mongoose.model<IHero>('Hero', HeroSchema);

export default Hero;