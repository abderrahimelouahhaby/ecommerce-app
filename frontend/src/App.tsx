import { useEffect, useState } from "react";
import axios from "axios";

type Product = {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string | null;
  stock: number;
};

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get<Product[]>(
          "http://localhost:5000/api/products"
        );

        setProducts(response.data);
      } catch {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <p>Loading products...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <main>
      <h1>MyShop</h1>

      {products.map((product) => (
        <div key={product.id}>
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          <p>{product.price} MAD</p>
          <p>Stock: {product.stock}</p>
        </div>
      ))}
    </main>
  );
}

export default App;