import { NavLink, Outlet } from "react-router";

function AdminLayout() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-sm ${
      isActive ? "bg-black text-white" : "text-gray-600 hover:bg-gray-200"
    }`;

  return (
    <div className="flex gap-8">
      <aside className="w-48 shrink-0 space-y-4">
        <h2 className="text-lg font-bold">Admin</h2>

        <nav className="flex flex-col gap-1">
          <NavLink to="/admin/products" className={linkClass}>
            Products
          </NavLink>

          <NavLink to="/admin/orders" className={linkClass}>
            Orders
          </NavLink>

          <NavLink to="/" className={linkClass} end>
            ← Back to shop
          </NavLink>
        </nav>
      </aside>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;