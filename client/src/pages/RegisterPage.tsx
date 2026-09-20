import { useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import api from "../lib/api";
import {
  useAuthStore,
  type User,
} from "../store/authStore";

function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setError("");

    try {
      const response = await api.post<{ data: User }>(
        "/auth/register",
        {
          firstName,
          lastName,
          email,
          password,
        }
      );

      login(response.data.data);
      navigate("/");
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
          details ||
            errorBody?.error?.message ||
            "Registration failed. Please try again."
        );
        return;
      }

      setError("Registration failed. Please try again.");
    }
  };

  return (
    <section className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold">Sign up</h1>

      <p className="mt-2 text-gray-600">
        Create your account to start shopping.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-4 rounded-lg border bg-white p-6"
      >
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium"
          >
            First name
          </label>
          <input
            id="firstName"
            value={firstName}
            onChange={(event) =>
              setFirstName(event.target.value)
            }
            required
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium"
          >
            Last name
          </label>
          <input
            id="lastName"
            value={lastName}
            onChange={(event) =>
              setLastName(event.target.value)
            }
            required
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          className="w-full rounded-md bg-black px-6 py-3 text-white hover:bg-gray-800"
        >
          Sign up
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="text-black underline">
          Login
        </Link>
      </p>
    </section>
  );
}

export default RegisterPage;