import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ShoppingBag, Sparkles, Package, Star } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { Product } from "@/types/database";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";

const categories = ["todos", "electrónicos", "ropa", "hogar", "deportes", "accesorios"];

const Index = () => {
  const { products, loading: productsLoading } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");

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

  const featuredProducts = products.filter(p => p.is_on_sale).slice(0, 4);
  const newProducts = products.slice(0, 8);

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando productos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Cart Catalogue Palace
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Descubre productos increíbles con los mejores precios y calidad garantizada
          </p>
          <Button size="lg" className="text-lg px-8 py-6">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Explorar Productos
          </Button>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="h-6 w-6 text-yellow-500" />
              <h2 className="text-3xl font-bold">Ofertas Especiales</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4" id="productos">
          <div className="flex items-center gap-2 mb-6">
            <Package className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Todos los Productos</h2>
            <Badge variant="secondary" className="ml-2">
              {filteredProducts.length} productos
            </Badge>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="capitalize">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              No se encontraron productos
            </h3>
            <p className="text-muted-foreground">
              Intenta ajustar los filtros o el término de búsqueda
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </main>

      {/* Categories Section */}
      <section className="bg-muted/50 py-16" id="categorias">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Explora por Categorías</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.slice(1).map((category) => {
              const categoryCount = products.filter(p => p.category === category).length;
              return (
                <Button
                  key={category}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 capitalize"
                  onClick={() => setSelectedCategory(category)}
                >
                  <Package className="h-6 w-6" />
                  <span className="text-sm">{category}</span>
                  <Badge variant="secondary" className="text-xs">
                    {categoryCount}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">
                {products.length}+
              </div>
              <p className="text-muted-foreground">Productos Disponibles</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">
                {categories.length - 1}
              </div>
              <p className="text-muted-foreground">Categorías</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">
                {featuredProducts.length}
              </div>
              <p className="text-muted-foreground">Ofertas Activas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <ShoppingBag className="h-8 w-8" />
            <span className="text-2xl font-bold">Cart Catalogue Palace</span>
          </div>
          <p className="text-gray-400">
            Tu tienda de confianza para encontrar los mejores productos
          </p>
          <div className="mt-8 text-sm text-gray-500">
            © 2024 Cart Catalogue Palace. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
