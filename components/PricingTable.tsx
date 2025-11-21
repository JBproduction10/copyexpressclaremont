'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SubCategory } from '@/types/index';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PricingTableProps {
  subcategory: SubCategory;
}

export const PricingTable: React.FC<PricingTableProps> = ({ subcategory }) => {
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const openModal = (index: number) => {
    setModalIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalIndex(null);
    document.body.style.overflow = 'unset';
  };

  const prevImage = () => {
    if (modalIndex === null || !subcategory.images) return;
    setModalIndex((modalIndex - 1 + subcategory.images.length) % subcategory.images.length);
  };

  const nextImage = () => {
    if (modalIndex === null || !subcategory.images) return;
    setModalIndex((modalIndex + 1) % subcategory.images.length);
  };

  // Touch handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
  };

  // Keyboard navigation and cleanup
  useEffect(() => {
    if (modalIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [modalIndex]);

  // IMAGE-BASED SUBCATEGORIES
  if (subcategory.type === 'image-gallery' && subcategory.images) {
    return (
      <div className="w-full space-y-6">
        {/* GRID LAYOUT FOR IMAGES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subcategory.images.map((image, idx) => (
            <div
              key={idx}
              className="relative group cursor-pointer rounded-lg overflow-hidden border border-border bg-white shadow-sm hover:shadow-md transition-shadow"
              onClick={() => openModal(idx)}
            >
              <div className="relative w-full aspect-[8.5/11]">
                <Image
                  src={image.imagePath}
                  alt={image.alt}
                  fill
                  className="object-contain p-2"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={idx < 3}
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/90 rounded-full p-3">
                      <ZoomIn className="w-6 h-6 text-foreground" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-muted text-center">
                <p className="text-xs sm:text-sm font-medium text-foreground">
                  Page {image.pageNumber}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ADDITIONAL NOTES */}
        {subcategory.additionalNotes && (
          <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="font-semibold text-sm mb-2 text-foreground">Important Notes:</h4>
            {Array.isArray(subcategory.additionalNotes) ? (
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-1.5">
                {subcategory.additionalNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs sm:text-sm text-muted-foreground">
                {subcategory.additionalNotes}
              </p>
            )}
          </div>
        )}

        {/* MODAL */}
        {modalIndex !== null && (
          <div 
            ref={modalRef}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 overflow-hidden"
            onClick={closeModal}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* CLOSE BUTTON - Always visible */}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                closeModal();
              }}
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:bg-white/20 rounded-full h-10 w-10 z-50"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>

            {/* LEFT BUTTON - Hidden on mobile */}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              variant="ghost"
              size="icon"
              className="hidden sm:flex absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full h-12 w-12"
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>

            {/* IMAGE CONTAINER */}
            <div 
              className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image */}
              <div className="relative w-full max-w-6xl h-[calc(100vh-120px)] sm:h-[calc(100vh-150px)]">
                <Image
                  src={subcategory.images[modalIndex].imagePath}
                  alt={subcategory.images[modalIndex].alt}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>
              
              {/* Info */}
              <div className="text-center mt-4 text-white space-y-2">
                <p className="text-sm sm:text-base font-medium">
                  Page {subcategory.images[modalIndex].pageNumber} of {subcategory.images.length}
                </p>
                <p className="text-xs sm:text-sm text-white/70">
                  <span className="sm:hidden">Swipe left or right to navigate</span>
                  <span className="hidden sm:inline">Use arrow keys or click arrows to navigate • Press ESC to close</span>
                </p>
              </div>
            </div>

            {/* RIGHT BUTTON - Hidden on mobile */}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              variant="ghost"
              size="icon"
              className="hidden sm:flex absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full h-12 w-12"
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  // TABLE-BASED SUBCATEGORIES
  if (!subcategory.data || !subcategory.columns) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No pricing data available
      </div>
    );
  }

  const columns = subcategory.columns;
  const data = subcategory.data;
  const hasQuantity = data.some(row => row.qty);
  const hasDiscount = data.some(row => row.discount);
  const hasService = data.some(row => row.service);

  return (
    <div className="w-full space-y-4">
      {/* Hide scrollbar using Tailwind's scrollbar utilities */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border border-border rounded-lg">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  {hasQuantity && (
                    <th className="border-b border-border p-2 sm:p-3 text-left font-semibold text-xs sm:text-sm sticky left-0 bg-muted z-10">
                      Quantity
                    </th>
                  )}
                  {hasService && (
                    <th className="border-b border-border p-2 sm:p-3 text-left font-semibold text-xs sm:text-sm">
                      Service Type
                    </th>
                  )}
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="border-b border-border p-2 sm:p-3 text-center font-semibold text-xs sm:text-sm whitespace-nowrap"
                    >
                      <div>{col.label}</div>
                      {col.sublabel && (
                        <div className="text-xs font-normal text-muted-foreground mt-0.5">
                          {col.sublabel}
                        </div>
                      )}
                    </th>
                  ))}
                  {hasDiscount && (
                    <th className="border-b border-border p-2 sm:p-3 text-center font-semibold text-xs sm:text-sm whitespace-nowrap">
                      Discount
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`${
                      idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'
                    } hover:bg-muted/50 transition-colors`}
                  >
                    {hasQuantity && (
                      <td className="border-b border-border p-2 sm:p-3 font-medium text-xs sm:text-sm sticky left-0 z-10 bg-inherit">
                        {row.qty}
                      </td>
                    )}
                    {hasService && (
                      <td className="border-b border-border p-2 sm:p-3 text-xs sm:text-sm">
                        {row.service}
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="border-b border-border p-2 sm:p-3 text-center text-xs sm:text-sm whitespace-nowrap"
                      >
                        {row[col.key] || '-'}
                      </td>
                    ))}
                    {hasDiscount && (
                      <td className="border-b border-border p-2 sm:p-3 text-center text-green-600 font-semibold text-xs sm:text-sm whitespace-nowrap">
                        {row.discount}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ADDITIONAL NOTES FOR TABLES */}
      {subcategory.additionalNotes && (
        <div className="mt-4 p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-lg">
          {Array.isArray(subcategory.additionalNotes) ? (
            <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
              {subcategory.additionalNotes.map((note, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs sm:text-sm text-muted-foreground">
              {subcategory.additionalNotes}
            </p>
          )}
        </div>
      )}
    </div>
  );
};