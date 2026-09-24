import { Link } from "react-router";
import { Store } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Store className="size-4 text-muted-foreground" />
          <span className="text-sm font-semibold">MyShop</span>
          <span className="text-sm text-muted-foreground">
            A beginner-friendly ecommerce demo.
          </span>
        </div>
        <nav className="flex gap-6 text-sm text-muted-foreground">
          <Link to="/products" className="hover:text-foreground">
            Products
          </Link>
          <Link to="/cart" className="hover:text-foreground">
            Cart
          </Link>
        </nav>
      </div>
    </footer>
  );
}