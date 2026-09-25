import { Fragment, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import axios from "axios";
import { Check, CircleX, Package } from "lucide-react";
import { toast } from "sonner";
import api from "../lib/api";
import { formatPrice } from "../lib/formatPrice";
import type { Order } from "../types/order";
import OrderStatusBadge from "../components/OrderStatusBadge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";

const ORDER_STEPS = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];

const stepLabel = (step: string) =>
  step.charAt(0) + step.slice(1).toLowerCase();

function OrderDetailPage() {
  const { id } = useParams();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadOrder() {
      try {
        const response = await api.get<{ data: Order }>(`/orders/${id}`);
        if (!ignore) setOrder(response.data.data);
      } catch (err) {
        if (ignore) return;
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setError("Order not found.");
        } else {
          setError("Failed to load the order.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadOrder();

    return () => {
      ignore = true;
    };
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);

    try {
      const response = await api.post<{ data: Order }>(`/orders/${id}/cancel`);
      setOrder(response.data.data);
      toast.success("Order cancelled — stock restored.");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = (err.response?.data as { error?: { message?: string } })
          ?.error?.message;
        toast.error(message ?? "Could not cancel the order.");
      } else {
        toast.error("Could not cancel the order.");
      }
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <Package className="mb-3 size-10 text-muted-foreground" />
        <p className="text-lg font-medium text-destructive">{error}</p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/orders">Back to my orders</Link>
        </Button>
      </div>
    );
  }

  const currentStep = ORDER_STEPS.indexOf(order.status);

  return (
    <section>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/orders">← Back to my orders</Link>
      </Button>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Order #{order.id}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <OrderStatusBadge status={order.status} />
      </div>

      {/* Status timeline, or a cancelled banner */}
      {currentStep === -1 ? (
        <div className="mt-6 flex items-center gap-3 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <CircleX className="size-5" />
          This order was cancelled. Items were returned to stock.
        </div>
      ) : (
        <div className="mt-8 flex items-center">
          {ORDER_STEPS.map((step, index) => (
            <Fragment key={step}>
              {index > 0 && (
                <div
                  className={`h-0.5 flex-1 ${
                    index <= currentStep ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex size-8 items-center justify-center rounded-full text-xs font-semibold ${
                    index < currentStep
                      ? "bg-primary text-primary-foreground"
                      : index === currentStep
                        ? "border-2 border-primary text-foreground"
                        : "border border-border text-muted-foreground"
                  }`}
                >
                  {index < currentStep ? <Check className="size-4" /> : index + 1}
                </div>
                <span
                  className={`text-xs ${
                    index <= currentStep
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {stepLabel(step)}
                </span>
              </div>
            </Fragment>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">Items</h2>

            <div className="mt-4 space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  {item.product.imageUrl && (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-16 w-16 rounded-md object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <p className="font-medium">
                    {formatPrice(
                      (Number(item.price) * item.quantity).toString(),
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t pt-4 text-right">
              <span className="text-sm text-muted-foreground">Total: </span>
              <strong className="text-lg">{formatPrice(order.total)}</strong>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">Shipping to</h2>

            <div className="mt-4 space-y-2 text-sm">
              <p className="font-medium">{order.fullName}</p>
              <p>{order.address}</p>
              <p>{order.city}</p>
              <p>{order.phone}</p>
            </div>

            {order.status === "PENDING" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="mt-6">
                    Cancel order
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                    <AlertDialogDescription>
                      The items will be returned to stock. This cannot be
                      undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep order</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancel}
                      disabled={cancelling}
                    >
                      {cancelling ? "Cancelling..." : "Yes, cancel order"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default OrderDetailPage;