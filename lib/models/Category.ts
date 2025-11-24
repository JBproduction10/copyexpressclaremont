//lib/models
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IColumn {
  key: string;
  label: string;
  sublabel?: string;
}

export interface IPricingRow {
  qty?: string;
  discount?: string;
  service?: string;
  [key: string]: string | undefined;
}

export interface IImagePage {
  pageNumber: number;
  imagePath: string;
  alt: string;
}

export interface ISubCategory extends Document {
  id: string;
  name: string;
  description?: string;
  type?: 'table' | 'image-gallery';
  data?: IPricingRow[];
  columns?: IColumn[];
  images?: IImagePage[];
  additionalNotes?: string[] | string;
}

export interface ICategory extends Document {
  id: string;
  name: string;
  description: string;
  subcategories: ISubCategory[];
  createdAt: Date;
  updatedAt: Date;
}

const ColumnSchema = new Schema<IColumn>({
  key: { type: String, required: true },
  label: { type: String, required: true },
  sublabel: String
}, { _id: false });

const PricingRowSchema = new Schema<IPricingRow>({}, { 
  strict: false,
  _id: false 
});

const ImagePageSchema = new Schema<IImagePage>({
  pageNumber: { type: Number, required: true },
  imagePath: { type: String, required: true },
  alt: { type: String, required: true }
}, { _id: false });

const SubCategorySchema = new Schema<ISubCategory>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  type: { 
    type: String, 
    enum: ['table', 'image-gallery'],
    default: 'table'
  },
  data: [PricingRowSchema],
  columns: [ColumnSchema],
  images: [ImagePageSchema],
  additionalNotes: Schema.Types.Mixed
}, { _id: false });

const CategorySchema = new Schema<ICategory>({
  id: { 
    type: String, 
    required: true,
    unique: true,
    index: true
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String,
    required: true,
    trim: true
  },
  subcategories: [SubCategorySchema]
}, {
  timestamps: true
});

// Add indexes for better query performance
CategorySchema.index({ 'subcategories.id': 1 });
CategorySchema.index({ createdAt: -1 });

const Category: Model<ICategory> = 
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;