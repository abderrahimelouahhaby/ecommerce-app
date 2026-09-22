import { useEffect, useState, type SubmitEvent } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import api from "../lib/api";
import type { Product } from "../types/product";

function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [stock, setStock] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditing) return;

    let ignore = false;

    const loadProduct = async () => {
      try {
        const response = await api.get<{ data: Product }>(`/products/${id}`);

        if (ignore) return;

        setName(response.data.data.name);
        setDescription(response.data.data.description);
        setPrice(response.data.data.price);
        setImageUrl(response.data.data.imageUrl ?? "");
        setStock(String(response.data.data.stock));
        setIsActive(response.data.data.isActive);
      } catch (err) {
        if (ignore) return;

        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setError("Product not found.");
        } else {
          setError("Failed to load the product.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadProduct();

    return () => {
      ignore = true;
    };
  }, [id, isEditing]);

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const body = {
      name,
      description,
      price: Number(price),
      imageUrl: imageUrl.trim() ? imageUrl.trim() : null,
      stock: stock === "" ? undefined : Number(stock),
      ...(isEditing ? { isActive } : {}),
    };

    try {
      if (isEditing) {
        await api.patch(`/admin/products/${id}`, body);
      } else {
        await api.post("/admin/products", body);
      }

      navigate("/admin/products");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorBody = err.response?.data as
          | {
              error?: {
                message?: string;
                details?: { message?: string }[];
              };
            }
          | undefined;

        const details = errorBody?.error?.details
          ?.map((detail) => detail.message)
          .filter(Boolean)
          .join(", ");

        setError(
          details || errorBody?.error?.message || "Could not save the product.",
        );
      } else {
        setError("Could not save the product.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p>Loading product...</p>;
  }

  return (
    <section className="max-w-xl">
      <h1 className="text-2xl font-bold">
        {isEditing ? "Edit product" : "New product"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-lg border bg-white p-6"
      >
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
            rows={4}
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="price" className="block text-sm font-medium">
              Price
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="stock" className="block text-sm font-medium">
              Stock
            </label>
            <input
              id="stock"
              type="number"
              step="1"
              min="0"
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="isActive" className="block text-sm font-medium">
              Active
            </label>
            <input
              id="isActive"
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="mt-3 h-5 w-5"
            />
          </div>
        </div>

        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium">
            Image URL
          </label>
          <input
            id="imageUrl"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-black px-6 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save product"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="rounded-md border px-6 py-2 text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

export default AdminProductFormPage;
