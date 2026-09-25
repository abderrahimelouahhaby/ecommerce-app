import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import api from "../lib/api";
import type { Product } from "../types/product";
import { useCartStore } from "../store/cartStore";
import { formatPrice } from "../lib/formatPrice";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";

function ProductDetailsPage() {
  const { id } = useParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchProduct() {
      try {
        const response = await api.get<{ data: Product }>(`/products/${id}`);
        if (!ignore) setProduct(response.data.data);
      } catch {
        if (!ignore) setError("Product not found.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchProduct();

    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <ShoppingBag className="mb-3 size-10 text-muted-foreground" />
        <p className="text-lg font-medium text-destructive">
          {error || "Product not found."}
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/products">Back to products</Link>
        </Button>
      </div>
    );
  }

  // key={product.id} remounts this content when navigating between products,
  // so the quantity always resets to 1.
  return <ProductDetailContent key={product.id} product={product} />;
}

type ProductDetailContentProps = {
  product: Product;
};

function ProductDetailContent({ product }: ProductDetailContentProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`Added ${quantity} × ${product.name} to cart`);
  };

  return (
    <article>
      <nav
        aria-label="Breadcrumb"
        className="mb-6 text-sm text-muted-foreground"
      >
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li>
            <ChevronRight className="size-3.5" />
          </li>
          <li>
            <Link to="/products" className="hover:text-foreground">
              Products
            </Link>
          </li>
          <li>
            <ChevronRight className="size-3.5" />
          </li>
          <li className="line-clamp-1 text-foreground">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="aspect-square bg-muted">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <ShoppingBag className="size-12" />
              </div>
            )}
          </div>
        </Card>

        <div className="flex flex-col">
          {product.stock > 0 ? (
            <Badge variant="secondary" className="w-fit">
              In stock · {product.stock}
            </Badge>
          ) : (
            <Badge variant="destructive" className="w-fit">
              Out of stock
            </Badge>
          )}

          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            {product.name}
          </h1>

          <p className="mt-4 text-3xl font-semibold">
            {formatPrice(product.price)}
          </p>

          <p className="mt-6 text-muted-foreground">{product.description}</p>

          {product.stock > 0 && (
            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center rounded-md border">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-4" />
                </Button>
                <span
                  className="w-10 text-center text-sm font-medium"
                  aria-live="polite"
                >
                  {quantity}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={quantity >= product.stock}
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock, q + 1))
                  }
                  aria-label="Increase quantity"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">
                {product.stock} available
              </span>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              disabled={product.stock <= 0}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="size-4" />
              {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/products">Back to products</Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
        <div className="mt-4 flex gap-3">
          <Skeleton className="h-11 w-40" />
          <Skeleton className="h-11 w-36" />
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsPage;
