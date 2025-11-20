// types/pricing.ts

export interface PricingRow {
  qty?: string;
  discount?: string;
  [key: string]: string;
  service?: string;
}

export interface ColumnDefinition {
  key: string;
  label: string;
  sublabel?: string;
}

export interface SubCategory {
  id: string;
  name: string;
  description?: string;
  data?: PricingRow[];
  columns?: ColumnDefinition[];
  additionalNotes?: string[] | string;
  type?: 'table' | 'image';  // Differentiate content types
  images?: string[]; 
}

export interface Category {
  id: string;
  name: string;
  description: string;
  subcategories: SubCategory[];
}

export interface PricingFile{
  categories: Category[];
}