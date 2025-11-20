import React from 'react';
import { SubCategory } from '@/types/index';
import Image from 'next/image';

interface PricingTableProps {
  subcategory: SubCategory;
}

export const PricingTable: React.FC<PricingTableProps> = ({ subcategory }) => {
  // Handle image-based subcategories
  if (subcategory.type === 'image' && subcategory.images) {
    return (
      <div className="w-full space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {subcategory.images.map((imagePath, idx) => (
            <div key={idx} className="relative w-full">
              <div className="relative w-full bg-white rounded-lg overflow-hidden shadow-sm border border-border">
                <Image
                  src={imagePath}
                  alt={`${subcategory.name} - Page ${idx + 1}`}
                  width={1200}
                  height={800}
                  className="w-full h-auto object-contain"
                  priority={idx === 0}
                />
              </div>
            </div>
          ))}
        </div>

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
      </div>
    );
  }

  // Handle table-based subcategories
  if (!subcategory.data || !subcategory.columns) {
    return null;
  }

  // ✅ TypeScript now knows these are defined
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

      {subcategory.additionalNotes && (
        <div className="mt-3 sm:mt-4">
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
    </div>
  );
};
