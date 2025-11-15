"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    repeatPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefetch routes to make navigation feel instant
  useEffect(() => {
    router.prefetch("/user-dashboard/dashboard");
    router.prefetch("/auth/login");
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.name) return "Please enter your full name.";
    if (!form.email) return "Please enter your email address.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Enter a valid email.";
    if (!form.password) return "Please enter a password.";
    if (form.password.length < 6)
      return "Password must be at least 6 characters.";
    if (form.password !== form.repeatPassword)
      return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) return setError(v);

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          repeatPassword: form.repeatPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Registration failed");
        toast.error(data?.error || "Registration failed");
        return;
      }

      toast.success("Account created. Signing you in...");
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });
      if (signInRes?.ok) {
        router.push("/user-dashboard/dashboard");
      } else {
        toast.info("Account created. Please sign in.");
        router.push("/auth/login");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => router.back(); // 👈 navigate back on close

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={closeModal} // click outside closes and navigates back
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1950&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Modal Card */}
      <div
        className="relative w-full max-w-md bg-[#f3edd7] rounded-xl shadow-2xl transition-transform"
        onClick={(e) => e.stopPropagation()} // prevent close on card click
      >
        <Card className="bg-[#f3edd7] border-none text-gray-900 shadow-none">
          <CardHeader className="flex justify-between items-start p-5 pb-0">
            <div>
              <CardTitle className="text-xl font-semibold text-blue-700">
                Register for a free account
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Sign up to access exclusive content and features.
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-blue-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </CardHeader>

          <CardContent className="space-y-5 p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  className="bg-white border-gray-300 focus:border-blue-700"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={handleChange}
                  className="bg-white border-gray-300 focus:border-blue-700"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create password"
                  value={form.password}
                  onChange={handleChange}
                  className="bg-white border-gray-300 focus:border-blue-700"
                />
              </div>

              <div>
                <label
                  htmlFor="repeatPassword"
                  className="block text-sm font-medium mb-1"
                >
                  Repeat Password <span className="text-red-500">*</span>
                </label>
                <Input
                  id="repeatPassword"
                  name="repeatPassword"
                  type="password"
                  placeholder="Repeat password"
                  value={form.repeatPassword}
                  onChange={handleChange}
                  className="bg-white border-gray-300 focus:border-blue-700"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button
                type="submit"
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold mt-3"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <p className="text-center text-sm mt-4 text-gray-700">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-700 hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
