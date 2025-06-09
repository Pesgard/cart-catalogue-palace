
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Upload, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

// Mock data para administración
const mockAdminProducts = [
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
  }
];

const Admin = () => {
  const [products, setProducts] = useState(mockAdminProducts);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    originalPrice: "",
    category: "",
    description: "",
    stock: "",
    isVisible: true,
    isOnSale: false
  });
  const { toast } = useToast();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProduct = () => {
    if (selectedProduct) {
      // Editar producto existente
      setProducts(products.map(p => 
        p.id === selectedProduct.id 
          ? { ...p, ...formData, price: parseFloat(formData.price) }
          : p
      ));
      toast({
        title: "Producto actualizado",
        description: "Los cambios se han guardado correctamente",
      });
    } else {
      // Crear nuevo producto
      const newProduct = {
        id: Date.now(),
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400"
      };
      setProducts([...products, newProduct]);
      toast({
        title: "Producto creado",
        description: "El nuevo producto se ha agregado al catálogo",
      });
    }
    
    // Limpiar formulario
    setFormData({
      name: "",
      price: "",
      originalPrice: "",
      category: "",
      description: "",
      stock: "",
      isVisible: true,
      isOnSale: false
    });
    setSelectedProduct(null);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || "",
      category: product.category,
      description: product.description,
      stock: product.stock.toString(),
      isVisible: product.isVisible,
      isOnSale: product.isOnSale
    });
  };

  const toggleProductVisibility = (productId) => {
    setProducts(products.map(p => 
      p.id === productId 
        ? { ...p, isVisible: !p.isVisible }
        : p
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header cartItemsCount={0} onCartClick={() => {}} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
          <p className="text-gray-600">Gestiona productos, precios y ofertas</p>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Gestión de Productos</TabsTrigger>
            <TabsTrigger value="add-product">Agregar Producto</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map(product => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-gray-600">{product.category}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="font-bold text-blue-600">${product.price}</span>
                            {product.isOnSale && (
                              <Badge variant="destructive">En oferta</Badge>
                            )}
                            {!product.isVisible && (
                              <Badge variant="secondary">Oculto</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleProductVisibility(product.id)}
                        >
                          {product.isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-product" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedProduct ? "Editar Producto" : "Agregar Nuevo Producto"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del producto</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Nombre del producto"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange("category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electrónicos">Electrónicos</SelectItem>
                        <SelectItem value="ropa">Ropa</SelectItem>
                        <SelectItem value="hogar">Hogar</SelectItem>
                        <SelectItem value="deportes">Deportes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Precio</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Precio original (opcional)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      step="0.01"
                      value={formData.originalPrice}
                      onChange={(e) => handleInputChange("originalPrice", e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => handleInputChange("stock", e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Imagen del producto</Label>
                    <Button variant="outline" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Subir imagen
                    </Button>
                    <p className="text-xs text-gray-500">
                      En producción se integrará con Supabase Storage
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Descripción del producto"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isVisible"
                      checked={formData.isVisible}
                      onCheckedChange={(checked) => handleInputChange("isVisible", checked)}
                    />
                    <Label htmlFor="isVisible">Producto visible</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isOnSale"
                      checked={formData.isOnSale}
                      onCheckedChange={(checked) => handleInputChange("isOnSale", checked)}
                    />
                    <Label htmlFor="isOnSale">En oferta</Label>
                  </div>
                </div>

                <Button onClick={handleSaveProduct} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {selectedProduct ? "Actualizar Producto" : "Agregar Producto"}
                </Button>

                {selectedProduct && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedProduct(null);
                      setFormData({
                        name: "",
                        price: "",
                        originalPrice: "",
                        category: "",
                        description: "",
                        stock: "",
                        isVisible: true,
                        isOnSale: false
                      });
                    }}
                    className="w-full"
                  >
                    Cancelar Edición
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
