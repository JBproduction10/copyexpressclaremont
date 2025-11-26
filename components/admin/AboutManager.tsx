//components/admin
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Save, X, GripVertical, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AboutManagerProps {
  about: any;
  onUpdate: (updates: any) => Promise<void>;
  onAddFeature: (feature: { text: string }) => Promise<void>;
  onUpdateFeature: (featureId: string, text: string) => Promise<void>;
  onDeleteFeature: (featureId: string) => Promise<void>;
  onReorderFeatures: (featureIds: string[]) => Promise<void>;
}

export const AboutManager: React.FC<AboutManagerProps> = ({
  about,
  onUpdate,
  onAddFeature,
  onUpdateFeature,
  onDeleteFeature,
  onReorderFeatures
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    subtitle: '',
    highlightedText: '',
    mainDescription: '',
    statisticNumber: '',
    statisticLabel: '',
    statisticSubtext: '',
    isActive: true
  });
  const [newFeature, setNewFeature] = useState('');
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);
  const [editingFeatureText, setEditingFeatureText] = useState('');
  const [draggedItem, setDraggedItem] = useState<any>(null);

  React.useEffect(() => {
    if (about) {
      setEditForm({
        title: about.title || '',
        subtitle: about.subtitle || '',
        highlightedText: about.highlightedText || '',
        mainDescription: about.mainDescription || '',
        statisticNumber: about.statisticNumber || '',
        statisticLabel: about.statisticLabel || '',
        statisticSubtext: about.statisticSubtext || '',
        isActive: about.isActive ?? true
      });
    }
  }, [about]);

  const handleSaveMain = async () => {
    await onUpdate(editForm);
    setIsEditing(false);
  };

  const handleAddFeature = async () => {
    if (!newFeature.trim()) return;
    await onAddFeature({ text: newFeature });
    setNewFeature('');
  };

  const handleSaveFeature = async (featureId: string) => {
    if (!editingFeatureText.trim()) return;
    await onUpdateFeature(featureId, editingFeatureText);
    setEditingFeatureId(null);
    setEditingFeatureText('');
  };

  const handleDragStart = (e: React.DragEvent, feature: any) => {
    setDraggedItem(feature);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetFeature: any) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.id === targetFeature.id) return;

    const features = [...(about.features || [])];
    const oldIndex = features.findIndex(f => f.id === draggedItem.id);
    const newIndex = features.findIndex(f => f.id === targetFeature.id);

    features.splice(oldIndex, 1);
    features.splice(newIndex, 0, draggedItem);

    const featureIds = features.map(f => f.id);
    await onReorderFeatures(featureIds);
    setDraggedItem(null);
  };

  if (!about) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">About Section</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your About Us content</p>
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

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Main Content</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        {/* Main Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Main Content</CardTitle>
                  <CardDescription>Edit the main about section content</CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSaveMain}>
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
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="Why Choose"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtitle</Label>
                    <Input
                      value={editForm.subtitle}
                      onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                      placeholder="CopyExpress Claremont?"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Highlighted Text (for subtitle)</Label>
                    <Input
                      value={editForm.highlightedText}
                      onChange={(e) => setEditForm({ ...editForm, highlightedText: e.target.value })}
                      placeholder="CopyExpress Claremont"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Main Description</Label>
                    <Textarea
                      value={editForm.mainDescription}
                      onChange={(e) => setEditForm({ ...editForm, mainDescription: e.target.value })}
                      placeholder="Your main description..."
                      rows={4}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        {about.title} <span className="text-primary">{about.highlightedText}</span>
                      </h3>
                      <p className="text-gray-600">{about.mainDescription}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Features List</CardTitle>
              <CardDescription>Drag to reorder • Total: {about.features?.length || 0} features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Feature */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add new feature..."
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                />
                <Button onClick={handleAddFeature} disabled={!newFeature.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              {/* Features List */}
              <div className="space-y-2">
                {about.features?.map((feature: any) => (
                  <div
                    key={feature.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, feature)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, feature)}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border hover:border-primary transition-all cursor-move"
                  >
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                    
                    {editingFeatureId === feature.id ? (
                      <div className="flex-1 flex gap-2">
                        <Input
                          value={editingFeatureText}
                          onChange={(e) => setEditingFeatureText(e.target.value)}
                          className="flex-1"
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleSaveFeature(feature.id)}>
                          <Save className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingFeatureId(null);
                            setEditingFeatureText('');
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="flex-1 text-sm">{feature.text}</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingFeatureId(feature.id);
                              setEditingFeatureText(feature.text);
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (window.confirm('Delete this feature?')) {
                                onDeleteFeature(feature.id);
                              }
                            }}
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statistics Display</CardTitle>
              <CardDescription>Edit the statistics shown in the about section</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Number</Label>
                  <Input
                    value={editForm.statisticNumber}
                    onChange={(e) => setEditForm({ ...editForm, statisticNumber: e.target.value })}
                    placeholder="35+"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Label</Label>
                  <Input
                    value={editForm.statisticLabel}
                    onChange={(e) => setEditForm({ ...editForm, statisticLabel: e.target.value })}
                    placeholder="Years"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtext</Label>
                  <Input
                    value={editForm.statisticSubtext}
                    onChange={(e) => setEditForm({ ...editForm, statisticSubtext: e.target.value })}
                    placeholder="Of Excellence"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="mt-6 p-6 bg-linear-to-br from-primary to-accent rounded-2xl text-center text-white">
                <div className="text-6xl font-bold mb-4">{editForm.statisticNumber}</div>
                <div className="text-2xl mb-2">{editForm.statisticLabel}</div>
                <div className="text-lg opacity-90">{editForm.statisticSubtext}</div>
              </div>

              <Button onClick={() => onUpdate(editForm)} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Statistics
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};