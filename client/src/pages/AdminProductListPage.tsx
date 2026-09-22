import { useEffect, useState } from "react";
import { Link } from "react-router";
import axios from "axios";
import api from "../lib/api";
import { formatPrice } from "../lib/formatPrice";
import type { Product } from "../types/product";

type ListResponse = {
  data: {
    items: Product[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  };
};

function AdminProductListPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });

  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState("");
  const [page, setPage] = useState(1);

  // Bump this after an action (hide/delete) to trigger a fresh fetch.
  const [refreshKey, setRefreshKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const params: Record<string, string> = { page: String(page) };
        if (search.trim()) params.search = search.trim();
        if (isActive) params.isActive = isActive;

        const response = await api.get<ListResponse>("/admin/products", {
          params,
        });

        if (ignore) return;

        setItems(response.data.data.items);
        setMeta(response.data.data.meta);
        setError("");
      } catch (err) {
        if (ignore) return;

        if (axios.isAxiosError(err)) {
          const message = (err.response?.data as { error?: { message?: string } })
            ?.error?.message;
          setError(message ?? "Failed to load products.");
        } else {
          setError("Failed to load products.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [search, isActive, page, refreshKey]);

  const handleAction = async (action: "toggle" | "delete", product: Product) => {
    if (
      action === "delete" &&
      !window.confirm(`Delete "${product.name}" permanently?`)
    ) {
      return;
    }

    setNotice("");
    setError("");

    try {
      if (action === "toggle") {
        await api.patch(`/admin/products/${product.id}`, {
          isActive: !product.isActive,
        });
        setNotice(
          product.isActive
            ? "Product hidden from the storefront."
            : "Product is now visible."
        );
      } else {
        await api.delete(`/admin/products/${product.id}`);
        setNotice("Product deleted.");
      }

      setRefreshKey((key) => key + 1);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = (err.response?.data as { error?: { message?: string } })
          ?.error?.message;
        setError(message ?? "Action failed.");
      } else {
        setError("Action failed.");
      }
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>

        <Link
          to="/admin/products/new"
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          + New product
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search by name..."
          className="rounded-md border px-3 py-2 sm:w-72"
        />

        <select
          value={isActive}
          onChange={(event) => {
            setIsActive(event.target.value);
            setPage(1);
          }}
          className="rounded-md border px-3 py-2"
        >
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Hidden</option>
        </select>
      </div>

      {notice && <p className="mt-4 text-sm text-green-700">{notice}</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="mt-6">Loading products...</p>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((product) => (
                  <tr key={product.id} className="border-b">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                        )}
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3">{product.stock}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          product.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {product.isActive ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-3">
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleAction("toggle", product)}
                          className="text-amber-700 hover:underline"
                        >
                          {product.isActive ? "Hide" : "Show"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAction("delete", product)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {items.length === 0 && (
            <p className="mt-6 text-gray-600">No products found.</p>
          )}

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {meta.total} product(s) — page {meta.page} of{" "}
              {meta.totalPages || 1}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={meta.page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded border px-3 py-1 disabled:opacity-40"
              >
                ← Prev
              </button>

              <button
                type="button"
                disabled={meta.page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded border px-3 py-1 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default AdminProductListPage;