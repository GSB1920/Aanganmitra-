"use client";

import { useState } from "react";
import { signupAction } from "@/app/action/auth/signup";
 

export default function SignupPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const formData = new FormData(e.target);
    const res = await signupAction(formData);

    if (res.error) {
      if (res.error.toLowerCase().includes("not approved")) {
        setMessage("Your account is pending approval. Please wait for admin approval.");
        setTimeout(() => {
          window.location.href = "/pending-approval";
        }, 1500);
      } else {
        setMessage(res.error);
      }
    }
    else setMessage("Signup successful! You will be approved by the admin.");

    setLoading(false);

    if (res.success) {
      window.location.href = "/pending-approval";
    }

  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 text-black p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-semibold text-center mb-4">Create Account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Full Name</label>
            <input id="name" name="name" placeholder="John Doe" required className="w-full p-2 border rounded" />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input id="email" name="email" type="email" placeholder="john@example.com" required className="w-full p-2 border rounded" />
          </div>
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
            <input id="phone" name="phone" placeholder="9876543210" required className="w-full p-2 border rounded" />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input id="password" name="password" type="password" placeholder="********" required className="w-full p-2 border rounded" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          {message && (
            <p className="text-center text-sm mt-2 text-gray-700">{message}</p>
          )}

          <p className="text-center text-sm text-gray-600">
            Already have an account? <a href="/login" className="text-blue-600">Login</a>
          </p>
        </form>
      </div>
    </div>
  );
}
