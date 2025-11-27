/* eslint-disable react-hooks/exhaustive-deps */
// app/admin/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Settings, Edit, Download, Briefcase, Mail, Image as ImageIcon, Phone } from 'lucide-react';
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
import { EmailSettingsManager } from '@/components/admin/EmailSettingsManager';
import { useEmailSettings } from '@/hooks/useEmailSettings';

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

  // Listen for refetch events from child components
  useEffect(() => {
    const handleRefetch = () => {
      fetchCategories(currentPage, searchQuery);
    };

    window.addEventListener('refetchCategories', handleRefetch);
    
    return () => {
      window.removeEventListener('refetchCategories', handleRefetch);
    };
  }, [currentPage, searchQuery]);

  // Search handler
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
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
    
    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subcategories: updatedSubs }),
      });
      
      if (!res.ok) throw new Error('Failed to update subcategory');
      
      setCategories(prevCategories => 
        prevCategories.map(cat => 
          cat.id === categoryId 
            ? { ...cat, subcategories: updatedSubs }
            : cat
        )
      );
      
      showNotification('Subcategory updated successfully');
    } catch (error) {
      console.error(error);
      showNotification('Failed to update subcategory', 'error');
      throw error;
    }
  };

  const deleteSubcategory = async (categoryId: string, subId: string) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) return;
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    const updatedSubs = category.subcategories.filter((sub: any) => sub.id !== subId);
    await updateCategory(categoryId, { subcategories: updatedSubs });
    showNotification('Subcategory deleted successfully');
  };

  //=============HOOKS============

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
    localData,
  } = useDataEditor(categories, updateSubcategory, showNotification);

  const { 
    services, 
    loading: servicesLoading, 
    createService, 
    updateService, 
    deleteService, 
    reorderServices 
  } = useServices();

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

  const {
    contact,
    loading: contactLoading,
    error: contactError,
    updateContact,
    addContactInfo,
    updateContactInfo,
    deleteContactInfo,
    reorderContactInfo,
  } = useContact(session?.user?.id || null);

  const {
    hero,
    loading: heroLoading,
    error: heroError,
    updateHero,
  } = useHero(session?.user?.id || null);

  const {
    settings: emailSettings,
    loading: emailLoading,
    error: emailError,
    saveSettings: saveEmailSettings,
    sendTestEmail,
  } = useEmailSettings();

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

  const handleEditSubcategory = (categoryId: string, subId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(subId);
    setActiveTab('data');
  };

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

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          {/* Tab Navigation - Horizontal Scrollable on Mobile */}
          <div className="w-full overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-max min-w-full sm:w-full sm:grid sm:grid-cols-4 lg:grid-cols-9 h-auto gap-1">
              <TabsTrigger value="dashboard" className="flex items-center justify-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm">
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span>Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center justify-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm">
                <Briefcase className="w-4 h-4 shrink-0" />
                <span>Services</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center justify-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm">
                <Settings className="w-4 h-4 shrink-0" />
                <span>Categories</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center justify-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm">
                <Edit className="w-4 h-4 shrink-0" />
                <span>Data</span>
              </TabsTrigger>
              <TabsTrigger value="about" className="flex items-center justify-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm">
                <Settings className="w-4 h-4 shrink-0" />
                <span>About</span>
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center justify-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm">
                <Phone className="w-4 h-4 shrink-0" />
                <span>Contact</span>
              </TabsTrigger>
              <TabsTrigger value="hero" className="flex items-center justify-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm">
                <ImageIcon className="w-4 h-4 shrink-0" />
                <span>Hero</span>
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center justify-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm">
                <Mail className="w-4 h-4 shrink-0" />
                <span>Email</span>
              </TabsTrigger>
              <TabsTrigger value="import-export" className="flex items-center justify-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm">
                <Download className="w-4 h-4 shrink-0" />
                <span>Import</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tabs Content */}
          <TabsContent value="dashboard" className="space-y-4 sm:space-y-6">
            <DashboardStats categories={categories} />
            <QuickActions 
              onAddCategory={addCategory} 
              onExport={handleExport} 
              onImport={handleImport} 
              onEditPrices={() => setActiveTab('data')} 
            />
          </TabsContent>

          <TabsContent value="services" className="space-y-4 sm:space-y-6">
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

          <TabsContent value="categories" className="space-y-4 sm:space-y-6">
            <CategorySearch 
              onSearch={handleSearch}
              placeholder="Search categories..."
            />

            {searchQuery && (
              <div className="text-xs sm:text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
                Showing {categories.length} of {totalCategories} matching &quot;{searchQuery}&quot;
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

            {/* Pagination - Mobile Optimized */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded disabled:opacity-40"
              >
                Prev
              </button>

              {(() => {
                const pages = [];
                const maxShown = window.innerWidth < 640 ? 3 : 5;

                let start = Math.max(1, currentPage - Math.floor(maxShown / 2));
                const end = Math.min(totalPages, start + maxShown - 1);

                if (end - start < maxShown - 1) {
                  start = Math.max(1, end - maxShown + 1);
                }

                if (start > 1) {
                  pages.push(1);
                  if (start > 2) pages.push('ellipsis-start');
                }

                for (let i = start; i <= end; i++) pages.push(i);

                if (end < totalPages) {
                  if (end < totalPages - 1) pages.push('ellipsis-end');
                  pages.push(totalPages);
                }

                return pages.map((p, idx) =>
                  typeof p === 'string' ? (
                    <span key={idx} className="px-1 sm:px-2 text-gray-400 select-none text-xs sm:text-sm">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded ${
                        p === currentPage ? 'bg-primary text-white border-primary' : ''
                      }`}
                    >
                      {p}
                    </button>
                  )
                );
              })()}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-4 sm:space-y-6">
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
              onUpdateSubcategory={updateSubcategory}
              localData={localData}
            />
          </TabsContent>

          <TabsContent value="about" className="space-y-4 sm:space-y-6">
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
                onUpdate={async (updates) => {
                  try {
                    await updateAbout(updates);
                    showNotification('About updated successfully');
                    // CRITICAL: Emit event after successful update
                    window.dispatchEvent(new Event('aboutUpdated'));
                  } catch (error) {
                    console.error('Error updating about:', error);
                    showNotification('Failed to update About', 'error');
                  }
                }}
                onAddFeature={async (feature) => {
                  try {
                    await addFeature(feature);
                    showNotification('Feature added successfully');
                    window.dispatchEvent(new Event('aboutUpdated'));
                  } catch (error) {
                    console.error('Error adding feature:', error);
                    showNotification('Failed to add feature', 'error');
                  }
                }}
                onUpdateFeature={async (id, text) => {
                  try {
                    await updateFeature(id, text);
                    showNotification('Feature updated successfully');
                    window.dispatchEvent(new Event('aboutUpdated'));
                  } catch (error) {
                    console.error('Error updating feature:', error);
                    showNotification('Failed to update feature', 'error');
                  }
                }}
                onDeleteFeature={async (id) => {
                  try {
                    await deleteFeature(id);
                    showNotification('Feature deleted successfully');
                    window.dispatchEvent(new Event('aboutUpdated'));
                  } catch (error) {
                    console.error('Error deleting feature:', error);
                    showNotification('Failed to delete feature', 'error');
                  }
                }}
                onReorderFeatures={async (ids) => {
                  try {
                    await reorderFeatures(ids);
                    showNotification('Features reordered successfully');
                    window.dispatchEvent(new Event('aboutUpdated'));
                  } catch (error) {
                    console.error('Error reordering features:', error);
                    showNotification('Failed to reorder features', 'error');
                  }
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="contact" className="space-y-4 sm:space-y-6">
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
          
          <TabsContent value="hero" className="space-y-4 sm:space-y-6">
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
                onUpdate={async (updates) => {
                  try {
                    await updateHero(updates);
                    showNotification('Hero updated successfully');
                  } catch (error) {
                    console.error('Error updating hero:', error);
                    showNotification('Failed to update hero', 'error');
                  }
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="email" className="space-y-4 sm:space-y-6">
            {emailLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading email settings...</p>
              </div>
            ) : emailError ? (
              <div className="text-center py-12 text-red-500">{emailError}</div>
            ) : (
              <EmailSettingsManager
                settings={emailSettings}
                loading={emailLoading}
                onSave={async (settings) => {
                  try {
                    await saveEmailSettings(settings);
                    showNotification('Email settings saved successfully');
                    return { success: true };
                  } catch (error: any) {
                    showNotification(error.message || 'Failed to save email settings', 'error');
                    throw error;
                  }
                }}
                onTestEmail={async (email) => {
                  try {
                    await sendTestEmail(email);
                    showNotification('Test email sent successfully');
                    return { success: true };
                  } catch (error: any) {
                    showNotification(error.message || 'Failed to send test email', 'error');
                    throw error;
                  }
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="import-export" className="space-y-4 sm:space-y-6">
            <ImportExport onExport={handleExport} onImport={handleImport} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminCRUD;