//components/admin
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload, Edit } from 'lucide-react';

interface QuickActionsProps {
  onAddCategory: () => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEditPrices: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onAddCategory,
  onExport,
  onImport,
  onEditPrices
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common administrative tasks</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button onClick={onAddCategory} className="h-20 flex-col gap-2">
          <Plus className="w-5 h-5" />
          Add Category
        </Button>
        <Button onClick={onExport} variant="outline" className="h-20 flex-col gap-2">
          <Download className="w-5 h-5" />
          Export Data
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex-col gap-2" 
          onClick={() => document.getElementById('import-file')?.click()}
        >
          <Upload className="w-5 h-5" />
          Import Data
        </Button>
        <input
          id="import-file"
          type="file"
          accept=".json"
          onChange={onImport}
          className="hidden"
        />
        <Button variant="outline" className="h-20 flex-col gap-2" onClick={onEditPrices}>
          <Edit className="w-5 h-5" />
          Edit Prices
        </Button>
      </CardContent>
    </Card>
  );
};