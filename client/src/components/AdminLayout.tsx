import { Link, Outlet } from "react-router";

function AdminLayout() {
  return (
    <div className="flex gap-8">
      <aside className="w-48 shrink-0 space-y-4">
        <h2 className="text-lg font-bold">Admin</h2>

        <nav className="flex flex-col gap-1">
          <Link
            to="/admin/products"
            className="rounded-md bg-black px-3 py-2 text-sm text-white hover:bg-gray-800"
          >
            Products
          </Link>

          <Link
            to="/admin/orders"
            className="rounded-md px-3 py-2 text-sm text-gray-400"
          >
            Orders
          </Link>

          <Link
            to="/"
            className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-200"
          >
            ← Back to shop
          </Link>
        </nav>
      </aside>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;