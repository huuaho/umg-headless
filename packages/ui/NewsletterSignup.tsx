"use client";

import { useState, type FormEvent } from "react";

interface NewsletterSignupProps {
  apiBaseUrl: string;
}

type Status = "idle" | "loading" | "success" | "error";

export default function NewsletterSignup({ apiBaseUrl }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch(`${apiBaseUrl}/umg/v1/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_address: email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setMessage(data.message);
      } else {
        setStatus("error");
        setMessage(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Could not connect. Please try again later.");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-2">
        <p className="text-sm text-green-700">{message}</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h3 className="text-sm font-semibold text-[#212223] uppercase tracking-wide mb-3">
        Stay Updated
      </h3>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="w-full sm:flex-1 px-3 py-2 text-sm border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-[#212223] hover:bg-[#3a3a3a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
      {status === "error" && (
        <p className="text-red-500 text-sm mt-2">{message}</p>
      )}
    </div>
  );
}
