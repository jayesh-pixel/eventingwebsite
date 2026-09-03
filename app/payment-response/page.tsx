"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function PaymentResponseHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get payment response parameters from URL
    const status = searchParams.get('status');
    const txnid = searchParams.get('txnid');
    const amount = searchParams.get('amount');
    const productinfo = searchParams.get('productinfo');
    const firstname = searchParams.get('firstname');
    const email = searchParams.get('email');
    const mihpayid = searchParams.get('mihpayid');
    const error = searchParams.get('error');
    const error_Message = searchParams.get('error_Message');
    
    // Extract event ID from productinfo, URL, or sessionStorage
    const eventIdMatch = productinfo?.match(/event_(\w+)/) || window.location.pathname.match(/events\/([^\/]+)/);
    let eventId = eventIdMatch ? eventIdMatch[1] : '';
    
    // Fallback to sessionStorage (set by booking page before PayU redirect)
    if (!eventId) {
      eventId = sessionStorage.getItem('lastEventId') || 'unknown';
    }

    console.log('Payment Response:', {
      status,
      txnid,
      amount,
      productinfo,
      eventId,
      error,
      error_Message
    });

    // Handle payment status
    if (status === 'success') {
      // Redirect to success page with details
      const successParams = new URLSearchParams({
        txnid: txnid || '',
        amount: amount || '',
        status: status,
        bookingId: mihpayid || txnid || '',
        email: email || '',
        eventName: productinfo || 'Event'
      });
      
      router.replace(`/events/${eventId}/booking-success?${successParams.toString()}`);
    } else if (status === 'failure' || status === 'cancel') {
      // Redirect to failed page with details
      const failParams = new URLSearchParams({
        txnid: txnid || '',
        amount: amount || '',
        status: status,
        error: error_Message || error || 'Payment was not completed',
        eventName: productinfo || 'Event'
      });
      
      router.replace(`/events/${eventId}/booking-failed?${failParams.toString()}`);
    } else {
      // Unknown status, redirect to failed page
      const failParams = new URLSearchParams({
        txnid: txnid || 'N/A',
        amount: amount || '0',
        status: 'unknown',
        error: 'Payment status could not be determined',
        eventName: productinfo || 'Event'
      });
      
      router.replace(`/events/${eventId}/booking-failed?${failParams.toString()}`);
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] rounded-full blur-lg opacity-30 animate-pulse"></div>
          <Loader2 className="relative h-16 w-16 animate-spin text-[#00E1FC] mx-auto" />
        </div>
        <p className="text-slate-300 text-xl font-medium">Processing payment response...</p>
        <p className="text-slate-400 text-sm">Please wait while we verify your payment</p>
        <div className="flex space-x-1 justify-center mt-4">
          <div className="h-2 w-2 bg-[#00E1FC] rounded-full animate-bounce"></div>
          <div className="h-2 w-2 bg-[#00E1FC] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="h-2 w-2 bg-[#00E1FC] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentResponsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black">
        <Loader2 className="h-12 w-12 animate-spin text-[#00E1FC]" />
      </div>
    }>
      <PaymentResponseHandler />
    </Suspense>
  );
}
