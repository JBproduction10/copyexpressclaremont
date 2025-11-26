// types/index.ts

export interface PricingRow {
  qty?: string;
  discount?: string;
  service?: string;
  [key: string]: string | undefined;
}

export interface ColumnDefinition {
  key: string;
  label: string;
  sublabel?: string;
}

export interface ImagePage {
  [x: string]: string;
  pageNumber: number;
  imagePath: string;
  alt: string;
}

export interface SubCategory {
  id: string;
  name: string;
  description?: string;
  type?: 'table' | 'image-gallery';
  // For table-based subcategories
  data?: PricingRow[];
  columns?: ColumnDefinition[];
  // For image-based subcategories
  images?: ImagePage[];
  // Common
  additionalNotes?: string[] | string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  subcategories: SubCategory[];
}

export interface PricingData {
  categories: Category[];
}