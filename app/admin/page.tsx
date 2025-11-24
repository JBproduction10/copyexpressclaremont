/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Settings, Edit, Download, Briefcase } from 'lucide-react';
import { Notification } from '@/components/admin/Notification';
import { Header } from '@/components/admin/Header';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { QuickActions } from '@/components/admin/QuickActions';
import { CategoryList } from '@/components/admin/CategoryList';
import { DataEditor } from '@/components/admin/DataEditor';
import { ImportExport } from '@/components/admin/ImportExport';
import { ServiceManager } from '@/components/admin/ServiceManager';
import { useNotification } from '@/hooks/useNotification';
import { useCategoryManager } from '@/hooks/useCategoryManager';
import { useDataEditor } from '@/hooks/useDataEditor';
import { useServices } from '@/hooks/useServices';

// Mock initial data
const initialCategories = [
  {
    id: 'a4-a3',
    name: 'A4 & A3 Prints',
    description: 'Professional A4 & A3 printing options',
    subcategories: [
      {
        id: 'a4-colour',
        name: 'A4 Colour Prints',
        type: 'table',
        columns: [
          { key: '80_SS', label: '80 GSM', sublabel: 'S/S' },
          { key: '80_DS', label: '80 GSM', sublabel: 'D/S' }
        ],
        data: [
          { qty: '1-20', '80_SS': 'R10.0', '80_DS': 'R15.0', discount: '' },
          { qty: '21-50', '80_SS': 'R8.8', '80_DS': 'R13.2', discount: '12%' }
        ]
      }
    ]
  }
];

const AdminCRUD: React.FC = () => {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Notification system
  const { notification, showNotification } = useNotification();

  // Category management
  const {
    categories,
    editingItem,
    setEditingItem,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory
  } = useCategoryManager(initialCategories, showNotification);

  // Data editor
  const {
    selectedCategory,
    selectedSubcategory,
    setSelectedCategory,
    setSelectedSubcategory,
    addDataRow,
    updateDataRow,
    deleteDataRow,
    addColumn,
    updateColumn,
    deleteColumn
  } = useDataEditor(categories, updateSubcategory, showNotification);

  // Services management
  const {
    services,
    loading: servicesLoading,
    createService,
    updateService,
    deleteService,
    reorderServices
  } = useServices();

  // Check authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/admin/login");
  }

  // Logout handler
  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/admin/login" });
    showNotification('Logged out successfully');
  };

  // Import/Export handlers
  const handleExport = () => {
    const dataStr = JSON.stringify(categories, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pricing-data-${new Date().toISOString()}.json`;
    link.click();
    showNotification('Data exported successfully');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        showNotification('Data imported successfully');
      } catch (error) {
        showNotification('Error importing data', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Subcategory navigation handlers
  const handleEditSubcategory = (categoryId: string, subId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(subId);
    setActiveTab('data');
  };

  // Service handlers with notifications
  const handleCreateService = async (service: any) => {
    try {
      await createService(service);
      showNotification('Service created successfully');
    } catch (error) {
      showNotification('Failed to create service', 'error');
    }
  };

  const handleUpdateService = async (id: string, updates: any) => {
    try {
      await updateService(id, updates);
      showNotification('Service updated successfully');
    } catch (error) {
      showNotification('Failed to update service', 'error');
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      await deleteService(id);
      showNotification('Service deleted successfully');
    } catch (error) {
      showNotification('Failed to delete service', 'error');
    }
  };

  const handleReorderServices = async (serviceIds: string[]) => {
    try {
      await reorderServices(serviceIds);
      showNotification('Services reordered successfully');
    } catch (error) {
      showNotification('Failed to reorder services', 'error');
    }
  };

  // Main admin dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      <Notification {...notification} />

      {/* Header */}
      <Header username={session?.user?.username || 'User'} onLogout={handleLogout} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Data
            </TabsTrigger>
            <TabsTrigger value="import-export" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Import/Export
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <DashboardStats categories={categories} />
            
            {/* Extended stats with services */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-2">Services Overview</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Services:</span>
                    <span className="font-semibold">{services.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Services:</span>
                    <span className="font-semibold text-green-600">
                      {services.filter((s: any) => s.isActive).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hidden Services:</span>
                    <span className="font-semibold text-gray-400">
                      {services.filter((s: any) => !s.isActive).length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-2">Quick Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Categories:</span>
                    <span className="font-semibold">{categories.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subcategories:</span>
                    <span className="font-semibold">
                      {categories.reduce((acc, cat) => acc + cat.subcategories.length, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Items:</span>
                    <span className="font-semibold text-primary">
                      {services.length + categories.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <QuickActions
              onAddCategory={addCategory}
              onExport={handleExport}
              onImport={handleImport}
              onEditPrices={() => setActiveTab('data')}
            />
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            {servicesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading services...</p>
              </div>
            ) : (
              <ServiceManager
                services={services}
                onCreate={handleCreateService}
                onUpdate={handleUpdateService}
                onDelete={handleDeleteService}
                onReorder={handleReorderServices}
              />
            )}
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Manage Categories</h2>
              <button
                onClick={addCategory}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
              >
                <span className="text-xl">+</span>
                Add Category
              </button>
            </div>

            <CategoryList
              categories={categories}
              editingItem={editingItem}
              onEdit={(id) => setEditingItem(editingItem === id ? null : id)}
              onUpdate={updateCategory}
              onDelete={deleteCategory}
              onAddSubcategory={addSubcategory}
              onEditSubcategory={handleEditSubcategory}
              onDeleteSubcategory={deleteSubcategory}
            />
          </TabsContent>

          {/* Edit Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <DataEditor
              categories={categories}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onCategoryChange={(id) => {
                setSelectedCategory(id);
                setSelectedSubcategory(null);
              }}
              onSubcategoryChange={setSelectedSubcategory}
              onAddRow={addDataRow}
              onUpdateRow={updateDataRow}
              onDeleteRow={deleteDataRow}
              onAddColumn={addColumn}
              onUpdateColumn={updateColumn}
              onDeleteColumn={deleteColumn}
            />
          </TabsContent>

          {/* Import/Export Tab */}
          <TabsContent value="import-export" className="space-y-6">
            <ImportExport
              onExport={handleExport}
              onImport={handleImport}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminCRUD;