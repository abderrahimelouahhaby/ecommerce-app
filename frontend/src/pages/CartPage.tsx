import { Link } from "react-router";
import { useCartStore } from "../store/cartStore";
import { formatPrice } from "../lib/formatPrice";

function CartPage() {
const items = useCartStore((state) => state.items);
const removeFromCart = useCartStore(
  (state) => state.removeFromCart
);
const updateQuantity = useCartStore(
  (state) => state.updateQuantity
);
const clearCart = useCartStore(
  (state) => state.clearCart
);
const totalItems = useCartStore(
  (state) => state.totalItems()
);
const totalPrice = useCartStore(
  (state) => state.totalPrice()
);

  if (items.length === 0) {
    return (
      <section>
        <h1 className="text-3xl font-bold">
          Shopping Cart
        </h1>

        <p className="mt-4 text-gray-600">
          Your cart is empty.
        </p>

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
        <h1 className="text-3xl font-bold">
          Shopping Cart
        </h1>

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
              <h2 className="font-semibold">
                {item.name}
              </h2>

              <p className="text-gray-600">
  {formatPrice(item.price)}
</p>

              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    updateQuantity(
                      item.productId,
                      item.quantity - 1
                    )
                  }
                  className="rounded border px-3 py-1"
                >
                  -
                </button>

                <span>{item.quantity}</span>

                <button
                  type="button"
                  disabled={item.quantity >= item.stock}
                  onClick={() =>
                    updateQuantity(
                      item.productId,
                      item.quantity + 1
                    )
                  }
                  className="rounded border px-3 py-1 disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                removeFromCart(item.productId)
              }
              className="text-sm text-red-600"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t pt-6">
        <p className="text-lg">
          Items: <strong>{totalItems}</strong>
        </p>

        <p className="mt-2 text-xl">
          Total:{" "}
          <strong>{formatPrice(totalPrice.toString())}</strong>
        </p>

        <button
          type="button"
          className="mt-6 rounded-md bg-black px-6 py-3 text-white"
        >
          Checkout
        </button>
      </div>
    </section>
  );
}

export default CartPage;