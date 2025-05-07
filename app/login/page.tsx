"use client";

import { useRouter } from "next/navigation";
import {FormEvent, useState } from "react";
import { useLoginMutation } from "@/lib/api/loginApi";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    try {
      const result = await login(form).unwrap();
      setIsRedirecting(true);
  
      setTimeout(() => {
        router.replace("/dashboard/banner");
      }, 100);
    } catch (err) {
      console.error("Login failed:", err);
    
      if (err && typeof err === "object" && "data" in err) {
        const errorData = err as { data?: { message?: string } };
        setError(errorData.data?.message || "Login failed");
      } else {
        setError("Login failed");
      }
    }
  };

  return (
    <div className="font-roboto flex flex-col items-center justify-center p-4">
      {isRedirecting ? (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-50">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
          <p className="mt-4 text-lg font-medium">Redirecting to dashboard...</p>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
          <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="border px-4 py-2 w-full"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="border px-4 py-2 w-full"
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  <span>Logging in...</span>
                </div>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
}