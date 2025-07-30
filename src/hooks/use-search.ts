
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from './use-error-handler';

interface SearchFilters {
  type?: 'products' | 'blogs' | 'templates' | 'all';
  published?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export function useSearch() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const { handleError } = useErrorHandler();

  const searchProducts = async (query: string, filters: SearchFilters = {}) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('published', filters.published ?? true)
      .gte('price', filters.minPrice ?? 0)
      .lte('price', filters.maxPrice ?? 999999)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const searchBlogs = async (query: string, filters: SearchFilters = {}) => {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .eq('published', filters.published ?? true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const searchTemplates = async (query: string, filters: SearchFilters = {}) => {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('published', filters.published ?? true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const search = useCallback(async (query: string, filters: SearchFilters = {}) => {
    if (!query.trim()) {
      setResults([]);
      setTotalCount(0);
      return;
    }

    setLoading(true);
    try {
      let searchResults: any[] = [];

      if (filters.type === 'products' || filters.type === 'all' || !filters.type) {
        const products = await searchProducts(query, filters);
        searchResults = [...searchResults, ...products.map(p => ({ ...p, type: 'product' }))];
      }

      if (filters.type === 'blogs' || filters.type === 'all' || !filters.type) {
        const blogs = await searchBlogs(query, filters);
        searchResults = [...searchResults, ...blogs.map(b => ({ ...b, type: 'blog' }))];
      }

      if (filters.type === 'templates' || filters.type === 'all' || !filters.type) {
        const templates = await searchTemplates(query, filters);
        searchResults = [...searchResults, ...templates.map(t => ({ ...t, type: 'template' }))];
      }

      setResults(searchResults);
      setTotalCount(searchResults.length);
    } catch (error) {
      handleError(error, { title: 'Search failed' });
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  return {
    results,
    loading,
    totalCount,
    search
  };
}
