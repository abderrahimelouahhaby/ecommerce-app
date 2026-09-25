import { useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import api from "../lib/api";
import { useAuthStore, type User } from "../store/authStore";
import AuthCard from "../components/AuthCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setError("");

    try {
      setSubmitting(true);

      const response = await api.post<{ data: User }>("/auth/register", {
        firstName,
        lastName,
        email,
        password,
      });

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
            "Registration failed. Please try again.",
        );
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Sign up to start shopping with MyShop."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              required
              autoComplete="given-name"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required
              autoComplete="family-name"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="new-password"
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full w-9"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </Button>
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
          {submitting ? "Creating account..." : "Sign up"}
        </Button>
      </form>
    </AuthCard>
  );
}

export default RegisterPage;
