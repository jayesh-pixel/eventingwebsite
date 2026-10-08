"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function FailureHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Map of backend-verified error codes to user-friendly messages
  const ERROR_MESSAGES: Record<string, string> = {
    HASH_MISMATCH: "We couldn't verify your payment. If money was deducted, please contact support.",
    PAYMENT_NOT_SUCCESSFUL: "Your payment was not successful. Please try again.",
    AMOUNT_MISMATCH: "Payment amount mismatch. Please contact support.",
    BOOKING_NOT_IN_PROCESS: "This booking is no longer awaiting payment. Please contact support.",
  };

  useEffect(() => {
    // Get payment response parameters from URL
    const bookingId = searchParams.get('Booking_id');
    const txnid = searchParams.get('txnid');
    const amount = searchParams.get('amount');
    const paymentmode = searchParams.get('paymentmode');
    const error = searchParams.get('error');
    const error_Message = searchParams.get('error_Message');
    const productinfo = searchParams.get('productinfo');
    const eventId = searchParams.get('event_id');

    console.log('Failure page params:', {
      bookingId,
      txnid,
      amount,
      error,
      error_Message,
      eventId,
      productinfo
    });

    // Try to extract event ID from various sources
    let finalEventId = eventId;
    
    if (!finalEventId && productinfo) {
      const match = productinfo.match(/event[_-]?(\w+)/i);
      if (match) finalEventId = match[1];
    }

    // If we still don't have event ID, try to get it from sessionStorage or use a default
    if (!finalEventId) {
      finalEventId = sessionStorage.getItem('lastEventId') || 'unknown';
    }

    // Determine the user-friendly error message.
    // For backend-verified error codes (HASH_MISMATCH, etc.) use the mapped message.
    // Otherwise fall back to the PayU-provided message.
    const errorMessage = (error && ERROR_MESSAGES[error])
      ? ERROR_MESSAGES[error]
      : (error_Message || error || 'Payment was not completed');

    // Redirect to booking failed page with all parameters
    const failParams = new URLSearchParams({
      txnid: txnid || '',
      amount: amount || '',
      status: 'failed',
      error: errorMessage,
      eventName: productinfo || 'Event',
      paymentmode: paymentmode || '',
    });
    // Only include bookingId if it actually exists (new error codes don't send Booking_id)
    if (bookingId) {
      failParams.set('bookingId', bookingId);
    }

    router.replace(`/events/${finalEventId}/booking-failed?${failParams.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
      <div className="text-center space-y-4 px-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-rose-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
          <Loader2 className="relative h-16 w-16 animate-spin text-red-400 mx-auto" />
        </div>
        <p className="text-slate-300 text-lg sm:text-xl font-medium">Processing payment status...</p>
        <p className="text-slate-400 text-sm">Please wait</p>
        <div className="flex space-x-1 justify-center mt-4">
          <div className="h-2 w-2 bg-red-400 rounded-full animate-bounce"></div>
          <div className="h-2 w-2 bg-red-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="h-2 w-2 bg-red-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  );
}

export default function FailurePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black">
        <Loader2 className="h-12 w-12 animate-spin text-red-400" />
      </div>
    }>
      <FailureHandler />
    </Suspense>
  );
}
