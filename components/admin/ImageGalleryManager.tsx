/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Upload, Image as ImageIcon } from 'lucide-react';
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
  const [updating, setUpdating] = useState(false);

  // Update local images when prop changes (important for subcategory switching)
  React.useEffect(() => {
    console.log('Images updated:', images);
    setLocalImages(images || []);
    setEditingIndex(null); // Reset editing state
  }, [images, subcategoryId]);

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

      await onUpdate(categoryId, subcategoryId, {
        images: updatedImages,
        type: 'image-gallery',
      });

      setLocalImages(updatedImages);
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      // Reset the file input
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (index: number) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    const image = localImages[index];
    
    try {
      setUpdating(true);
      
      // Delete from Cloudinary if publicId exists
      if (image.publicId) {
        const deleteResponse = await fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId: image.publicId }),
        });
        
        if (!deleteResponse.ok) {
          console.warn('Failed to delete from Cloudinary, continuing anyway...');
        }
      }

      const updatedImages = localImages
        .filter((_, i) => i !== index)
        .map((img, i) => ({ ...img, pageNumber: i + 1 }));

      await onUpdate(categoryId, subcategoryId, {
        images: updatedImages,
      });

      setLocalImages(updatedImages);
      alert('Image deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete image. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateImage = async (index: number, updates: Partial<ImagePage>) => {
    try {
      setUpdating(true);
      
      const updatedImages = localImages.map((img, i) =>
        i === index ? { ...img, ...updates } : img
      );

      await onUpdate(categoryId, subcategoryId, {
        images: updatedImages,
      });

      setLocalImages(updatedImages);
      setEditingIndex(null);
      alert('Image updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update image. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= localImages.length) return;

    try {
      setUpdating(true);
      
      const updatedImages = [...localImages];
      [updatedImages[index], updatedImages[newIndex]] = [
        updatedImages[newIndex],
        updatedImages[index],
      ];

      // Update page numbers
      updatedImages.forEach((img, i) => {
        img.pageNumber = i + 1;
      });

      await onUpdate(categoryId, subcategoryId, {
        images: updatedImages,
      });

      setLocalImages(updatedImages);
    } catch (error) {
      console.error('Reorder error:', error);
      alert('Failed to reorder images. Please try again.');
    } finally {
      setUpdating(false);
    }
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
                disabled={uploading || updating}
              />
              <Button disabled={uploading || updating} asChild>
                <span>
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
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
        {updating && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-700">Updating images...</span>
          </div>
        )}
        
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
              <Card key={`${image.publicId}-${index}`} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Image Preview */}
                    <div className="relative w-32 h-32 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={image.imagePath}
                        alt={image.alt}
                        fill
                        className="object-contain"
                        unoptimized
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
                                setLocalImages(prev => 
                                  prev.map((img, i) => 
                                    i === index 
                                      ? { ...img, pageNumber: parseInt(e.target.value) || 1 }
                                      : img
                                  )
                                )
                              }
                              className="mt-1"
                              disabled={updating}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Alt Text</label>
                            <Textarea
                              value={image.alt}
                              onChange={(e) =>
                                setLocalImages(prev => 
                                  prev.map((img, i) => 
                                    i === index 
                                      ? { ...img, alt: e.target.value }
                                      : img
                                  )
                                )
                              }
                              className="mt-1"
                              rows={2}
                              disabled={updating}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateImage(index, localImages[index])}
                              disabled={updating}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingIndex(null);
                                setLocalImages(images || []);
                              }}
                              disabled={updating}
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
                            {image.publicId && (
                              <p className="text-xs text-gray-400 mt-1">
                                ID: {image.publicId.split('/').pop()}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingIndex(index)}
                              disabled={updating}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReorder(index, 'up')}
                              disabled={index === 0 || updating}
                            >
                              ↑
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReorder(index, 'down')}
                              disabled={index === localImages.length - 1 || updating}
                            >
                              ↓
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteImage(index)}
                              disabled={updating}
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