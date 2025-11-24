//components/admin
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';

interface ImportExportProps {
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ImportExport: React.FC<ImportExportProps> = ({ onExport, onImport }) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>Download your pricing data as JSON</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Export all categories, subcategories, and pricing data to a JSON file. 
            This file can be used as a backup or imported later.
          </p>
          <Button onClick={onExport} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Export All Data
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import Data</CardTitle>
          <CardDescription>Upload a JSON file to import pricing data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Import pricing data from a previously exported JSON file. 
            This will replace all current data.
          </p>
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
            onClick={() => document.getElementById('import-file-2')?.click()}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm font-medium">Click to upload</p>
            <p className="text-xs text-gray-500 mt-1">JSON files only</p>
          </div>
          <input
            id="import-file-2"
            type="file"
            accept=".json"
            onChange={onImport}
            className="hidden"
          />
        </CardContent>
      </Card>
    </div>
  );
};