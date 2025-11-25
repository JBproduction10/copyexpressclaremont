// components/admin/ContactManager.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Save, X, GripVertical } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AVAILABLE_ICONS = [
  'MapPin', 'Phone', 'Mail', 'Clock', 'MessageCircle', 
  'Globe', 'Building', 'User', 'Calendar', 'FaWhatsapp'
];

interface ContactManagerProps {
  contact: any;
  onUpdate: (updates: any) => Promise<void>;
  onAddInfo: (info: { icon: string; title: string; details: string }) => Promise<void>;
  onUpdateInfo: (infoId: string, updates: any) => Promise<void>;
  onDeleteInfo: (infoId: string) => Promise<void>;
  onReorderInfo: (infoIds: string[]) => Promise<void>;
}

export const ContactManager: React.FC<ContactManagerProps> = ({
  contact,
  onUpdate,
  onAddInfo,
  onUpdateInfo,
  onDeleteInfo,
  onReorderInfo
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    isActive: true
  });
  const [newInfo, setNewInfo] = useState({ icon: 'MapPin', title: '', details: '' });
  const [editingInfoId, setEditingInfoId] = useState<string | null>(null);
  const [editingInfoData, setEditingInfoData] = useState({ icon: '', title: '', details: '' });
  const [draggedItem, setDraggedItem] = useState<any>(null);

  React.useEffect(() => {
    if (contact) {
      setEditForm({
        title: contact.title || '',
        subtitle: contact.subtitle || '',
        description: contact.description || '',
        isActive: contact.isActive ?? true
      });
    }
  }, [contact]);

  const handleSaveMain = async () => {
    await onUpdate(editForm);
    setIsEditing(false);
  };

  const handleAddInfo = async () => {
    if (!newInfo.title || !newInfo.details) return;
    await onAddInfo(newInfo);
    setNewInfo({ icon: 'MapPin', title: '', details: '' });
  };

  const handleSaveInfo = async (infoId: string) => {
    if (!editingInfoData.title || !editingInfoData.details) return;
    await onUpdateInfo(infoId, editingInfoData);
    setEditingInfoId(null);
    setEditingInfoData({ icon: '', title: '', details: '' });
  };

  const handleDragStart = (e: React.DragEvent, info: any) => {
    setDraggedItem(info);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetInfo: any) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.id === targetInfo.id) return;

    const items = [...(contact.contactInfo || [])];
    const oldIndex = items.findIndex(i => i.id === draggedItem.id);
    const newIndex = items.findIndex(i => i.id === targetInfo.id);

    items.splice(oldIndex, 1);
    items.splice(newIndex, 0, draggedItem);

    const infoIds = items.map(i => i.id);
    await onReorderInfo(infoIds);
    setDraggedItem(null);
  };

  if (!contact) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Contact Section</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your contact information</p>
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="content">Main Content</TabsTrigger>
          <TabsTrigger value="info">Contact Info</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Main Content</CardTitle>
                  <CardDescription>Edit the main contact section content</CardDescription>
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
                      placeholder="Get a Free Quote"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtitle</Label>
                    <Input
                      value={editForm.subtitle}
                      onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                      placeholder="Contact Information"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Your description..."
                      rows={4}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{contact.title}</h3>
                    <h4 className="text-md font-medium text-gray-600 mb-2">{contact.subtitle}</h4>
                    <p className="text-gray-600">{contact.description}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Drag to reorder • Total: {contact.contactInfo?.length || 0} items</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <select
                  className="p-2 border rounded-lg"
                  value={newInfo.icon}
                  onChange={(e) => setNewInfo({ ...newInfo, icon: e.target.value })}
                >
                  {AVAILABLE_ICONS.map((icon) => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
                <Input
                  placeholder="Title (e.g., Phone)"
                  value={newInfo.title}
                  onChange={(e) => setNewInfo({ ...newInfo, title: e.target.value })}
                />
                <Input
                  placeholder="Details (e.g., +27...)"
                  value={newInfo.details}
                  onChange={(e) => setNewInfo({ ...newInfo, details: e.target.value })}
                />
              </div>
              <Button onClick={handleAddInfo} disabled={!newInfo.title || !newInfo.details} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Contact Info
              </Button>

              <div className="space-y-2">
                {contact.contactInfo?.map((info: any) => (
                  <div
                    key={info.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, info)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, info)}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border hover:border-primary transition-all cursor-move"
                  >
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    
                    {editingInfoId === info.id ? (
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <select
                          className="p-2 border rounded-lg"
                          value={editingInfoData.icon}
                          onChange={(e) => setEditingInfoData({ ...editingInfoData, icon: e.target.value })}
                        >
                          {AVAILABLE_ICONS.map((icon) => (
                            <option key={icon} value={icon}>{icon}</option>
                          ))}
                        </select>
                        <Input
                          value={editingInfoData.title}
                          onChange={(e) => setEditingInfoData({ ...editingInfoData, title: e.target.value })}
                        />
                        <Input
                          value={editingInfoData.details}
                          onChange={(e) => setEditingInfoData({ ...editingInfoData, details: e.target.value })}
                        />
                        <div className="col-span-3 flex gap-2">
                          <Button size="sm" onClick={() => handleSaveInfo(info.id)}>
                            <Save className="w-3 h-3 mr-1" />Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingInfoId(null)}>
                            <X className="w-3 h-3 mr-1" />Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <div className="font-medium">{info.title}</div>
                          <div className="text-sm text-gray-600">{info.details}</div>
                          <div className="text-xs text-gray-400">Icon: {info.icon}</div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingInfoId(info.id);
                              setEditingInfoData({ icon: info.icon, title: info.title, details: info.details });
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (window.confirm('Delete this contact info?')) {
                                onDeleteInfo(info.id);
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
      </Tabs>
    </div>
  );
};