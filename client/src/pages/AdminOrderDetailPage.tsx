import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import axios from "axios";
import api from "../lib/api";
import { formatPrice } from "../lib/formatPrice";
import type { AdminOrder } from "../types/order";

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  CONFIRMED: "Confirm order",
  SHIPPED: "Mark as shipped",
  DELIVERED: "Mark as delivered",
  CANCELLED: "Cancel order",
};

function AdminOrderDetailPage() {
  const { id } = useParams();

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadOrder() {
      try {
        const response = await api.get<{ data: AdminOrder }>(
          `/admin/orders/${id}`,
        );

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
        if (!ignore) setLoading(false);
      }
    }

    loadOrder();

    return () => {
      ignore = true;
    };
  }, [id]);

  const handleAdvance = async (status: string) => {
    if (
      status === "CANCELLED" &&
      !window.confirm("Cancel this order? The items will be returned to stock.")
    ) {
      return;
    }

    setAdvancing(true);
    setNotice("");

    try {
      const response = await api.patch<{ data: AdminOrder }>(
        `/admin/orders/${id}/status`,
        { status },
      );
      setOrder(response.data.data);
      setNotice(`Order is now ${response.data.data.status}.`);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = (err.response?.data as { error?: { message?: string } })
          ?.error?.message;
        setNotice(message ?? "Could not update the order status.");
      }
    } finally {
      setAdvancing(false);
    }
  };

  if (loading) {
    return <p>Loading order...</p>;
  }

  if (error || !order) {
    return (
      <section>
        <h1 className="text-2xl font-bold">Order</h1>

        <p className="mt-4 text-red-600">{error}</p>

        <Link
          to="/admin/orders"
          className="mt-4 inline-block text-black underline"
        >
          Back to orders
        </Link>
      </section>
    );
  }

  return (
    <section>
      <Link to="/admin/orders" className="text-sm text-gray-600 underline">
        ← Back to orders
      </Link>

      <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.id.slice(0, 8)}</h1>

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
        <p className="mt-4 rounded-md bg-gray-100 p-3 text-sm">{notice}</p>
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
                  {formatPrice((Number(item.price) * item.quantity).toString())}
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
          <h2 className="text-lg font-semibold">Customer</h2>

          <div className="mt-4 space-y-2 text-sm">
            <p className="font-medium">
              {order.user.firstName} {order.user.lastName}
            </p>
            <p>{order.user.email}</p>
          </div>

          <h2 className="mt-6 text-lg font-semibold">Shipping to</h2>

          <div className="mt-4 space-y-2 text-sm">
            <p className="font-medium">{order.fullName}</p>
            <p>{order.address}</p>
            <p>{order.city}</p>
            <p>{order.phone}</p>
          </div>

          {order.nextStatuses.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {order.nextStatuses.map((next) => (
                <button
                  key={next}
                  type="button"
                  onClick={() => handleAdvance(next)}
                  disabled={advancing}
                  className={`rounded-md px-5 py-2 text-sm font-medium text-white disabled:opacity-50 ${
                    next === "CANCELLED"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-black hover:bg-gray-800"
                  }`}
                >
                  {statusLabels[next] ?? next}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminOrderDetailPage;
