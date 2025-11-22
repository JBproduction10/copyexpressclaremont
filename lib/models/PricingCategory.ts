import mongoose, {Schema, Document, Model} from "mongoose";
import type { PricingRow, ColumnDefinition, ImagePage, SubCategory, Category } from "@/types";


// SubCategory Schema
const ImagePageSchema = new Schema<ImagePage>({
    pageNumber: {type: Number, required: true},
    imagePath: {type: String, required: true},
    alt: {type: String, required: true}
});

const ColumnDefinitionSchema = new Schema<ColumnDefinition>({
    key: {type: String, required: true},
    label: {type: String, required: true},
    sublabel: {type: String},
});

const SubCategorySchema = new Schema<SubCategory>({
    id: {type: String, required: true},
    name: {type: String, required: true},
    description: {type: String},
    type: {type: String, enum: ['table', 'image-gallery']},
    data: {type: Schema.Types.Mixed},
    columns: [ColumnDefinitionSchema],
    images: [ImagePageSchema],
    additionalNotes: {type: Schema.Types.Mixed},
});

// Category Document Interface
export interface ICategoryDocument extends Document{
    id: string;
    name: string;
    description: string;
    subcategories: SubCategory[];
    createdAt: Date;
    updatedAt: Date;
}

// Category Schema
const CategorySchema = new Schema<ICategoryDocument>(
    {
        id: {type: String, required: true, unique: true},
        name: {type: String, required: true},
        description: {type: String, required: true},
        subcategories: [SubCategorySchema],
    },
    {
        timestamps: true,
    }
);

// Create or reuse model
const PricingCategory: Model<ICategoryDocument>=
    mongoose.models.PricingCategory || mongoose.model<ICategoryDocument>(
        'PricingCategory', CategorySchema
    );

    export default PricingCategory;


