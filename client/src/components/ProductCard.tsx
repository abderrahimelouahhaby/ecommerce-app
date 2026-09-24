import { Link } from "react-router";
import { Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "../types/product";
import { formatPrice } from "../lib/formatPrice";
import { useCartStore } from "../store/cartStore";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

type ProductCardProps = {
  product: Product;
};

function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAdd = () => {
    if (product.stock <= 0) return;
    addToCart(product);
    toast.success(`Added ${product.name} to cart`);
  };

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ShoppingBag className="size-8" />
            </div>
          )}

          {product.stock <= 0 && (
            <Badge variant="destructive" className="absolute left-3 top-3">
              Out of stock
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link to={`/products/${product.id}`}>
          <h2 className="line-clamp-1 font-semibold hover:underline">
            {product.name}
          </h2>
        </Link>

        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {product.description}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-lg font-bold">{formatPrice(product.price)}</span>

          <Button
            type="button"
            size="sm"
            variant={product.stock > 0 ? "default" : "outline"}
            disabled={product.stock <= 0}
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus className="size-4" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProductCard;