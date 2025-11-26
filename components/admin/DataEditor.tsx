/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Columns, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ImageGalleryManager } from './ImageGalleryManager';

interface DataEditorProps {
  categories: any[];
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  onCategoryChange: (categoryId: string) => void;
  onSubcategoryChange: (subcategoryId: string) => void;
  onAddRow: () => void;
  onUpdateRow: (rowIndex: number, updates: any) => void;
  onDeleteRow: (rowIndex: number) => void;
  onAddColumn: (columnData: { key: string; label: string; sublabel?: string }) => void;
  onUpdateColumn: (columnIndex: number, updates: any) => void;
  onDeleteColumn: (columnIndex: number) => void;
  onUpdateSubcategory?: (categoryId: string, subId: string, updates: any) => Promise<void>;
  localData?: any;
}

export const DataEditor: React.FC<DataEditorProps> = ({
  categories,
  selectedCategory,
  selectedSubcategory,
  onCategoryChange,
  onSubcategoryChange,
  onAddRow,
  onUpdateRow,
  onDeleteRow,
  onAddColumn,
  onUpdateColumn,
  onDeleteColumn,
  onUpdateSubcategory,
  localData
}) => {
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
  const [isEditingColumn, setIsEditingColumn] = useState(false);
  const [editingColumnIndex, setEditingColumnIndex] = useState<number | null>(null);
  const [columnForm, setColumnForm] = useState({
    key: '',
    label: '',
    sublabel: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const category = categories.find(c => c.id === selectedCategory);
  const subcategory = category?.subcategories.find((s: any) => s.id === selectedSubcategory);
  
  // Use local data if available, otherwise use subcategory data
  const displayData = localData || subcategory?.data || [];

  const handleAddColumn = () => {
    if (!columnForm.key || !columnForm.label) return;
    
    onAddColumn({
      key: columnForm.key,
      label: columnForm.label,
      sublabel: columnForm.sublabel || undefined
    });
    
    setColumnForm({ key: '', label: '', sublabel: '' });
    setIsColumnDialogOpen(false);
  };

  const handleEditColumn = (index: number) => {
    const column = subcategory?.columns?.[index];
    if (!column) return;

    setIsEditingColumn(true);
    setEditingColumnIndex(index);
    setColumnForm({
      key: column.key,
      label: column.label,
      sublabel: column.sublabel || ''
    });
    setIsColumnDialogOpen(true);
  };

  const handleUpdateColumn = () => {
    if (editingColumnIndex === null || !columnForm.key || !columnForm.label) return;
    
    onUpdateColumn(editingColumnIndex, {
      key: columnForm.key,
      label: columnForm.label,
      sublabel: columnForm.sublabel || undefined
    });
    
    setColumnForm({ key: '', label: '', sublabel: '' });
    setIsColumnDialogOpen(false);
    setIsEditingColumn(false);
    setEditingColumnIndex(null);
  };

  const handleCloseDialog = () => {
    setColumnForm({ key: '', label: '', sublabel: '' });
    setIsColumnDialogOpen(false);
    setIsEditingColumn(false);
    setEditingColumnIndex(null);
  };

  const handleImageGalleryUpdate = async (categoryId: string, subId: string, updates: any) => {
    if (!selectedCategory) return;
    
    setIsSaving(true);
    try {
      if (onUpdateSubcategory) {
        await onUpdateSubcategory(categoryId, subId, updates);
      } else {
        const category = categories.find(c => c.id === categoryId);
        if (!category) return;

        const updatedSubs = category.subcategories.map((sub: any) =>
          sub.id === subId ? { ...sub, ...updates } : sub
        );

        const response = await fetch(`/api/categories/${categoryId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subcategories: updatedSubs }),
        });

        if (!response.ok) throw new Error('Failed to update');
        
        window.dispatchEvent(new CustomEvent('refetchCategories'));
      }
    } catch (error) {
      console.error('Error updating images:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Edit Pricing Data</CardTitle>
            <CardDescription>Select a category and subcategory to edit pricing information</CardDescription>
          </div>
          {localData && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Save className="w-4 h-4 animate-pulse" />
              <span>Auto-saving...</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <select
              className="w-full p-2 border rounded-lg"
              value={selectedCategory || ''}
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Subcategory</label>
            <select
              className="w-full p-2 border rounded-lg"
              value={selectedSubcategory || ''}
              onChange={(e) => onSubcategoryChange(e.target.value)}
              disabled={!selectedCategory}
            >
              <option value="">Select a subcategory</option>
              {category?.subcategories.map((sub: any) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} {sub.type === 'image-gallery' ? '(Image Gallery)' : '(Table)'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {subcategory && (
          <div className="space-y-4">
            {subcategory.type === 'image-gallery' ? (
              <ImageGalleryManager
                categoryId={selectedCategory!}
                subcategoryId={selectedSubcategory!}
                images={subcategory.images || []}
                subcategoryName={subcategory.name}
                onUpdate={handleImageGalleryUpdate}
              />
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{subcategory.name}</h3>
                  <div className="flex gap-2">
                    <Dialog open={isColumnDialogOpen} onOpenChange={setIsColumnDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => {
                          setIsEditingColumn(false);
                          setColumnForm({ key: '', label: '', sublabel: '' });
                        }}>
                          <Columns className="w-4 h-4 mr-2" />
                          Add Column
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{isEditingColumn ? 'Edit Column' : 'Add New Column'}</DialogTitle>
                          <DialogDescription>
                            {isEditingColumn ? 'Update the column configuration' : 'Configure a new column for the pricing table'}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="column-key">Column Key *</Label>
                            <Input
                              id="column-key"
                              placeholder="e.g., 80_SS or price_tier_1"
                              value={columnForm.key}
                              onChange={(e) => setColumnForm({ ...columnForm, key: e.target.value.replace(/\s/g, '_') })}
                            />
                            <p className="text-xs text-gray-500">Unique identifier (no spaces)</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="column-label">Column Label *</Label>
                            <Input
                              id="column-label"
                              placeholder="e.g., 80 GSM or Standard Price"
                              value={columnForm.label}
                              onChange={(e) => setColumnForm({ ...columnForm, label: e.target.value })}
                            />
                            <p className="text-xs text-gray-500">Main column header text</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="column-sublabel">Sublabel (Optional)</Label>
                            <Input
                              id="column-sublabel"
                              placeholder="e.g., S/S or per unit"
                              value={columnForm.sublabel}
                              onChange={(e) => setColumnForm({ ...columnForm, sublabel: e.target.value })}
                            />
                            <p className="text-xs text-gray-500">Additional text below the label</p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={handleCloseDialog}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={isEditingColumn ? handleUpdateColumn : handleAddColumn}
                            disabled={!columnForm.key || !columnForm.label}
                          >
                            {isEditingColumn ? 'Update Column' : 'Add Column'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" onClick={onAddRow}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Row
                    </Button>
                  </div>
                </div>
                
                {subcategory.columns && subcategory.columns.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2">Columns ({subcategory.columns.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {subcategory.columns.map((col: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg border">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{col.label}</span>
                            {col.sublabel && <span className="text-xs text-gray-500">{col.sublabel}</span>}
                            <span className="text-xs text-gray-400">key: {col.key}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => handleEditColumn(index)}
                            >
                              <span className="text-xs">✏️</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => onDeleteColumn(index)}
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 p-2 text-left text-sm font-semibold">Qty</th>
                        {subcategory.columns?.map((col: any) => (
                          <th key={col.key} className="border border-gray-200 p-2 text-center text-sm font-semibold">
                            <div>{col.label}</div>
                            {col.sublabel && <div className="text-xs font-normal text-gray-500">{col.sublabel}</div>}
                          </th>
                        ))}
                        <th className="border border-gray-200 p-2 text-center text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayData.map((row: any, rowIndex: number) => (
                        <tr key={rowIndex} className="hover:bg-gray-50">
                          <td className="border border-gray-200 p-2">
                            <Input
                              value={row.qty}
                              onChange={(e) => onUpdateRow(rowIndex, { qty: e.target.value })}
                              className="h-8"
                            />
                          </td>
                          {subcategory.columns?.map((col: any) => (
                            <td key={col.key} className="border border-gray-200 p-2">
                              <Input
                                value={row[col.key] || ''}
                                onChange={(e) => onUpdateRow(rowIndex, { [col.key]: e.target.value })}
                                className="h-8 text-center"
                              />
                            </td>
                          ))}
                          <td className="border border-gray-200 p-2 text-center">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => onDeleteRow(rowIndex)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};