import { Link } from "react-router";
import { useCartStore } from "../store/cartStore";

export default function Navbar() {
  const totalItems = useCartStore(
    (state) => state.totalItems()
  );

  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="text-2xl font-bold"
        >
          MyShop
        </Link>

        <div className="flex gap-6">
          <Link to="/">Home</Link>

          <Link to="/products">
            Products
          </Link>

          <Link to="/cart">
            Cart ({totalItems})
          </Link>
        </div>
      </nav>
    </header>
  );
}