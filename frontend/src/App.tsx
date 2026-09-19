import { Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CartPage from "./pages/CartPage";
import Navbar from "./components/NavBar";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
    <Navbar/>
    <main className="mx-auto max-w-6xl px-6 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route
            path="/products/:id"
            element={<ProductDetailsPage />}
          />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
    </main>
    </div>
  );
}

export default App;