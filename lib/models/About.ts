import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFeature {
  id: string;
  text: string;
  order: number;
}

export interface IAbout extends Document {
  title: string;
  subtitle: string;
  highlightedText: string;
  mainDescription: string;
  features: IFeature[];
  statisticNumber: string;
  statisticLabel: string;
  statisticSubtext: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FeatureSchema = new Schema<IFeature>({
  id: { type: String, required: true },
  text: { type: String, required: true },
  order: { type: Number, default: 0 }
}, { _id: false });

const AboutSchema = new Schema<IAbout>({
  title: {
    type: String,
    required: true,
    default: 'Why Choose'
  },
  subtitle: {
    type: String,
    required: true,
    default: 'CopyExpress Claremont?'
  },
  highlightedText: {
    type: String,
    required: true,
    default: 'CopyExpress Claremont'
  },
  mainDescription: {
    type: String,
    required: true
  },
  features: [FeatureSchema],
  statisticNumber: {
    type: String,
    default: '35+'
  },
  statisticLabel: {
    type: String,
    default: 'Years'
  },
  statisticSubtext: {
    type: String,
    default: 'Of Excellence'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const About: Model<IAbout> = 
  mongoose.models.About || mongoose.model<IAbout>('About', AboutSchema);

export default About;