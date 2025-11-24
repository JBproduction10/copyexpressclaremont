//hooks
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';

export const useCategoryManager = (initialCategories: any[], onNotify: (msg: string, type?: any) => void) => {
  const [categories, setCategories] = useState(initialCategories);
  const [editingItem, setEditingItem] = useState<string | null>(null);

  const addCategory = () => {
    const newCategory = {
      id: `cat-${Date.now()}`,
      name: 'New Category',
      description: 'Category description',
      subcategories: []
    };
    setCategories([...categories, newCategory]);
    onNotify('Category added successfully');
  };

  const updateCategory = (id: string, updates: any) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, ...updates } : cat
    ));
    onNotify('Category updated successfully');
  };

  const deleteCategory = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter(cat => cat.id !== id));
      onNotify('Category deleted successfully');
    }
  };

  const addSubcategory = (categoryId: string) => {
    const newSubcategory = {
      id: `sub-${Date.now()}`,
      name: 'New Subcategory',
      type: 'table',
      columns: [{ key: 'col1', label: 'Column 1' }],
      data: []
    };
    
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, subcategories: [...cat.subcategories, newSubcategory] }
        : cat
    ));
    onNotify('Subcategory added successfully');
  };

  const updateSubcategory = (categoryId: string, subId: string, updates: any) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId
        ? {
            ...cat,
            subcategories: cat.subcategories.map((sub: any) =>
              sub.id === subId ? { ...sub, ...updates } : sub
            )
          }
        : cat
    ));
    onNotify('Subcategory updated successfully');
  };

  const deleteSubcategory = (categoryId: string, subId: string) => {
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      setCategories(categories.map(cat => 
        cat.id === categoryId
          ? {
              ...cat,
              subcategories: cat.subcategories.filter((sub: any) => sub.id !== subId)
            }
          : cat
      ));
      onNotify('Subcategory deleted successfully');
    }
  };

  return {
    categories,
    editingItem,
    setEditingItem,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory
  };
};