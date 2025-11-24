//hooks
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';

export const useDataEditor = (
  categories: any[],
  updateSubcategory: (catId: string, subId: string, updates: any) => void,
  onNotify: (msg: string) => void
) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  const addDataRow = () => {
    if (!selectedCategory || !selectedSubcategory) return;

    const category = categories.find(c => c.id === selectedCategory);
    const subcategory = category?.subcategories.find((s: any) => s.id === selectedSubcategory);
    
    if (!subcategory) return;

    const newRow: any = { qty: '1-5' };
    subcategory.columns?.forEach((col: any) => {
      newRow[col.key] = 'R0.0';
    });

    updateSubcategory(selectedCategory, selectedSubcategory, {
      data: [...(subcategory.data || []), newRow]
    });
    onNotify('Row added successfully');
  };

  const updateDataRow = (rowIndex: number, updates: any) => {
    if (!selectedCategory || !selectedSubcategory) return;

    const category = categories.find(c => c.id === selectedCategory);
    const subcategory = category?.subcategories.find((s: any) => s.id === selectedSubcategory);
    
    if (!subcategory) return;

    const newData = [...(subcategory.data || [])];
    newData[rowIndex] = { ...newData[rowIndex], ...updates };

    updateSubcategory(selectedCategory, selectedSubcategory, { data: newData });
  };

  const deleteDataRow = (rowIndex: number) => {
    if (!selectedCategory || !selectedSubcategory) return;
    if (!window.confirm('Are you sure you want to delete this row?')) return;

    const category = categories.find(c => c.id === selectedCategory);
    const subcategory = category?.subcategories.find((s: any) => s.id === selectedSubcategory);
    
    if (!subcategory) return;

    const newData = subcategory.data.filter((_: any, i: number) => i !== rowIndex);
    updateSubcategory(selectedCategory, selectedSubcategory, { data: newData });
    onNotify('Row deleted successfully');
  };

  const addColumn = (columnData: { key: string; label: string; sublabel?: string }) => {
    if (!selectedCategory || !selectedSubcategory) return;

    const category = categories.find(c => c.id === selectedCategory);
    const subcategory = category?.subcategories.find((s: any) => s.id === selectedSubcategory);
    
    if (!subcategory) return;

    // Add column to columns array
    const newColumns = [...(subcategory.columns || []), columnData];

    // Add the new column key to all existing rows with default value
    const newData = (subcategory.data || []).map((row: any) => ({
      ...row,
      [columnData.key]: 'R0.0'
    }));

    updateSubcategory(selectedCategory, selectedSubcategory, {
      columns: newColumns,
      data: newData
    });
    onNotify('Column added successfully');
  };

  const updateColumn = (columnIndex: number, updates: { key: string; label: string; sublabel?: string }) => {
    if (!selectedCategory || !selectedSubcategory) return;

    const category = categories.find(c => c.id === selectedCategory);
    const subcategory = category?.subcategories.find((s: any) => s.id === selectedSubcategory);
    
    if (!subcategory || !subcategory.columns) return;

    const oldKey = subcategory.columns[columnIndex].key;
    const newKey = updates.key;

    // Update columns array
    const newColumns = [...subcategory.columns];
    newColumns[columnIndex] = updates;

    // If key changed, update all data rows
    let newData = subcategory.data || [];
    if (oldKey !== newKey) {
      newData = newData.map((row: any) => {
        const { [oldKey]: oldValue, ...rest } = row;
        return {
          ...rest,
          [newKey]: oldValue || 'R0.0'
        };
      });
    }

    updateSubcategory(selectedCategory, selectedSubcategory, {
      columns: newColumns,
      data: newData
    });
    onNotify('Column updated successfully');
  };

  const deleteColumn = (columnIndex: number) => {
    if (!selectedCategory || !selectedSubcategory) return;
    if (!window.confirm('Are you sure you want to delete this column? This will remove all data in this column.')) return;

    const category = categories.find(c => c.id === selectedCategory);
    const subcategory = category?.subcategories.find((s: any) => s.id === selectedSubcategory);
    
    if (!subcategory || !subcategory.columns) return;

    const columnKey = subcategory.columns[columnIndex].key;

    // Remove column from columns array
    const newColumns = subcategory.columns.filter((_: any, i: number) => i !== columnIndex);

    // Remove column data from all rows
    const newData = (subcategory.data || []).map((row: any) => {
      const { [columnKey]: removed, ...rest } = row;
      return rest;
    });

    updateSubcategory(selectedCategory, selectedSubcategory, {
      columns: newColumns,
      data: newData
    });
    onNotify('Column deleted successfully');
  };

  return {
    selectedCategory,
    selectedSubcategory,
    setSelectedCategory,
    setSelectedSubcategory,
    addDataRow,
    updateDataRow,
    deleteDataRow,
    addColumn,
    updateColumn,
    deleteColumn
  };
};