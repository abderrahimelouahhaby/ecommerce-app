import { Link, useNavigate } from "react-router";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import api from "../lib/api";

export default function Navbar() {
  const navigate = useNavigate();
  const totalItems = useCartStore((state) => state.totalItems());
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore: clear the local session regardless.
    }

    logout();
    navigate("/");
  };

  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-2xl font-bold">
          MyShop
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/">Home</Link>

          <Link to="/products">Products</Link>

          <Link to="/cart">Cart ({totalItems})</Link>

          {user ? (
            <div className="flex items-center gap-4">
                 <Link to="/orders">
      My Orders
    </Link>
              <span>
                {user.firstName} {user.lastName}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="text-sm text-red-600"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}