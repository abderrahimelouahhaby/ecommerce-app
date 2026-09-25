import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Package } from "lucide-react";
import api from "../lib/api";
import { formatPrice } from "../lib/formatPrice";
import type { Order } from "../types/order";
import OrderStatusBadge from "../components/OrderStatusBadge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";

function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadOrders() {
      try {
        const response = await api.get<{ data: Order[] }>("/orders");
        if (!ignore) setOrders(response.data.data);
      } catch {
        if (!ignore) setError("Failed to load orders.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadOrders();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
        <p className="mt-1 text-muted-foreground">View your previous orders.</p>
      </div>

      {error ? (
        <p className="mt-8 text-sm text-destructive">{error}</p>
      ) : loading ? (
        <div className="mt-8 space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="mt-4 space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-lg border border-dashed py-16 text-center">
          <Package className="mb-3 size-8 text-muted-foreground" />
          <p className="font-medium">You don&apos;t have any orders yet.</p>
          <Button asChild className="mt-6">
            <Link to="/products">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="font-semibold">Order #{order.id}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="mt-4 space-y-3">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      {item.product.imageUrl && (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-sm text-muted-foreground">
                      +{order.items.length - 3} more item
                      {order.items.length - 3 === 1 ? "" : "s"}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Total:{" "}
                    </span>
                    <strong className="text-lg">
                      {formatPrice(order.total)}
                    </strong>
                  </div>

                  <Button asChild variant="outline" size="sm">
                    <Link to={`/orders/${order.id}`}>View order</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

export default OrdersPage;