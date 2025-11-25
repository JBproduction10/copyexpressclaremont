// components/admin/HeroManager.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, X, Edit } from 'lucide-react';

interface HeroManagerProps {
  hero: any;
  onUpdate: (updates: any) => Promise<void>;
}

export const HeroManager: React.FC<HeroManagerProps> = ({ hero, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    highlightedText: '',
    subtitle: '',
    primaryButtonText: '',
    primaryButtonAction: '',
    secondaryButtonText: '',
    secondaryButtonAction: '',
    backgroundImage: '',
    isActive: true
  });

  React.useEffect(() => {
    if (hero) {
      setEditForm({
        title: hero.title || '',
        highlightedText: hero.highlightedText || '',
        subtitle: hero.subtitle || '',
        primaryButtonText: hero.primaryButtonText || '',
        primaryButtonAction: hero.primaryButtonAction || '',
        secondaryButtonText: hero.secondaryButtonText || '',
        secondaryButtonAction: hero.secondaryButtonAction || '',
        backgroundImage: hero.backgroundImage || '',
        isActive: hero.isActive ?? true
      });
    }
  }, [hero]);

  const handleSave = async () => {
    await onUpdate(editForm);
    setIsEditing(false);
  };

  if (!hero) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Hero Section</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your homepage hero section</p>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={editForm.isActive}
            onCheckedChange={(checked) => {
              setEditForm({ ...editForm, isActive: checked });
              onUpdate({ isActive: checked });
            }}
          />
          <Label>Active on Website</Label>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Hero Content</CardTitle>
              <CardDescription>Edit the hero section content and buttons</CardDescription>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Main Heading</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="CopyExpress"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Highlighted Text</Label>
                    <Input
                      value={editForm.highlightedText}
                      onChange={(e) => setEditForm({ ...editForm, highlightedText: e.target.value })}
                      placeholder="Claremont"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Textarea
                  value={editForm.subtitle}
                  onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                  placeholder="Your One-Stop Print Shop..."
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Primary Button</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Button Text</Label>
                    <Input
                      value={editForm.primaryButtonText}
                      onChange={(e) => setEditForm({ ...editForm, primaryButtonText: e.target.value })}
                      placeholder="Get a Quote"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Action (section ID)</Label>
                    <Input
                      value={editForm.primaryButtonAction}
                      onChange={(e) => setEditForm({ ...editForm, primaryButtonAction: e.target.value })}
                      placeholder="contact"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Secondary Button</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Button Text</Label>
                    <Input
                      value={editForm.secondaryButtonText}
                      onChange={(e) => setEditForm({ ...editForm, secondaryButtonText: e.target.value })}
                      placeholder="Our Services"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Action (section ID)</Label>
                    <Input
                      value={editForm.secondaryButtonAction}
                      onChange={(e) => setEditForm({ ...editForm, secondaryButtonAction: e.target.value })}
                      placeholder="services"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Background Image Path</Label>
                <Input
                  value={editForm.backgroundImage}
                  onChange={(e) => setEditForm({ ...editForm, backgroundImage: e.target.value })}
                  placeholder="/copyexpresshero.jpeg"
                />
                <p className="text-xs text-gray-500">Path to the background image in public folder</p>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Preview</h3>
                <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg text-white">
                  <h1 className="text-4xl font-bold mb-4">
                    {hero.title} <span className="text-primary">{hero.highlightedText}</span>
                  </h1>
                  <p className="text-lg mb-6">{hero.subtitle}</p>
                  <div className="flex gap-4">
                    <div className="px-6 py-3 bg-primary rounded text-white font-medium">
                      {hero.primaryButtonText}
                    </div>
                    <div className="px-6 py-3 border border-white rounded text-white font-medium">
                      {hero.secondaryButtonText}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Primary Action:</span> {hero.primaryButtonAction}
                </div>
                <div>
                  <span className="font-medium">Secondary Action:</span> {hero.secondaryButtonAction}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Background:</span> {hero.backgroundImage}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};