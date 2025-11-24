/* eslint-disable @typescript-eslint/no-explicit-any */
//components/admin
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, X } from 'lucide-react';

interface CategoryListProps {
  categories: any[];
  editingItem: string | null;
  onEdit: (id: string) => void;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
  onAddSubcategory: (categoryId: string) => void;
  onEditSubcategory: (categoryId: string, subId: string) => void;
  onDeleteSubcategory: (categoryId: string, subId: string) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  editingItem,
  onEdit,
  onUpdate,
  onDelete,
  onAddSubcategory,
  onEditSubcategory,
  onDeleteSubcategory
}) => {
  return (
    <div className="grid gap-6">
      {categories.map((category) => (
        <Card key={category.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {editingItem === category.id ? (
                  <div className="space-y-3">
                    <Input
                      value={category.name}
                      onChange={(e) => onUpdate(category.id, { name: e.target.value })}
                      placeholder="Category Name"
                    />
                    <Textarea
                      value={category.description}
                      onChange={(e) => onUpdate(category.id, { description: e.target.value })}
                      placeholder="Category Description"
                      rows={2}
                    />
                  </div>
                ) : (
                  <>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(category.id)}
                >
                  {editingItem === category.id ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(category.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-sm">
                  Subcategories ({category.subcategories.length})
                </h4>
                <Button size="sm" variant="outline" onClick={() => onAddSubcategory(category.id)}>
                  <Plus className="w-3 h-3 mr-1" />
                  Add Subcategory
                </Button>
              </div>
              {category.subcategories.length > 0 && (
                <div className="grid gap-2">
                  {category.subcategories.map((sub: any) => (
                    <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-sm">{sub.name}</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEditSubcategory(category.id, sub.id)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteSubcategory(category.id, sub.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};