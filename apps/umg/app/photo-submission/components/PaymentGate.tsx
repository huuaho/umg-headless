"use client";

import { useState } from "react";
import { currentCompetition } from "@/lib/competitions/current";

interface PaymentGateProps {
  user: { email: string; name: string };
  onPaymentConfirmed: () => void;
  onLogout: () => void;
}

export function PaymentGate({
  user,
  onPaymentConfirmed,
  onLogout,
}: PaymentGateProps) {
  const [isChecking, setIsChecking] = useState(false);
  const competition = currentCompetition;
  const entryFee = competition.divisions[0]?.entryFee ?? 50;

  const stripeUrl = `${competition.stripePaymentLink}?prefilled_email=${encodeURIComponent(user.email)}`;

  const handleCheckStatus = async () => {
    setIsChecking(true);

    // TODO: Replace with real API call in Phase 4
    // GET /umg/v1/me → check payment_status
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate: always confirm for now
    onPaymentConfirmed();
    setIsChecking(false);
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-[#212223] mb-2 text-center">
        Complete Payment
      </h2>
      <p className="text-gray-500 text-center mb-8">
        Hello, {user.name}. Please complete the entry fee to proceed with your
        submission.
      </p>

      <div className="border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Entry Fee</span>
          <span className="text-2xl font-bold text-[#212223]">
            ${entryFee}
          </span>
        </div>

        <div className="text-sm text-gray-500 space-y-2 mb-6">
          <p className="flex items-start">
            <span className="text-gray-400 mr-2">&bull;</span>
            Submission for official judging
          </p>
          <p className="flex items-start">
            <span className="text-gray-400 mr-2">&bull;</span>
            Eligibility for prizes up to $
            {competition.awards[0]?.amount.toLocaleString()}
          </p>
          <p className="flex items-start">
            <span className="text-gray-400 mr-2">&bull;</span>
            Exhibition eligibility at partner venues
          </p>
        </div>

        <a
          href={stripeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full px-4 py-2.5 text-sm font-medium text-white bg-[#212223] hover:bg-[#3a3a3a] transition-colors text-center"
        >
          Pay ${entryFee} with Stripe
        </a>
      </div>

      <button
        onClick={handleCheckStatus}
        disabled={isChecking}
        className="w-full px-4 py-2.5 text-sm font-medium border border-gray-300 text-[#212223] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isChecking ? "Checking..." : "I\u2019ve completed payment \u2014 check status"}
      </button>

      <p className="text-xs text-gray-400 text-center mt-4">
        Payment status updates automatically. You can also click above to check
        manually.
      </p>

      <div className="mt-8 text-center">
        <button
          onClick={onLogout}
          className="text-sm text-gray-500 hover:text-[#212223] transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
