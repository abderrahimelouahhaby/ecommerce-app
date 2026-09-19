import { useEffect } from "react";
import { Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Navbar from "./components/NavBar";
import api from "./lib/api";
import {
  useAuthStore,
  type User,
} from "./store/authStore";

function App() {
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    api
      .get<User>("/users/me")
      .then((response) => {
        login(response.data);
      })
      .catch(() => {
        // Not logged in; ignore.
      });
  }, [login]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route
            path="/products/:id"
            element={<ProductDetailsPage />}
          />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;