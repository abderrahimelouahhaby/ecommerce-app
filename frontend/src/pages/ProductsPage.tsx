import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import api from "../lib/api";
import type { Product } from "../types/product";

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get<Product[]>("/products");

        setProducts(response.data);
      } catch (error) {
        console.error(error);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <p>Loading products...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Products
        </h1>

        <p className="mt-2 text-gray-600">
          Browse our products.
        </p>
      </div>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default ProductsPage;