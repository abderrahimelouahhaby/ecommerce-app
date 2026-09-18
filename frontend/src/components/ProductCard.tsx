import { Link } from "react-router";
import type { Product } from "../types/product";

type ProductCardProps = {
  product: Product;
};

function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border bg-white">
      {product.imageUrl && (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-64 w-full object-cover"
        />
      )}

      <div className="p-4">
        <h2 className="text-lg font-semibold">
          {product.name}
        </h2>

        <p className="mt-2 line-clamp-2 text-sm text-gray-600">
          {product.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="font-bold">
            {product.price} MAD
          </span>

          <Link
            to={`/products/${product.id}`}
            className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;