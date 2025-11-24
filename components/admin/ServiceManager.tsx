'use client';
//components/admin

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Save, X, GripVertical, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Available Lucide icons for services
const AVAILABLE_ICONS = [
  'Printer', 'Shield', 'Shirt', 'Coffee', 'Sticker', 'FileText', 
  'Scissors', 'Sparkles', 'Package', 'PenTool', 'Image', 'Palette',
  'Award', 'BookOpen', 'Camera', 'Gift', 'Layers', 'Layout',
  'Zap', 'Star', 'Heart', 'Bookmark', 'Tag', 'Briefcase'
];

interface ServiceManagerProps {
  services: any[];
  onUpdate: (id: string, updates: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onCreate: (service: any) => Promise<void>;
  onReorder: (serviceIds: string[]) => Promise<void>;
}

export const ServiceManager: React.FC<ServiceManagerProps> = ({
  services,
  onUpdate,
  onDelete,
  onCreate,
  onReorder
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'Printer',
    isActive: true
  });
  const [draggedItem, setDraggedItem] = useState<any>(null);

  const handleOpenDialog = (service?: any) => {
    if (service) {
      setIsEditing(true);
      setEditingId(service.id);
      setFormData({
        title: service.title,
        description: service.description,
        icon: service.icon,
        isActive: service.isActive
      });
    } else {
      setIsEditing(false);
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        icon: 'Printer',
        isActive: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      icon: 'Printer',
      isActive: true
    });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) return;

    try {
      if (isEditing && editingId) {
        await onUpdate(editingId, formData);
      } else {
        await onCreate({
          id: `service-${Date.now()}`,
          ...formData
        });
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleDragStart = (e: React.DragEvent, service: any) => {
    setDraggedItem(service);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetService: any) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.id === targetService.id) return;

    const oldIndex = services.findIndex(s => s.id === draggedItem.id);
    const newIndex = services.findIndex(s => s.id === targetService.id);

    const newServices = [...services];
    newServices.splice(oldIndex, 1);
    newServices.splice(newIndex, 0, draggedItem);

    const serviceIds = newServices.map(s => s.id);
    await onReorder(serviceIds);
    setDraggedItem(null);
  };

  const handleToggleActive = async (service: any) => {
    await onUpdate(service.id, { isActive: !service.isActive });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Manage Services</h2>
          <p className="text-sm text-gray-500 mt-1">
            Drag to reorder • Total: {services.length} services
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      <div className="grid gap-4">
        {services.map((service, index) => (
          <Card
            key={service.id}
            draggable
            onDragStart={(e) => handleDragStart(e, service)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, service)}
            className={`cursor-move transition-all ${
              !service.isActive ? 'opacity-50 bg-gray-50' : ''
            } hover:shadow-md`}
          >
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-500">#{index + 1}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">{service.icon === 'Printer' ? '🖨️' : '📦'}</span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                      <CardDescription className="mt-1">{service.description}</CardDescription>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleActive(service)}
                    title={service.isActive ? 'Hide service' : 'Show service'}
                  >
                    {service.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenDialog(service)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (window.confirm('Delete this service?')) {
                        onDelete(service.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the service information' : 'Create a new service for your website'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Service Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Digital Printing"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the service..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <select
                id="icon"
                className="w-full p-2 border rounded-lg"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              >
                {AVAILABLE_ICONS.map((icon) => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500">Select an icon for the service card</p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="active">
                Active (visible on website)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.title || !formData.description}
            >
              {isEditing ? 'Update Service' : 'Create Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};