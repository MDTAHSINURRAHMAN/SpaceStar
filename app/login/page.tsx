"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLoginMutation } from "@/lib/api/loginApi";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(form).unwrap();
      // ✅ Navigate to dashboard
      router.replace("/dashboard/banner");

      // ✅ Wait a moment, then reload so JWT cookie is included in new fetches
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="border px-4 py-2 w-full"
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="border px-4 py-2 w-full"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 w-full"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
