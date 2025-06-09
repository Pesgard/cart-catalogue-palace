import { useState } from 'react';
import { ShoppingCart, Heart, Eye, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/database';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

interface ProductCardProps {
  product: Product;
  onProductClick?: (product: Product) => void;
}

export const ProductCard = ({ product, onProductClick }: ProductCardProps) => {
  const { user } = useAuth();
  const { addToCart, getCartItemQuantity } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const cartQuantity = getCartItemQuantity(product.id);
  const isOutOfStock = product.stock <= 0;
  const hasDiscount = product.is_on_sale && product.original_price && product.original_price > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;

  const handleAddToCart = async () => {
    if (!user) {
      return;
    }

    setIsLoading(true);
    await addToCart(product.id, 1);
    setIsLoading(false);
  };

  const handleProductClick = () => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {hasDiscount && (
          <Badge variant="destructive" className="text-xs font-bold">
            -{discountPercentage}%
          </Badge>
        )}
        {isOutOfStock && (
          <Badge variant="secondary" className="text-xs">
            Sin Stock
          </Badge>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <Badge variant="outline" className="text-xs">
            Últimas {product.stock}
          </Badge>
        )}
      </div>

      {/* Quick Actions */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex flex-col gap-1">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              handleProductClick();
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden" onClick={handleProductClick}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Package className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
      </div>

      <CardContent className="p-4" onClick={handleProductClick}>
        <div className="space-y-2">
          {/* Category */}
          <Badge variant="outline" className="text-xs capitalize">
            {product.category}
          </Badge>

          {/* Product Name */}
          <h3 className="font-semibold text-lg line-clamp-2 min-h-[3.5rem]">
            {product.name}
          </h3>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.original_price!.toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock Info */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Package className="h-3 w-3" />
            <span>Stock: {product.stock}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="w-full space-y-2">
          {/* Add to Cart Button */}
          <Button
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={!user || isOutOfStock || isLoading}
            variant={cartQuantity > 0 ? "secondary" : "default"}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                {!user 
                  ? "Inicia Sesión" 
                  : isOutOfStock 
                    ? "Sin Stock" 
                    : cartQuantity > 0 
                      ? `En Carrito (${cartQuantity})` 
                      : "Agregar al Carrito"
                }
              </>
            )}
          </Button>

          {/* Quick Add */}
          {cartQuantity > 0 && (
            <div className="text-center text-xs text-muted-foreground">
              Tienes {cartQuantity} en tu carrito
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
