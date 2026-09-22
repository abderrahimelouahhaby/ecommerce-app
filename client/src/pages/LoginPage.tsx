import { useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import api from "../lib/api";
import { useAuthStore, type User } from "../store/authStore";

function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setError("");

    try {
      const response = await api.post<{ data: User }>("/auth/login", {
        email,
        password,
      });

      login(response.data.data);
      navigate("/");
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? ((
              err.response?.data as {
                error?: { message?: string };
              }
            )?.error?.message ?? "Invalid email or password.")
          : "Invalid email or password.",
      );
    }
  };

  return (
    <section className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold">Login</h1>

      <p className="mt-2 text-gray-600">
        Welcome back, sign in to your account.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-4 rounded-lg border bg-white p-6"
      >
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-md bg-black px-6 py-3 text-white hover:bg-gray-800"
        >
          Login
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="text-black underline">
          Sign up
        </Link>
      </p>
    </section>
  );
}

export default LoginPage;
