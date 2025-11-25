/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImagePage {
  pageNumber: number;
  imagePath: string;
  alt: string;
  publicId?: string;
}

interface ImageGalleryManagerProps {
  categoryId: string;
  subcategoryId: string;
  images: ImagePage[];
  subcategoryName: string;
  onUpdate: (categoryId: string, subId: string, updates: any) => Promise<void>;
}

export const ImageGalleryManager: React.FC<ImageGalleryManagerProps> = ({
  categoryId,
  subcategoryId,
  images,
  subcategoryName,
  onUpdate,
}) => {
  const [localImages, setLocalImages] = useState<ImagePage[]>(images || []);
  const [uploading, setUploading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', `${categoryId}/${subcategoryId}`);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();

      const newImage: ImagePage = {
        pageNumber: localImages.length + 1,
        imagePath: data.url,
        alt: `${subcategoryName} page ${localImages.length + 1}`,
        publicId: data.publicId,
      };

      const updatedImages = [...localImages, newImage];
      setLocalImages(updatedImages);

      await onUpdate(categoryId, subcategoryId, {
        images: updatedImages,
        type: 'image-gallery',
      });
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (index: number) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    const image = localImages[index];
    
    try {
      // Delete from Cloudinary if publicId exists
      if (image.publicId) {
        await fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId: image.publicId }),
        });
      }

      const updatedImages = localImages
        .filter((_, i) => i !== index)
        .map((img, i) => ({ ...img, pageNumber: i + 1 }));

      setLocalImages(updatedImages);

      await onUpdate(categoryId, subcategoryId, {
        images: updatedImages,
      });
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete image');
    }
  };

  const handleUpdateImage = async (index: number, updates: Partial<ImagePage>) => {
    const updatedImages = localImages.map((img, i) =>
      i === index ? { ...img, ...updates } : img
    );
    setLocalImages(updatedImages);

    await onUpdate(categoryId, subcategoryId, {
      images: updatedImages,
    });
    setEditingIndex(null);
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= localImages.length) return;

    const updatedImages = [...localImages];
    [updatedImages[index], updatedImages[newIndex]] = [
      updatedImages[newIndex],
      updatedImages[index],
    ];

    // Update page numbers
    updatedImages.forEach((img, i) => {
      img.pageNumber = i + 1;
    });

    setLocalImages(updatedImages);

    await onUpdate(categoryId, subcategoryId, {
      images: updatedImages,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Image Gallery - {subcategoryName}</CardTitle>
          <div className="flex gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
              <Button disabled={uploading} asChild>
                <span>
                  {uploading ? (
                    'Uploading...'
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </>
                  )}
                </span>
              </Button>
            </label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {localImages.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No images uploaded yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Click the Upload Image button to add images
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {localImages.map((image, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Image Preview */}
                    <div className="relative w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={image.imagePath}
                        alt={image.alt}
                        fill
                        className="object-contain"
                      />
                    </div>

                    {/* Image Details */}
                    <div className="flex-1 space-y-3">
                      {editingIndex === index ? (
                        <>
                          <div>
                            <label className="text-sm font-medium">Page Number</label>
                            <Input
                              type="number"
                              value={image.pageNumber}
                              onChange={(e) =>
                                handleUpdateImage(index, {
                                  pageNumber: parseInt(e.target.value),
                                })
                              }
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Alt Text</label>
                            <Textarea
                              value={image.alt}
                              onChange={(e) =>
                                handleUpdateImage(index, { alt: e.target.value })
                              }
                              className="mt-1"
                              rows={2}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => setEditingIndex(null)}
                            >
                              Done
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingIndex(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <p className="text-sm font-medium">
                              Page {image.pageNumber}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {image.alt}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingIndex(index)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReorder(index, 'up')}
                              disabled={index === 0}
                            >
                              ↑
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReorder(index, 'down')}
                              disabled={index === localImages.length - 1}
                            >
                              ↓
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteImage(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};