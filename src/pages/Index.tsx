
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Search, Filter, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import CartSidebar from "@/components/CartSidebar";

// Mock data para demostración
const mockProducts = [
  {
    id: 1,
    name: "Smartphone Premium",
    price: 899.99,
    originalPrice: 999.99,
    category: "electrónicos",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
    description: "El último smartphone con tecnología avanzada",
    isVisible: true,
    isOnSale: true,
    stock: 10
  },
  {
    id: 2,
    name: "Laptop Gaming",
    price: 1299.99,
    category: "electrónicos",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
    description: "Laptop de alto rendimiento para gaming",
    isVisible: true,
    isOnSale: false,
    stock: 5
  },
  {
    id: 3,
    name: "Camiseta Casual",
    price: 29.99,
    category: "ropa",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    description: "Camiseta cómoda para uso diario",
    isVisible: true,
    isOnSale: false,
    stock: 20
  },
  {
    id: 4,
    name: "Auriculares Bluetooth",
    price: 199.99,
    originalPrice: 249.99,
    category: "electrónicos",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    description: "Auriculares inalámbricos con cancelación de ruido",
    isVisible: true,
    isOnSale: true,
    stock: 15
  }
];

const categories = ["todos", "electrónicos", "ropa", "hogar", "deportes"];

const Index = () => {
  const [products, setProducts] = useState(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();

  // Filtrar productos
  useEffect(() => {
    let filtered = products.filter(product => product.isVisible);
    
    if (selectedCategory !== "todos") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm]);

  const addToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast({
          title: "Stock insuficiente",
          description: "No hay más unidades disponibles",
          variant: "destructive"
        });
        return;
      }
      setCartItems(cartItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
    
    toast({
      title: "Producto agregado",
      description: `${product.name} se agregó al carrito`,
    });
  };

  const updateCartItemQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      setCartItems(cartItems.filter(item => item.id !== productId));
    } else {
      setCartItems(cartItems.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

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
        cartItems={cartItems}
        onUpdateQuantity={updateCartItemQuantity}
        totalPrice={getTotalPrice()}
      />
    </div>
  );
};

export default Index;
