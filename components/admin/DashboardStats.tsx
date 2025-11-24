/* eslint-disable @typescript-eslint/no-explicit-any */
//components/admin
import React from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardStatsProps {
  categories: any[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ categories }) => {
  const totalSubcategories = categories.reduce((acc, cat) => acc + cat.subcategories.length, 0);
  const totalRows = categories.reduce((acc, cat) => 
    acc + cat.subcategories.reduce((subAcc: number, sub: any) => 
      subAcc + (sub.data?.length || 0), 0
    ), 0
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Total Categories</CardDescription>
          <CardTitle className="text-4xl">{categories.length}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Total Subcategories</CardDescription>
          <CardTitle className="text-4xl">{totalSubcategories}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Total Pricing Rows</CardDescription>
          <CardTitle className="text-4xl">{totalRows}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
};