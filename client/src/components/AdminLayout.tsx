import { NavLink, Outlet } from "react-router";
import { cn } from "../lib/utils";

function AdminLayout() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
      isActive
        ? "bg-accent text-accent-foreground"
        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
    );

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <aside className="shrink-0 lg:w-48">
        <h2 className="px-3 text-lg font-semibold tracking-tight">Admin</h2>

        <nav className="mt-4 flex flex-row gap-1 lg:flex-col">
          <NavLink to="/admin/products" className={linkClass}>
            Products
          </NavLink>

          <NavLink to="/admin/orders" className={linkClass}>
            Orders
          </NavLink>

          <NavLink to="/" end className={linkClass}>
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
