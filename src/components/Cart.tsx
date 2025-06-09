import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

export const Cart = () => {
  const { user } = useAuth();
  const {
    cartItems,
    loading,
    updateCartItem,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice
  } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    updateCartItem(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
  };

  const handleClearCart = () => {
    clearCart();
  };

  if (!user) {
    return (
      <Button variant="outline" size="sm" disabled>
        <ShoppingCart className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {totalItems > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrito de Compras
          </SheetTitle>
          <SheetDescription>
            {totalItems === 0 
              ? "Tu carrito está vacío" 
              : `${totalItems} ${totalItems === 1 ? 'producto' : 'productos'} en tu carrito`
            }
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex-1 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                Tu carrito está vacío
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Agrega productos para comenzar a comprar
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {cartItems.map((item) => (
                  <Card key={item.id} className="p-3">
                    <div className="flex items-center space-x-3">
                      {item.products.image_url && (
                        <img
                          src={item.products.image_url}
                          alt={item.products.name}
                          className="h-16 w-16 object-cover rounded-md"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {item.products.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          ${item.products.price.toFixed(2)}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-medium min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 ml-auto"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${(item.products.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-xl font-bold">${totalPrice.toFixed(2)}</span>
                </div>

                <div className="space-y-2">
                  <Button className="w-full" size="lg">
                    Proceder al Pago
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleClearCart}
                  >
                    Vaciar Carrito
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}; 