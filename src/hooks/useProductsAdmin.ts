import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/database';
import { toast } from '@/hooks/use-toast';

export interface ProductInput {
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  category: string;
  image_url?: string;
  is_visible?: boolean;
  is_on_sale?: boolean;
  stock: number;
}

export const useProductsAdmin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async (includeHidden: boolean = true) => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase.from('products').select('*');
      
      if (!includeHidden) {
        query = query.eq('is_visible', true);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error cargando productos';
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: ProductInput): Promise<Product | null> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Producto creado correctamente",
      });

      await loadProducts();
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error creando producto';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateProduct = async (id: string, productData: Partial<ProductInput>): Promise<Product | null> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...productData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Producto actualizado correctamente",
      });

      await loadProducts();
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error actualizando producto';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Producto eliminado correctamente",
      });

      await loadProducts();
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error eliminando producto';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleProductVisibility = async (id: string, isVisible: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          is_visible: isVisible,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: `Producto ${isVisible ? 'mostrado' : 'ocultado'} correctamente`,
      });

      await loadProducts();
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error actualizando visibilidad';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleProductSale = async (id: string, isOnSale: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          is_on_sale: isOnSale,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: `Producto ${isOnSale ? 'puesto en oferta' : 'quitado de oferta'} correctamente`,
      });

      await loadProducts();
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error actualizando oferta';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return false;
    }
  };

  const updateStock = async (id: string, newStock: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          stock: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Stock actualizado correctamente",
      });

      await loadProducts();
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error actualizando stock';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return false;
    }
  };

  const getProductById = (id: string): Product | undefined => {
    return products.find(product => product.id === id);
  };

  const getProductsByCategory = (category: string): Product[] => {
    return products.filter(product => product.category === category);
  };

  const getCategories = (): string[] => {
    const categories = products.map(product => product.category);
    return Array.from(new Set(categories)).sort();
  };

  const searchProducts = (query: string): Product[] => {
    const searchTerm = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductVisibility,
    toggleProductSale,
    updateStock,
    getProductById,
    getProductsByCategory,
    getCategories,
    searchProducts,
    refetch: loadProducts
  };
}; 