"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function SuccessHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get payment response parameters from URL
    const bookingId = searchParams.get('Booking_id');
    const txnid = searchParams.get('txnid');
    const amount = searchParams.get('amount');
    const paymentmode = searchParams.get('paymentmode');
    const mihpayid = searchParams.get('mihpayid');
    const email = searchParams.get('email');
    const productinfo = searchParams.get('productinfo');
    const firstname = searchParams.get('firstname');
    const eventId = searchParams.get('event_id');

    console.log('Success page params:', {
      bookingId,
      txnid,
      amount,
      paymentmode,
      eventId,
      email,
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

    // Redirect to booking success page with all parameters
    const successParams = new URLSearchParams({
      txnid: txnid || '',
      amount: amount || '',
      status: 'success',
      bookingId: bookingId || mihpayid || txnid || '',
      email: email || '',
      eventName: productinfo || 'Event',
      paymentmode: paymentmode || '',
      firstname: firstname || ''
    });

    router.replace(`/events/${finalEventId}/booking-success?${successParams.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
          <Loader2 className="relative h-16 w-16 animate-spin text-green-400 mx-auto" />
        </div>
        <p className="text-slate-300 text-xl font-medium">Payment Successful! 🎉</p>
        <p className="text-slate-400 text-sm">Redirecting to your booking confirmation...</p>
        <div className="flex space-x-1 justify-center mt-4">
          <div className="h-2 w-2 bg-green-400 rounded-full animate-bounce"></div>
          <div className="h-2 w-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="h-2 w-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black">
        <Loader2 className="h-12 w-12 animate-spin text-green-400" />
      </div>
    }>
      <SuccessHandler />
    </Suspense>
  );
}
