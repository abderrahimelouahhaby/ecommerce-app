import { useEffect, useState } from "react";
import { Link } from "react-router";

import api from "../lib/api";
import { formatPrice } from "../lib/formatPrice";
import type { Order } from "../types/order";

function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get<Order[]>("/orders");

        setOrders(response.data);
      } catch (error) {
        console.error(error);

        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <p>Loading orders...</p>;
  }

  if (error) {
    return (
      <p className="text-red-600">
        {error}
      </p>
    );
  }

  return (
    <section>
      <div>
        <h1 className="text-3xl font-bold">
          My Orders
        </h1>

        <p className="mt-2 text-gray-600">
          View your previous orders.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="mt-8">
          <p className="text-gray-600">
            You don't have any orders yet.
          </p>

          <Link
            to="/products"
            className="mt-4 inline-block rounded-md bg-black px-6 py-3 text-white"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-lg border bg-white p-6"
            >
              <div className="flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row">
                <div>
                  <h2 className="font-semibold">
                    Order #{order.id}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4"
                  >
                    {item.product.imageUrl && (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="h-16 w-16 rounded-md object-cover"
                      />
                    )}

                    <div className="flex-1">
                      <h3 className="font-medium">
                        {item.product.name}
                      </h3>

                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>

                    <p className="font-medium">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t pt-4 text-right">
                <span className="text-gray-600">
                  Total:{" "}
                </span>

                <strong className="text-lg">
                  {formatPrice(order.total)}
                </strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default OrdersPage;