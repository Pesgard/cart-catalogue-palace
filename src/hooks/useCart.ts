import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CartItem, Product } from '@/types/database';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export const useCart = () => {
  const [cartItems, setCartItems] = useState<(CartItem & { products: Product })[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadCart = async () => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products:product_id (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filtrar items que tienen productos válidos
      const validItems = (data || []).filter(item => item.products) as (CartItem & { products: Product })[];
      setCartItems(validItems);
    } catch (error) {
      console.error('Error loading cart:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el carrito",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para agregar productos al carrito",
        variant: "destructive",
      });
      return;
    }

    try {
      // Verificar si el producto ya está en el carrito
      const existingItem = cartItems.find(item => item.product_id === productId);

      if (existingItem) {
        // Actualizar cantidad
        await updateCartItem(existingItem.id, existingItem.quantity + quantity);
      } else {
        // Agregar nuevo item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity
          });

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Producto agregado al carrito",
        });

        await loadCart();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito",
        variant: "destructive",
      });
    }
  };

  const updateCartItem = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Cantidad actualizada",
      });

      await loadCart();
    } catch (error) {
      console.error('Error updating cart item:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la cantidad",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Producto eliminado del carrito",
      });

      await loadCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto del carrito",
        variant: "destructive",
      });
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Carrito vaciado",
      });

      await loadCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({
        title: "Error",
        description: "No se pudo vaciar el carrito",
        variant: "destructive",
      });
    }
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.products.price * item.quantity);
    }, 0);
  };

  const getCartItemQuantity = (productId: string) => {
    const item = cartItems.find(item => item.product_id === productId);
    return item ? item.quantity : 0;
  };

  useEffect(() => {
    loadCart();
  }, [user]);

  return {
    cartItems,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getCartItemQuantity,
    refetch: loadCart
  };
}; 