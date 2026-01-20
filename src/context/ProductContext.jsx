import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchProducts } from '../api/products.api';
import { fetchCategories as apiFetchCategories } from '../api/categories.api';

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
        const [prodData, catData] = await Promise.all([
          fetchProducts(),
          apiFetchCategories()
        ]);
        setProducts(prodData);
        setCategories(catData);
      } catch (err) {
        setError('Ma\'lumotlarni yuklashda xatolik yuz berdi');
        console.error(err);
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
