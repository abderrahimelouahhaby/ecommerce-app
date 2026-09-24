import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import api from "../lib/api";
import type { Product } from "../types/product";
import axios from "axios";

type ListResponse = {
  data: {
    items: Product[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  };
};

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      try {
        const params: Record<string, string> = { page: String(page) };
        if (search.trim()) params.search = search.trim();
        if (sort !== "newest") params.sort = sort;

        const response = await api.get<ListResponse>("/products", { params });

        if (ignore) return;

        setProducts(response.data.data.items);
        setMeta(response.data.data.meta);
        setError("");
      } catch (err) {
        if (ignore) return;

        if (axios.isAxiosError(err)) {
          const message = (
            err.response?.data as { error?: { message?: string } }
          )?.error?.message;
          setError(message ?? "Failed to load products.");
        } else {
          setError("Failed to load products.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      ignore = true;
    };
  }, [search, sort, page]);

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Products</h1>

        <p className="mt-2 text-gray-600">Browse our products.</p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search by name or description..."
          className="rounded-md border px-3 py-2 sm:w-72"
        />

        <select
          value={sort}
          onChange={(event) => {
            setSort(event.target.value);
            setPage(1);
          }}
          className="rounded-md border px-3 py-2"
        >
          <option value="newest">Newest</option>
          <option value="priceLowHigh">Price: Low to High</option>
          <option value="priceHighLow">Price: High to Low</option>
        </select>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <>
          {products.length === 0 ? (
            <p>
              {search ? `No products match "${search}".` : "No products found."}
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
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

export default ProductsPage;
