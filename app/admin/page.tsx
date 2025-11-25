// app/admin/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Settings, Edit, Download, Briefcase } from 'lucide-react';
import { Notification } from '@/components/admin/Notification';
import { Header } from '@/components/admin/Header';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { QuickActions } from '@/components/admin/QuickActions';
import { CategoryList } from '@/components/admin/CategoryList';
import { CategorySearch } from '@/components/admin/CategorySearch';
import { DataEditor } from '@/components/admin/DataEditor';
import { ImportExport } from '@/components/admin/ImportExport';
import { ServiceManager } from '@/components/admin/ServiceManager';
import { AboutManager } from '@/components/admin/AboutManager';
import { ContactManager } from '@/components/admin/ContactManager';
import { HeroManager } from '@/components/admin/HeroManager';
import { useNotification } from '@/hooks/useNotification';
import { useDataEditor } from '@/hooks/useDataEditor';
import { useServices } from '@/hooks/useServices';
import { useAbout } from '@/hooks/useAbout';
import { useContact } from '@/hooks/useContact';
import { useHero } from '@/hooks/useHero';

const CATEGORIES_PER_PAGE = 4;

const AdminCRUD: React.FC = () => {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const { notification, showNotification } = useNotification();

  // Fetch categories with search support
  const fetchCategories = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: CATEGORIES_PER_PAGE.toString(),
        ...(search && { search })
      });
      
      const res = await fetch(`/api/categories?${params}`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data.categories);
      setTotalPages(data.pagination.pages);
      setTotalCategories(data.pagination.total);
      showNotification(
        search 
          ? `Found ${data.pagination.total} matching categories` 
          : 'Categories loaded successfully'
      );
    } catch (error) {
      console.error(error);
      showNotification('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') fetchCategories(currentPage, searchQuery);
  }, [status, currentPage]);

  // Search handler
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on new search
    fetchCategories(1, query);
  };

  // Category CRUD operations
  const addCategory = async () => {
    const newCategory = {
      id: `cat-${Date.now()}`,
      name: 'New Category',
      description: 'Category description',
      subcategories: [],
    };
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      });
      if (!res.ok) throw new Error('Failed to create category');
      await fetchCategories(currentPage, searchQuery);
      showNotification('Category added successfully');
    } catch (error) {
      console.error(error);
      showNotification('Failed to add category', 'error');
    }
  };

  const updateCategory = async (id: string, updates: Partial<any>) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update category');
      await fetchCategories(currentPage, searchQuery);
      showNotification('Category updated successfully');
    } catch (error) {
      console.error(error);
      showNotification('Failed to update category', 'error');
    }
  };

  const deleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete category');
      
      // If deleting last item on page and not first page, go to previous page
      if (categories.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
        await fetchCategories(currentPage - 1, searchQuery);
      } else {
        await fetchCategories(currentPage, searchQuery);
      }
      showNotification('Category deleted successfully');
    } catch (error) {
      console.error(error);
      showNotification('Failed to delete category', 'error');
    }
  };

  // Subcategory CRUD
  const addSubcategory = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const newSub = {
      id: `sub-${Date.now()}`,
      name: 'New Subcategory',
      type: 'table',
      columns: [{ key: 'col1', label: 'Column 1' }],
      data: [],
    };

    await updateCategory(categoryId, { subcategories: [...category.subcategories, newSub] });
    showNotification('Subcategory added successfully');
  };

  const updateSubcategory = async (categoryId: string, subId: string, updates: any) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const updatedSubs = category.subcategories.map((sub: any) => 
      sub.id === subId ? { ...sub, ...updates } : sub
    );
    await updateCategory(categoryId, { subcategories: updatedSubs });
    showNotification('Subcategory updated successfully');
  };

  const deleteSubcategory = async (categoryId: string, subId: string) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) return;
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    const updatedSubs = category.subcategories.filter((sub: any) => sub.id !== subId);
    await updateCategory(categoryId, { subcategories: updatedSubs });
    showNotification('Subcategory deleted successfully');
  };

  // Data editor hooks
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
    deleteColumn,
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

  // About management
  const { 
    about, 
    loading: aboutLoading, 
    error: aboutError, 
    updateAbout, 
    addFeature, 
    updateFeature, 
    deleteFeature, 
    reorderFeatures 
  } = useAbout(session?.user?.id || null);

  // Contact management
  const {
    contact,
    loading: contactLoading,
    error: contactError,
    updateContact,
    addContactInfo,
    updateContactInfo,
    deleteContactInfo,
    reorderContactInfo,
    refetch: refetchContact
  } = useContact(session?.user?.id || null);

  // Hero management
  const {
    hero,
    loading: heroLoading,
    error: heroError,
    updateHero,
    refetch: refetchHero
  } = useHero(session?.user?.id || null);

  // Authentication check
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (status === 'unauthenticated') redirect('/admin/login');

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/admin/login' });
    showNotification('Logged out successfully');
  };

  // Import/Export handlers
  const handleExport = async () => {
    try {
      const res = await fetch('/api/import-export/export');
      if (!res.ok) throw new Error('Export failed');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pricing-data-${new Date().toISOString()}.json`;
      link.click();
      showNotification('Data exported successfully');
    } catch (error) {
      console.error(error);
      showNotification('Export failed', 'error');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async ev => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        const res = await fetch('/api/import-export/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categories: data, replaceAll: false }),
        });
        if (!res.ok) throw new Error('Import failed');
        await fetchCategories(currentPage, searchQuery);
        showNotification('Data imported successfully');
      } catch (error) {
        console.error(error);
        showNotification('Import failed', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Navigation helper
  const handleEditSubcategory = (categoryId: string, subId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(subId);
    setActiveTab('data');
  };

  // Wrapper for service operations with notifications
  const wrapServiceHandler = (fn: () => Promise<void>, successMsg: string, errorMsg: string) => async () => {
    try {
      await fn();
      showNotification(successMsg);
    } catch {
      showNotification(errorMsg, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Notification {...notification} />
      <Header username={session?.user?.username || 'User'} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <TabsList className="inline-flex w-auto min-w-full sm:grid sm:grid-cols-4 lg:grid-cols-8 h-auto gap-1">
            <TabsTrigger value="dashboard" className="flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap px-2.5 sm:px-4 py-2.5 text-xs sm:text-sm">
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden xs:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap px-2.5 sm:px-4 py-2.5 text-xs sm:text-sm">
              <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden xs:inline">Services</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap px-2.5 sm:px-4 py-2.5 text-xs sm:text-sm">
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden xs:inline">Categories</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap px-2.5 sm:px-4 py-2.5 text-xs sm:text-sm">
              <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden xs:inline">Data</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap px-2.5 sm:px-4 py-2.5 text-xs sm:text-sm">
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden xs:inline">About</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap px-2.5 sm:px-4 py-2.5 text-xs sm:text-sm">
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden xs:inline">Contact</span>
            </TabsTrigger>
            <TabsTrigger value="hero" className="flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap px-2.5 sm:px-4 py-2.5 text-xs sm:text-sm">
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden xs:inline">Hero</span>
            </TabsTrigger>
            <TabsTrigger value="import-export" className="flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap px-2.5 sm:px-4 py-2.5 text-xs sm:text-sm">
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden xs:inline">Import</span>
            </TabsTrigger>
          </TabsList>

          {/* Tabs Content */}
          <TabsContent value="dashboard" className="space-y-6">
            <DashboardStats categories={categories} />
            <QuickActions 
              onAddCategory={addCategory} 
              onExport={handleExport} 
              onImport={handleImport} 
              onEditPrices={() => setActiveTab('data')} 
            />
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            {servicesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading services...</p>
              </div>
            ) : (
              <ServiceManager
                services={services}
                onCreate={wrapServiceHandler(
                  () => createService({} as any), 
                  'Service created', 
                  'Failed to create service'
                )}
                onUpdate={(id, updates) => wrapServiceHandler(
                  () => updateService(id, updates), 
                  'Service updated', 
                  'Failed to update service'
                )()}
                onDelete={(id) => wrapServiceHandler(
                  () => deleteService(id), 
                  'Service deleted', 
                  'Failed to delete service'
                )()}
                onReorder={(ids) => wrapServiceHandler(
                  () => reorderServices(ids), 
                  'Services reordered', 
                  'Failed to reorder services'
                )()}
              />
            )}
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            {/* Search Component */}
            <CategorySearch 
              onSearch={handleSearch}
              placeholder="Search categories by name or description..."
            />

            {/* Results Summary */}
            {searchQuery && (
              <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                Showing {categories.length} of {totalCategories} categories matching &quot;{searchQuery}&quot;
              </div>
            )}

            <CategoryList
              categories={categories}
              editingItem={editingItem}
              onEdit={id => setEditingItem(editingItem === id ? null : id)}
              onUpdate={updateCategory}
              onDelete={deleteCategory}
              onAddSubcategory={addSubcategory}
              onEditSubcategory={handleEditSubcategory}
              onDeleteSubcategory={deleteSubcategory}
            />

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {/* Previous */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Prev
              </button>

              {(() => {
                const pages = [];
                const maxShown = 5;

                let start = Math.max(1, currentPage - 2);
                const end = Math.min(totalPages, start + maxShown - 1);

                if (end - start < maxShown - 1) {
                  start = Math.max(1, end - maxShown + 1);
                }

                // First page always
                if (start > 1) {
                  pages.push(1);
                  if (start > 2) pages.push('ellipsis-start');
                }

                // Sliding pages
                for (let i = start; i <= end; i++) pages.push(i);

                // Last page always
                if (end < totalPages) {
                  if (end < totalPages - 1) pages.push('ellipsis-end');
                  pages.push(totalPages);
                }

                return pages.map((p, idx) =>
                  typeof p === 'string' ? (
                    <span key={idx} className="px-2 text-gray-400 select-none">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`px-3 py-1 border rounded ${
                        p === currentPage ? 'bg-primary text-white border-primary' : ''
                      }`}
                    >
                      {p}
                    </button>
                  )
                );
              })()}

              {/* Next */}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <DataEditor
              categories={categories}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onCategoryChange={id => {
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

          <TabsContent value="about" className="space-y-6">
            {aboutLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading about section...</p>
              </div>
            ) : aboutError ? (
              <div className="text-center py-12 text-red-500">{aboutError}</div>
            ) : (
              <AboutManager
                about={about}
                onUpdate={wrapServiceHandler(
                  () => updateAbout({}), 
                  'About updated', 
                  'Failed to update About'
                )}
                onAddFeature={wrapServiceHandler(
                  () => addFeature({ text: '' }), 
                  'Feature added', 
                  'Failed to add feature'
                )}
                onUpdateFeature={(id, text) => wrapServiceHandler(
                  () => updateFeature(id, text), 
                  'Feature updated', 
                  'Failed to update feature'
                )()}
                onDeleteFeature={id => wrapServiceHandler(
                  () => deleteFeature(id), 
                  'Feature deleted', 
                  'Failed to delete feature'
                )()}
                onReorderFeatures={ids => wrapServiceHandler(
                  () => reorderFeatures(ids), 
                  'Features reordered', 
                  'Failed to reorder features'
                )()}
              />
            )}
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            {contactLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading contact section...</p>
              </div>
            ) : contactError ? (
              <div className="text-center py-12 text-red-500">{contactError}</div>
            ) : (
              <ContactManager
                contact={contact}
                onUpdate={wrapServiceHandler(
                  () => updateContact({}), 
                  'Contact updated', 
                  'Failed to update Contact'
                )}
                onAddInfo={wrapServiceHandler(
                  () => addContactInfo({ icon: '', title: '', details: '' }),
                  'Contact info added',
                  'Failed to add contact info'
                )}
                onUpdateInfo={(id, updates) => wrapServiceHandler(
                  () => updateContactInfo(id, updates),
                  'Contact info updated',
                  'Failed to update contact info'
                )()}
                onDeleteInfo={id => wrapServiceHandler(
                  () => deleteContactInfo(id),
                  'Contact info deleted',
                  'Failed to delete contact info'
                )()}
                onReorderInfo={ids => wrapServiceHandler(
                  () => reorderContactInfo(ids),
                  'Contact info reordered',
                  'Failed to reorder contact info'
                )()}
              />
            )}
          </TabsContent>
          
          <TabsContent value="hero" className="space-y-6">
            {heroLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading hero section...</p>
              </div>
            ) : heroError ? (
              <div className="text-center py-12 text-red-500">{heroError}</div>
            ) : (
              <HeroManager
                hero={hero}
                onUpdate={wrapServiceHandler(
                  () => updateHero({}),
                  'Hero updated',
                  'Failed to update hero'
                )}
              />
            )}
          </TabsContent>

          <TabsContent value="import-export" className="space-y-6">
            <ImportExport onExport={handleExport} onImport={handleImport} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminCRUD;