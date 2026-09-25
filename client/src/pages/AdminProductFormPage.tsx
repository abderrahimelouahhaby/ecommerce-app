import { useEffect, useState, type SubmitEvent } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import api from "../lib/api";
import type { Product } from "../types/product";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Skeleton } from "../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

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
    return (
      <div className="mt-6 max-w-xl space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <section className="max-w-xl">
      <h1 className="text-3xl font-bold tracking-tight">
        {isEditing ? "Edit product" : "New product"}
      </h1>

      <Card className="mt-6">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                rows={4}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  step="1"
                  min="0"
                  value={stock}
                  onChange={(event) => setStock(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Active</Label>
                <Select
                  value={String(isActive)}
                  onValueChange={(value) => setIsActive(value === "true")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://..."
              />
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save product"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/products")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

export default AdminProductFormPage;
