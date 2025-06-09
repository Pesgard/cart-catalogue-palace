
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { Product, CartItem } from "@/types/database";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import CartSidebar from "@/components/CartSidebar";

const categories = ["todos", "electrónicos", "ropa", "hogar", "deportes", "accesorios"];

const Index = () => {
  const { products, loading: productsLoading } = useProducts();
  const { user, loading: authLoading } = useAuth();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [cartItems, setCartItems] = useState<(CartItem & { products: Product })[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();

  // Filtrar productos
  useEffect(() => {
    let filtered = products;
    
    if (selectedCategory !== "todos") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm]);

  // Cargar carrito del usuario
  useEffect(() => {
    if (user) {
      loadCartItems();
    } else {
      setCartItems([]);
    }
  }, [user]);

  const loadCartItems = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const addToCart = async (product: Product) => {
    if (!user) {
      toast({
        title: "Iniciar sesión requerido",
        description: "Debes iniciar sesión para agregar productos al carrito",
        variant: "destructive"
      });
      return;
    }

    try {
      const existingItem = cartItems.find(item => item.product_id === product.id);
      
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          toast({
            title: "Stock insuficiente",
            description: "No hay más unidades disponibles",
            variant: "destructive"
          });
          return;
        }

        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: 1
          });

        if (error) throw error;
      }

      await loadCartItems();
      toast({
        title: "Producto agregado",
        description: `${product.name} se agregó al carrito`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito",
        variant: "destructive"
      });
    }
  };

  const updateCartItemQuantity = async (cartItemId: string, newQuantity: number) => {
    if (!user) return;

    try {
      if (newQuantity === 0) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', cartItemId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', cartItemId);

        if (error) throw error;
      }

      await loadCartItems();
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.products.price * item.quantity), 0);
  };

  if (authLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header 
        cartItemsCount={getTotalItems()}
        onCartClick={() => setIsCartOpen(true)}
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* Filtros y búsqueda */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron productos</p>
          </div>
        )}
      </main>

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems.map(item => ({
          id: item.products.id,
          name: item.products.name,
          price: item.products.price,
          image_url: item.products.image_url,
          quantity: item.quantity,
          stock: item.products.stock
        }))}
        onUpdateQuantity={(productId, quantity) => {
          const cartItem = cartItems.find(item => item.products.id === productId);
          if (cartItem) {
            updateCartItemQuantity(cartItem.id, quantity);
          }
        }}
        totalPrice={getTotalPrice()}
      />
    </div>
  );
};

export default Index;
