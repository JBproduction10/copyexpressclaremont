'use client';

import React, { useState } from 'react';
import { SubCategory } from '@/types/index';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface PricingTableProps {
  subcategory: SubCategory;
}

export const PricingTable: React.FC<PricingTableProps> = ({ subcategory }) => {
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  const openModal = (index: number) => setModalIndex(index);
  const closeModal = () => setModalIndex(null);

  const prevImage = () => {
    if (modalIndex === null || !subcategory.images) return;
    setModalIndex((modalIndex - 1 + subcategory.images.length) % subcategory.images.length);
  };

  const nextImage = () => {
    if (modalIndex === null || !subcategory.images) return;
    setModalIndex((modalIndex + 1) % subcategory.images.length);
  };

  // IMAGE-BASED SUBCATEGORIES
  if (subcategory.type === 'image' && subcategory.images) {
    return (
      <div className="w-full space-y-6">
        {/* HORIZONTAL SCROLL IMAGES */}
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
          {subcategory.images.map((imagePath, idx) => (
            <div
              key={idx}
              className="snap-center flex-shrink-0 w-full max-w-xs sm:max-w-sm lg:max-w-md cursor-pointer"
              onClick={() => openModal(idx)}
            >
              <div className="relative w-full bg-white rounded-lg overflow-hidden shadow-sm border border-border">
                <Image
                  src={imagePath}
                  alt={`${subcategory.name} - Page ${idx + 1}`}
                  width={1200}
                  height={800}
                  className="w-full h-auto object-contain max-h-[400px]"
                  priority={idx === 0}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ADDITIONAL NOTES */}
        {subcategory.additionalNotes && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            {Array.isArray(subcategory.additionalNotes) ? (
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 list-disc list-inside">
                {subcategory.additionalNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
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
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 select-none">
            {/* CLOSE BUTTON */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white p-2 bg-black/40 rounded-full hover:bg-black/60 transition"
            >
              <X size={24} />
            </button>

            {/* LEFT BUTTON */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition"
            >
              <ChevronLeft size={32} />
            </button>

            {/* IMAGE */}
            <div className="max-w-5xl max-h-[90vh] p-2">
              <Image
                src={subcategory.images[modalIndex]}
                alt="Expanded view"
                width={1600}
                height={1200}
                className="max-w-full max-h-[90vh] object-contain mx-auto rounded-lg"
              />
            </div>

            {/* RIGHT BUTTON */}
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition"
            >
              <ChevronRight size={32} />
            </button>
          </div>
        )}
      </div>
    );
  }

  // TABLE-BASED SUBCATEGORIES
  if (!subcategory.data || !subcategory.columns) return null;

  const columns = subcategory.columns;
  const data = subcategory.data;

  return (
    <div className="w-full">
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="border p-2 sm:p-3 text-left font-semibold text-xs sm:text-sm sticky left-0 bg-muted z-10">
                  Quantity
                </th>

                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="border p-2 sm:p-3 text-center font-semibold text-xs sm:text-sm whitespace-nowrap"
                  >
                    <div>{col.label}</div>
                    {col.sublabel && (
                      <div className="text-xs font-normal text-muted-foreground mt-0.5">
                        {col.sublabel}
                      </div>
                    )}
                  </th>
                ))}

                <th className="border p-2 sm:p-3 text-center font-semibold text-xs sm:text-sm whitespace-nowrap">
                  Discount
                </th>
              </tr>
            </thead>

            <tbody>
              {data.map((row, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/50'}
                >
                  <td className="border p-2 sm:p-3 font-medium text-xs sm:text-sm sticky left-0 z-10 bg-inherit">
                    {row.qty}
                  </td>

                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="border p-2 sm:p-3 text-center text-xs sm:text-sm whitespace-nowrap"
                    >
                      {row[col.key]}
                    </td>
                  ))}

                  <td className="border p-2 sm:p-3 text-center text-green-600 font-semibold text-xs sm:text-sm whitespace-nowrap">
                    {row.discount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
