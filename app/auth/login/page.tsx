"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export default function LoginCard() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefetch target routes to make navigation feel instant
  useEffect(() => {
    router.prefetch("/user-dashboard/dashboard");
    router.prefetch("/auth/register");
  }, [router]);

  function validate() {
    if (!email) return "Please enter your email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Enter a valid email address.";
    if (!password) return "Please enter your password.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) return setError(v);

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.ok) {
        toast.success("Login successful");
        router.push("/user-dashboard/dashboard");
      } else {
        const msg = res?.error || "Invalid email or password.";
        setError(msg);
        toast.error(msg);
      }
    } catch {
      setError("An unexpected error occurred.");
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  const closeModal = () => router.back(); // 👈 go back when closing modal

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={closeModal} // close when clicking outside
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1950&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Login Card */}
      <div
        className="relative w-full max-w-md bg-[#f3edd7] rounded-xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()} // prevent close on card click
      >
        {/* Close (X) button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-600 hover:text-blue-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-semibold text-blue-700 mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-gray-700 mb-6">
            Sign in to continue to your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block text-sm font-medium text-gray-800 mb-1"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-800 mb-1"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-12 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-700 hover:text-blue-800 font-medium"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-800">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-400 text-blue-700 focus:ring-blue-700"
                />
                Remember me
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-blue-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center rounded-md px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-medium transition disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-700">
            Don’t have an account?{" "}
            <Link href="/auth/register" className="text-blue-700 hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
