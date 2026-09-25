import { useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import { Minus, Plus, ShoppingBag, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { formatPrice } from "../lib/formatPrice";
import api from "../lib/api";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";

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
      const response = await api.post<{ data: { id: string } }>("/orders", {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shipping: { fullName, phone, address, city },
      });

      clearCart();
      toast.success("Order placed successfully");
      navigate(`/orders/${response.data.data.id}`);
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
          details || errorBody?.error?.message || "Failed to create order.",
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
      <section className="flex flex-col items-center py-24 text-center">
        <ShoppingCart className="mb-3 size-10 text-muted-foreground" />
        <h1 className="text-2xl font-bold tracking-tight">
          Your cart is empty
        </h1>
        <p className="mt-2 text-muted-foreground">
          Add some products and come back to check out.
        </p>
        <Button asChild className="mt-6">
          <Link to="/products">Browse Products</Link>
        </Button>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalItems} item{totalItems === 1 ? "" : "s"} in your cart
          </p>
        </div>

        <Button type="button" variant="ghost" size="sm" onClick={clearCart}>
          <Trash2 className="size-4" />
          Clear cart
        </Button>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_360px]">
        {/* Line items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-lg border bg-card p-4"
            >
              <Link
                to={`/products/${item.productId}`}
                className="block h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ShoppingBag className="size-6" />
                  </div>
                )}
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link
                      to={`/products/${item.productId}`}
                      className="font-semibold hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatPrice(item.price)} each
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeFromCart(item.productId)}
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-md border">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={item.quantity <= 1}
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="w-10 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={item.quantity >= item.stock}
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>

                  <p className="font-semibold">
                    {formatPrice(
                      (Number(item.price) * item.quantity).toString(),
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sticky summary + shipping form */}
        <aside className="space-y-4 lg:sticky lg:top-20">
          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold">Order summary</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Items</dt>
                  <dd>{totalItems}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{formatPrice(totalPrice.toString())}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd>Free</dd>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-base font-semibold">
                  <dt>Total</dt>
                  <dd>{formatPrice(totalPrice.toString())}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold">Shipping details</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Tell us where to send your order.
              </p>

              <form onSubmit={handleCheckout} className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      required
                      autoComplete="name"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      required
                      autoComplete="tel"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      required
                      autoComplete="street-address"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      required
                      autoComplete="address-level2"
                    />
                  </div>
                </div>

                {error && (
                  <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? "Placing order..." : "Place order"}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Secure checkout · totals are verified by the server.
                </p>
              </form>
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  );
}

export default CartPage;
