import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch Categories
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .order('id', { ascending: true });

        if (catError) throw catError;

        // Fetch Products
        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .select('*')
          .order('id', { ascending: true });

        if (prodError) throw prodError;

        const formattedCategories = (catData || []).map(c => ({
            ...c,
            image: c.image_url
        }));
        setCategories(formattedCategories);
        
        // Transform products to match our internal structure if needed (e.g. categoryId mapping)
        // Ensure column names from Supabase match what components expect (camelCase vs snake_case)
        const formattedProducts = (prodData || []).map(p => ({
            ...p,
            categoryId: p.category_id, // Map snake_case from DB to camelCase used in app
            image: p.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop', // Fallback image
            discountPrice: p.discount_price,
            isPopular: p.is_popular,
            isAvailable: p.stock > 0
        }));

        setProducts(formattedProducts);
      } catch (err) {
        console.error('Supabase fetch error:', err);
        setError('Ma\'lumotlarni yuklashda xatolik yuz berdi');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getPopularProducts = () => products.filter(p => p.isPopular);
  const getProductsByCategory = (catId) => products.filter(p => p.categoryId === catId);

  return (
    <ProductContext.Provider value={{
      products,
      categories,
      loading,
      error,
      getPopularProducts,
      getProductsByCategory
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
