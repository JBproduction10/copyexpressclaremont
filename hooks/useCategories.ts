//hooks/useCategories.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface UseCategoriesOptions {
  initialPage?: number;
  limit?: number;
  autoFetch?: boolean;
}

export const useCategories = (
  token: string | null, 
  options: UseCategoriesOptions = {}
) => {
  const { 
    initialPage = 1, 
    limit = 10, 
    autoFetch = true 
  } = options;

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: initialPage,
    limit,
    total: 0,
    pages: 1
  });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCategories = async (page = currentPage, search = searchQuery) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      });

      const response = await fetch(`/api/categories?${params}`);
      
      if (!response.ok) throw new Error('Failed to fetch categories');
      
      const data = await response.json();
      setCategories(data.categories);
      setPagination(data.pagination);
      setCurrentPage(page);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchCategories();
    }
  }, []);

  const createCategory = async (category: any) => {
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(category)
    });

    if (!response.ok) throw new Error('Failed to create category');
    
    const data = await response.json();
    await fetchCategories(currentPage, searchQuery);
    return data.category;
  };

  const updateCategory = async (id: string, updates: any) => {
    const response = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) throw new Error('Failed to update category');
    
    await fetchCategories(currentPage, searchQuery);
  };

  const deleteCategory = async (id: string) => {
    const response = await fetch(`/api/categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to delete category');
    
    // If deleting last item on page and not first page, go to previous page
    if (categories.length === 1 && currentPage > 1) {
      await fetchCategories(currentPage - 1, searchQuery);
    } else {
      await fetchCategories(currentPage, searchQuery);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.pages) {
      fetchCategories(page, searchQuery);
    }
  };

  const nextPage = () => {
    if (currentPage < pagination.pages) {
      goToPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const search = (query: string) => {
    setSearchQuery(query);
    fetchCategories(1, query);
  };

  return {
    categories,
    loading,
    error,
    pagination,
    currentPage,
    searchQuery,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: () => fetchCategories(currentPage, searchQuery),
    goToPage,
    nextPage,
    previousPage,
    search
  };
};