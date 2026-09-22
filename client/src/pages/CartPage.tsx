import { useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import { useCartStore } from "../store/cartStore";
import { formatPrice } from "../lib/formatPrice";
import api from "../lib/api";
import { useAuthStore } from "../store/authStore";

function CartPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const items = useCartStore((state) => state.items);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const totalItems = useCartStore((state) => state.totalItems());
  const totalPrice = useCartStore((state) => state.totalPrice());

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async (event: SubmitEvent) => {
    event.preventDefault();
    setError("");

    if (!user) {
      navigate("/login");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/orders", {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shipping: { fullName, phone, address, city },
      });

      clearCart();
      navigate("/orders");
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
          details || errorBody?.error?.message || "Failed to create order."
        );
      } else {
        setError("Failed to create order.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <section>
        <h1 className="text-3xl font-bold">Shopping Cart</h1>

        <p className="mt-4 text-gray-600">Your cart is empty.</p>

        <Link
          to="/products"
          className="mt-6 inline-block rounded-md bg-black px-6 py-3 text-white"
        >
          Browse Products
        </Link>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>

        <button
          type="button"
          onClick={clearCart}
          className="text-sm text-red-600"
        >
          Clear cart
        </button>
      </div>

      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-4 rounded-lg border bg-white p-4"
          >
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-24 w-24 rounded-md object-cover"
              />
            )}

            <div className="flex-1">
              <h2 className="font-semibold">{item.name}</h2>

              <p className="text-gray-600">{formatPrice(item.price)}</p>

              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="rounded border px-3 py-1"
                >
                  -
                </button>

                <span>{item.quantity}</span>

                <button
                  type="button"
                  disabled={item.quantity >= item.stock}
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="rounded border px-3 py-1 disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeFromCart(item.productId)}
              className="text-sm text-red-600"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleCheckout}
        className="mt-8 rounded-lg border bg-white p-6"
      >
        <h2 className="text-xl font-semibold">Shipping details</h2>

        <p className="mt-1 text-sm text-gray-600">
          Tell us where to send your order.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium">
              Full name
            </label>
            <input
              id="fullName"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium">
              Phone
            </label>
            <input
              id="phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium">
              Address
            </label>
            <input
              id="address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              required
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="city" className="block text-sm font-medium">
              City
            </label>
            <input
              id="city"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              required
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </div>
        </div>

        <div className="mt-6 border-t pt-4">
          <p className="text-lg">
            Items: <strong>{totalItems}</strong>
          </p>

          <p className="mt-1 text-xl">
            Total: <strong>{formatPrice(totalPrice.toString())}</strong>
          </p>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 rounded-md bg-black px-6 py-3 text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? "Placing order..." : "Place order"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default CartPage;