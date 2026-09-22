import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import axios from "axios";
import api from "../lib/api";
import { formatPrice } from "../lib/formatPrice";
import type { Order } from "../types/order";

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

function OrderDetailPage() {
  const { id } = useParams();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let ignore = false;

    async function loadOrder() {
      try {
        const response = await api.get<{ data: Order }>(`/orders/${id}`);

        if (ignore) return;

        setOrder(response.data.data);
        setError("");
      } catch (err) {
        if (ignore) return;

        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setError("Order not found.");
        } else {
          setError("Failed to load the order.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      ignore = true;
    };
  }, [id]);

  const handleCancel = async () => {
    if (
      !window.confirm(
        "Cancel this order? The items will be returned to stock."
      )
    ) {
      return;
    }

    setCancelling(true);
    setNotice("");

    try {
      const response = await api.post<{ data: Order }>(
        `/orders/${id}/cancel`
      );
      setOrder(response.data.data);
      setNotice("Order cancelled. Stock has been restored.");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = (
          err.response?.data as { error?: { message?: string } }
        )?.error?.message;
        setNotice(message ?? "Could not cancel the order.");
      }
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <p>Loading order...</p>;
  }

  if (error || !order) {
    return (
      <section>
        <h1 className="text-3xl font-bold">Order</h1>

        <p className="mt-4 text-red-600">{error}</p>

        <Link to="/orders" className="mt-4 inline-block text-black underline">
          Back to my orders
        </Link>
      </section>
    );
  }

  const cancelled = order.status === "CANCELLED";

  return (
    <section>
      <Link to="/orders" className="text-sm text-gray-600 underline">
        ← Back to my orders
      </Link>

      <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Order #{order.id}</h1>

          <p className="mt-1 text-gray-500">
            Placed {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            statusStyles[order.status] ?? "bg-gray-100"
          }`}
        >
          {order.status}
        </span>
      </div>

      {notice && (
        <p
          className={`mt-4 rounded-md p-3 text-sm ${
            cancelled ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
          }`}
        >
          {notice}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-6">
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

                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>

                <p className="font-medium">
                  {formatPrice(
                    (Number(item.price) * item.quantity).toString()
                  )}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t pt-4 text-right">
            <span className="text-gray-600">Total: </span>
            <strong className="text-lg">{formatPrice(order.total)}</strong>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold">Shipping to</h2>

          <div className="mt-4 space-y-2 text-sm">
            <p className="font-medium">{order.fullName}</p>
            <p>{order.address}</p>
            <p>{order.city}</p>
            <p>{order.phone}</p>
          </div>

          {!cancelled && order.status === "PENDING" && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelling}
              className="mt-6 rounded-md bg-red-600 px-5 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
            >
              {cancelling ? "Cancelling..." : "Cancel order"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default OrderDetailPage;