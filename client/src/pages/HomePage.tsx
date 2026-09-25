import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  Headphones,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import api from "../lib/api";
import type { Product } from "../types/product";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ProductCardSkeleton";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

type ListResponse = {
  data: {
    items: Product[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  };
};

const valueProps = [
  {
    icon: Truck,
    title: "Fast shipping",
    text: "Orders are processed quickly and tracked end to end.",
  },
  {
    icon: RotateCcw,
    title: "Easy returns",
    text: "Changed your mind? Cancellations are simple while pending.",
  },
  {
    icon: ShieldCheck,
    title: "Secure checkout",
    text: "Your session is protected and checkout is server-verified.",
  },
  {
    icon: Headphones,
    title: "Friendly support",
    text: "A real shopkeeper behind the counter — this is MyShop.",
  },
];

function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadNewArrivals() {
      try {
        const response = await api.get<ListResponse>("/products", {
          params: { sort: "newest", page: "1", limit: "4" },
        });
        if (!ignore) setProducts(response.data.data.items);
      } catch {
        // The hero still works without this section; ignore quietly.
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadNewArrivals();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-16">
      {/* Hero */}
      <section className="rounded-2xl border bg-gradient-to-b from-muted/60 to-background px-6 py-16 text-center sm:py-20">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          A starter storefront
        </p>
        <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Welcome to MyShop
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Browse the catalog, build a cart, and place an order — a
          beginner-friendly full-stack ecommerce demo, end to end.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/products">
              Browse products
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/cart">View cart</Link>
          </Button>
        </div>
      </section>

      {/* Value props */}
      <section>
        <h2 className="text-2xl font-bold tracking-tight">Why shop with us</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {valueProps.map(({ icon: Icon, title, text }) => (
            <Card key={title}>
              <CardContent className="p-5">
                <Icon className="size-6 text-muted-foreground" />
                <h3 className="mt-3 font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      <section>
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">New arrivals</h2>
            <p className="mt-1 text-muted-foreground">
              The latest items in the shop.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/products">
              View all
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default HomePage;
