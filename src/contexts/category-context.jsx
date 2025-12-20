'use client'

import { createContext, useContext, useCallback, useReducer, useEffect, useRef, useMemo } from 'react';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const initialState = {
  categories: [],
  loading: false,
  error: null,
  lastFetched: null,
};

const CategoryContext = createContext(undefined);

// ----------------------------------------------------------------------

const categoryReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_CATEGORIES':
      return {
        ...state,
        categories: action.payload,
        loading: false,
        error: null,
        lastFetched: Date.now()
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, action.payload].sort((a, b) => {
          if (a.isMain !== b.isMain) return b.isMain - a.isMain;
          if (a.mainCategory !== b.mainCategory) return a.mainCategory.localeCompare(b.mainCategory);
          return a.name.localeCompare(b.name);
        })
      };
    case 'REMOVE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(cat => cat.name !== action.payload)
      };
    case 'CLEAR_CATEGORIES':
      return initialState;
    default:
      return state;
  }
};

// ----------------------------------------------------------------------

export function CategoryProvider({ children }) {
  const [state, dispatch] = useReducer(categoryReducer, initialState);
  const { user } = useAuthContext();
  const hasFetchedRef = useRef(false);
  const fetchingRef = useRef(false);

  // Stable fetch function that doesn't change
  const fetchCategories = useCallback(async (forceRefresh = false) => {
    if (fetchingRef.current) return; // Prevent concurrent fetches

    const selectedCompany = localStorage.getItem('selectedCompany');
    if (!selectedCompany) return;

    if (!forceRefresh && hasFetchedRef.current) return;

    try {
      fetchingRef.current = true;
      const company = JSON.parse(selectedCompany);

      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await axiosInstance.get(endpoints.categories.list, {
        params: { companyId: company._id }
      });

      if (response.data.success) {
        dispatch({ type: 'SET_CATEGORIES', payload: response.data.data.categories });
        hasFetchedRef.current = true;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  // Stable functions that don't change
  const createCustomCategory = useCallback(async (categoryData) => {
    const selectedCompany = localStorage.getItem('selectedCompany');
    if (!selectedCompany) throw new Error('No company selected');

    const company = JSON.parse(selectedCompany);
    const response = await axiosInstance.post(endpoints.categories.createCustom, {
      companyId: company._id,
      ...categoryData
    });

    if (response.data.success) {
      dispatch({ type: 'ADD_CATEGORY', payload: response.data.data.category });
      return response.data.data.category;
    }
    throw new Error('Failed to create category');
  }, []);

  const deleteCustomCategory = useCallback(async (categoryName) => {
    const selectedCompany = localStorage.getItem('selectedCompany');
    if (!selectedCompany) throw new Error('No company selected');

    const company = JSON.parse(selectedCompany);
    const response = await axiosInstance.delete(endpoints.categories.delete, {
      data: { companyId: company._id, categoryName }
    });

    if (response.data.success) {
      dispatch({ type: 'REMOVE_CATEGORY', payload: categoryName });
      return true;
    }
    throw new Error('Failed to delete category');
  }, []);

  const clearCategories = useCallback(() => {
    dispatch({ type: 'CLEAR_CATEGORIES' });
    hasFetchedRef.current = false;
  }, []);

  // Fetch categories when user changes
  useEffect(() => {
    if (user && !hasFetchedRef.current) {
      fetchCategories();
    } else if (!user) {
      clearCategories();
    }
  }, [user, fetchCategories, clearCategories]);

  // Listen for company changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'selectedCompany') {
        clearCategories();
        if (e.newValue) {
          setTimeout(() => fetchCategories(true), 100);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchCategories, clearCategories]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    ...state,
    fetchCategories,
    createCustomCategory,
    deleteCustomCategory,
    clearCategories,
  }), [state, fetchCategories, createCustomCategory, deleteCustomCategory, clearCategories]);

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}

// ----------------------------------------------------------------------

export const useCategoryContext = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategoryContext must be used within a CategoryProvider');
  }
  return context;
};