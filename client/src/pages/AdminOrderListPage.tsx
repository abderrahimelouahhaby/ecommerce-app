import { useEffect, useState } from "react";
import { Link } from "react-router";
import axios from "axios";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import api from "../lib/api";
import { formatPrice } from "../lib/formatPrice";
import type { AdminOrder } from "../types/order";
import OrderStatusBadge from "../components/OrderStatusBadge";
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

type ListResponse = {
  data: {
    items: AdminOrder[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  };
};

function AdminOrderListPage() {
  const [items, setItems] = useState<AdminOrder[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const params: Record<string, string> = { page: String(page) };
        if (search.trim()) params.search = search.trim();
        if (status) params.status = status;

        const response = await api.get<ListResponse>("/admin/orders", {
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
          setError(message ?? "Failed to load orders.");
        } else {
          setError("Failed to load orders.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [search, status, page]);

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight">Orders</h1>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search customer name or email..."
            className="pl-9 sm:w-72"
          />
        </div>

        <Select
          value={status === "" ? "all" : status}
          onValueChange={(value) => {
            setStatus(value === "all" ? "" : value);
            setPage(1);
          }}
        >
          <SelectTrigger className="sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="SHIPPED">Shipped</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-6 rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              items.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      #{order.id.slice(0, 8)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.user.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatPrice(order.total)}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {meta.total} order(s) — page {meta.page} of {meta.totalPages || 1}
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
    </section>
  );
}

export default AdminOrderListPage;
