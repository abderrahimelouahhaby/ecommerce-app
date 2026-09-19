import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import api from "../lib/api";
import type { Product } from "../types/product";
import { useCartStore } from "../store/cartStore";

function ProductDetailsPage() {
  const { id } = useParams();
  const addToCart = useCartStore((state) => state.addToCart);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get<Product>(
          `/products/${id}`
        );

        setProduct(response.data);
      } catch (error) {
        console.error(error);
        setError("Product not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <p>Loading product...</p>;
  }

  if (error || !product) {
    return (
      <div>
        <p className="text-red-600">
          {error || "Product not found."}
        </p>

        <Link
          to="/products"
          className="mt-4 inline-block underline"
        >
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <section className="grid gap-8 md:grid-cols-2">
      <div>
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full rounded-lg object-cover"
          />
        )}
      </div>

      <div>
        <h1 className="text-3xl font-bold">
          {product.name}
        </h1>

        <p className="mt-4 text-2xl font-semibold">
          {product.price} MAD
        </p>

        <p className="mt-6 text-gray-600">
          {product.description}
        </p>

        <p className="mt-6">
          <span className="font-medium">Stock:</span>{" "}
          {product.stock}
        </p>

        {product.stock > 0 ? (
  <button
    type="button"
    onClick={() => addToCart(product)}
    className="mt-6 rounded-md bg-black px-6 py-3 text-white hover:bg-gray-800"
  >
    Add to Cart
  </button>
) : (
  <button
    type="button"
    disabled
    className="mt-6 cursor-not-allowed rounded-md bg-gray-300 px-6 py-3 text-gray-600"
  >
    Out of Stock
  </button>
)}
      </div>
    </section>
  );
}

export default ProductDetailsPage;