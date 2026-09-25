import { useEffect, useState } from "react";
import { Link } from "react-router";
import axios from "axios";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import api from "../lib/api";
import { formatPrice } from "../lib/formatPrice";
import type { Product } from "../types/product";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

type ListResponse = {
  data: {
    items: Product[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  };
};

function AdminProductListPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState("");
  const [page, setPage] = useState(1);

  // Bump this after an action (hide/delete) to trigger a fresh fetch.
  const [refreshKey, setRefreshKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

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

    load();

    return () => {
      ignore = true;
    };
  }, [search, isActive, page, refreshKey]);

  const handleToggle = async (product: Product) => {
    try {
      await api.patch(`/admin/products/${product.id}`, {
        isActive: !product.isActive,
      });
      toast.success(
        product.isActive
          ? "Product hidden from the storefront."
          : "Product is now visible.",
      );
      setRefreshKey((key) => key + 1);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = (err.response?.data as { error?: { message?: string } })
          ?.error?.message;
        toast.error(message ?? "Action failed.");
      } else {
        toast.error("Action failed.");
      }
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    const product = pendingDelete;
    setPendingDelete(null);
    setDeleting(true);

    try {
      await api.delete(`/admin/products/${product.id}`);
      toast.success("Product deleted.");
      setRefreshKey((key) => key + 1);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = (err.response?.data as { error?: { message?: string } })
          ?.error?.message;
        toast.error(message ?? "Action failed.");
      } else {
        toast.error("Action failed.");
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>

        <Button asChild>
          <Link to="/admin/products/new">
            <Plus /> New product
          </Link>
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by name..."
            className="pl-9 sm:w-72"
          />
        </div>

        <Select
          value={isActive === "" ? "all" : isActive}
          onValueChange={(value) => {
            setIsActive(value === "all" ? "" : value);
            setPage(1);
          }}
        >
          <SelectTrigger className="sm:w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Hidden</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-6 rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-10" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="ml-auto h-4 w-32" />
                  </TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              items.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="size-10 rounded object-cover"
                        />
                      )}
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatPrice(product.price)}
                  </TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        product.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {product.isActive ? "Active" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/admin/products/${product.id}/edit`}>
                          Edit
                        </Link>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggle(product)}
                      >
                        {product.isActive ? "Hide" : "Show"}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setPendingDelete(product)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {meta.total} product(s) — page {meta.page} of {meta.totalPages || 1}
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft /> Prev
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={meta.page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next <ChevronRight />
          </Button>
        </div>
      </div>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete ? (
                <>
                  "{pendingDelete.name}" will be permanently deleted. This
                  cannot be undone.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep product</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Yes, delete product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

export default AdminProductListPage;
