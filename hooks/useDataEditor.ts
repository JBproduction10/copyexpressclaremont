/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useRef } from 'react';

export const useDataEditor = (
  categories: any[],
  updateSubcategory: (catId: string, subId: string, updates: any) => Promise<void>,
  onNotify: (msg: string) => void
) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [localData, setLocalData] = useState<any>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<any>(null);

  // Debounced save function
  const debouncedSave = useCallback(
    (categoryId: string, subId: string, updates: any) => {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Merge with pending updates
      pendingUpdatesRef.current = {
        ...pendingUpdatesRef.current,
        ...updates
      };

      // Set new timeout
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await updateSubcategory(categoryId, subId, pendingUpdatesRef.current);
          pendingUpdatesRef.current = null;
          onNotify('Changes saved');
        } catch (error) {
          console.error('Error saving:', error);
          onNotify('Failed to save changes');
        }
      }, 1000); // Wait 1 second after last change
    },
    [updateSubcategory, onNotify]
  );

  // Get current subcategory data
  const getCurrentSubcategory = useCallback(() => {
    if (!selectedCategory || !selectedSubcategory) return null;
    
    const category = categories.find(c => c.id === selectedCategory);
    return category?.subcategories.find((s: any) => s.id === selectedSubcategory);
  }, [categories, selectedCategory, selectedSubcategory]);

  const addDataRow = async () => {
    if (!selectedCategory || !selectedSubcategory) return;

    const subcategory = getCurrentSubcategory();
    if (!subcategory) return;

    const newRow: any = { qty: '1-5' };
    subcategory.columns?.forEach((col: any) => {
      newRow[col.key] = 'R0.0';
    });

    const newData = [...(subcategory.data || []), newRow];
    
    // Optimistic update
    setLocalData(newData);

    try {
      await updateSubcategory(selectedCategory, selectedSubcategory, { data: newData });
      onNotify('Row added successfully');
    } catch (error) {
      console.error('Error adding row:', error);
      setLocalData(null);
      onNotify('Failed to add row');
    }
  };

  const updateDataRow = (rowIndex: number, updates: any) => {
    if (!selectedCategory || !selectedSubcategory) return;

    const subcategory = getCurrentSubcategory();
    if (!subcategory) return;

    const currentData = localData || subcategory.data || [];
    const newData = [...currentData];
    newData[rowIndex] = { ...newData[rowIndex], ...updates };

    // Immediate local update
    setLocalData(newData);

    // Debounced save
    debouncedSave(selectedCategory, selectedSubcategory, { data: newData });
  };

  const deleteDataRow = async (rowIndex: number) => {
    if (!selectedCategory || !selectedSubcategory) return;
    if (!window.confirm('Are you sure you want to delete this row?')) return;

    const subcategory = getCurrentSubcategory();
    if (!subcategory) return;

    const newData = (localData || subcategory.data || []).filter((_: any, i: number) => i !== rowIndex);
    
    // Clear pending saves
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    pendingUpdatesRef.current = null;

    // Optimistic update
    setLocalData(newData);

    try {
      await updateSubcategory(selectedCategory, selectedSubcategory, { data: newData });
      onNotify('Row deleted successfully');
    } catch (error) {
      console.error('Error deleting row:', error);
      setLocalData(null);
      onNotify('Failed to delete row');
    }
  };

  const addColumn = async (columnData: { key: string; label: string; sublabel?: string }) => {
    if (!selectedCategory || !selectedSubcategory) return;

    const subcategory = getCurrentSubcategory();
    if (!subcategory) return;

    const newColumns = [...(subcategory.columns || []), columnData];
    const newData = (localData || subcategory.data || []).map((row: any) => ({
      ...row,
      [columnData.key]: 'R0.0'
    }));

    // Clear pending saves
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    pendingUpdatesRef.current = null;

    try {
      await updateSubcategory(selectedCategory, selectedSubcategory, {
        columns: newColumns,
        data: newData
      });
      setLocalData(newData);
      onNotify('Column added successfully');
    } catch (error) {
      console.error('Error adding column:', error);
      onNotify('Failed to add column');
    }
  };

  const updateColumn = async (columnIndex: number, updates: { key: string; label: string; sublabel?: string }) => {
    if (!selectedCategory || !selectedSubcategory) return;

    const subcategory = getCurrentSubcategory();
    if (!subcategory || !subcategory.columns) return;

    const oldKey = subcategory.columns[columnIndex].key;
    const newKey = updates.key;

    const newColumns = [...subcategory.columns];
    newColumns[columnIndex] = updates;

    let newData = localData || subcategory.data || [];
    if (oldKey !== newKey) {
      newData = newData.map((row: any) => {
        const { [oldKey]: oldValue, ...rest } = row;
        return {
          ...rest,
          [newKey]: oldValue || 'R0.0'
        };
      });
    }

    // Clear pending saves
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    pendingUpdatesRef.current = null;

    try {
      await updateSubcategory(selectedCategory, selectedSubcategory, {
        columns: newColumns,
        data: newData
      });
      setLocalData(newData);
      onNotify('Column updated successfully');
    } catch (error) {
      console.error('Error updating column:', error);
      onNotify('Failed to update column');
    }
  };

  const deleteColumn = async (columnIndex: number) => {
    if (!selectedCategory || !selectedSubcategory) return;
    if (!window.confirm('Are you sure you want to delete this column? This will remove all data in this column.')) return;

    const subcategory = getCurrentSubcategory();
    if (!subcategory || !subcategory.columns) return;

    const columnKey = subcategory.columns[columnIndex].key;
    const newColumns = subcategory.columns.filter((_: any, i: number) => i !== columnIndex);
    const newData = (localData || subcategory.data || []).map((row: any) => {
      const { [columnKey]: removed, ...rest } = row;
      return rest;
    });

    // Clear pending saves
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    pendingUpdatesRef.current = null;

    try {
      await updateSubcategory(selectedCategory, selectedSubcategory, {
        columns: newColumns,
        data: newData
      });
      setLocalData(newData);
      onNotify('Column deleted successfully');
    } catch (error) {
      console.error('Error deleting column:', error);
      onNotify('Failed to delete column');
    }
  };

  // Reset local data when selection changes
  const handleCategoryChange = (categoryId: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    pendingUpdatesRef.current = null;
    setLocalData(null);
    setSelectedCategory(categoryId);
  };

  const handleSubcategoryChange = (subId: string | null) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    pendingUpdatesRef.current = null;
    setLocalData(null);
    setSelectedSubcategory(subId);
  };

  return {
    selectedCategory,
    selectedSubcategory,
    setSelectedCategory: handleCategoryChange,
    setSelectedSubcategory: handleSubcategoryChange,
    localData,
    addDataRow,
    updateDataRow,
    deleteDataRow,
    addColumn,
    updateColumn,
    deleteColumn
  };
};