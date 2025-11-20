// components/PricingTable.tsx

import React from 'react';
import { SubCategory } from '@/types/index';

interface PricingTableProps {
  subcategory: SubCategory;
}

export const PricingTable: React.FC<PricingTableProps> = ({ subcategory }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted">
            <th className="border p-3 text-left font-semibold">Quantity</th>
            {subcategory.columns.map((col) => (
              <th key={col.key} className="border p-3 text-center font-semibold">
                {col.label}
                {col.sublabel && (
                  <>
                    <br />
                    <span className="text-xs font-normal">{col.sublabel}</span>
                  </>
                )}
              </th>
            ))}
            <th className="border p-3 text-center font-semibold">Discount</th>
          </tr>
        </thead>
        <tbody>
          {subcategory.data.map((row, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/50'}>
              <td className="border p-3 font-medium">{row.qty}</td>
              {subcategory.columns.map((col) => (
                <td key={col.key} className="border p-3 text-center">
                  {row[col.key]}
                </td>
              ))}
              <td className="border p-3 text-center text-green-600 font-semibold">
                {row.discount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {subcategory.additionalNotes && (
        <p className="text-sm text-muted-foreground mt-2">{subcategory.additionalNotes}</p>
      )}
    </div>
  );
};