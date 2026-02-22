"use client";

import { useState } from "react";

interface AuthFormProps {
  onAuthenticated: (user: { email: string; name: string }) => void;
}

export function AuthForm({ onAuthenticated }: AuthFormProps) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError("");

    // TODO: Replace with real API call in Phase 3
    // POST /umg/v1/auth/request-code { email }
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);
    setStep("code");
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    setError("");

    // TODO: Replace with real API call in Phase 3
    // POST /umg/v1/auth/verify-code { email, code }
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate: any 6-digit code works for now
    if (code.length === 6 && /^\d+$/.test(code)) {
      onAuthenticated({ email, name: email.split("@")[0] });
    } else {
      setError("Please enter a valid 6-digit code.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-[#212223] mb-2 text-center">
        Sign In to Submit
      </h2>
      <p className="text-gray-500 text-center mb-8">
        {step === "email"
          ? "Enter your email to receive a verification code."
          : `We sent a 6-digit code to ${email}`}
      </p>

      {step === "email" ? (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#212223] mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-[#212223] placeholder-gray-400"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full px-4 py-2.5 text-sm font-medium text-white bg-[#212223] hover:bg-[#3a3a3a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending..." : "Send Verification Code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-[#212223] mb-1"
            >
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              required
              autoFocus
              maxLength={6}
              className="w-full px-3 py-2 border border-gray-300 text-sm text-center tracking-[0.5em] text-lg font-mono focus:outline-none focus:ring-1 focus:ring-gray-400 text-[#212223] placeholder-gray-400"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="w-full px-4 py-2.5 text-sm font-medium text-white bg-[#212223] hover:bg-[#3a3a3a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError("");
            }}
            className="w-full text-sm text-gray-500 hover:text-[#212223] transition-colors"
          >
            Use a different email
          </button>
        </form>
      )}
    </div>
  );
}
