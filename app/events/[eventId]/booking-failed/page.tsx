"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, RefreshCcw, Home, AlertTriangle, HelpCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

function BookingFailedContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = params?.eventId as string;
  
  // Get payment details from URL params
  const [paymentDetails, setPaymentDetails] = useState({
    transactionId: searchParams.get('txnid') || 'N/A',
    amount: searchParams.get('amount') || 'N/A',
    status: searchParams.get('status') || 'failed',
    error: searchParams.get('error') || 'Payment was not completed',
    eventName: searchParams.get('eventName') || 'Event',
    bookingId: searchParams.get('bookingId') || '',
    paymentmode: searchParams.get('paymentmode') || '',
  });

  useEffect(() => {
    // Log payment failure
    console.log('Payment failed:', paymentDetails);
  }, [paymentDetails]);

  // Prevent user navigating back to payment gateway — redirect to event page instead
  useEffect(() => {
    const onPop = () => {
      // Replace history and go to event page
      window.location.href = `/events/${eventId}`;
    };

    window.addEventListener('popstate', onPop);

    // Push an extra state so the first back goes to this handler
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('popstate', onPop);
    };
  }, [eventId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black pt-20 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Failed Animation */}
        <div className="text-center mb-8 animate-fadeInUp">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-rose-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <XCircle className="relative h-24 w-24 text-red-400 mx-auto animate-scaleIn" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-6 mb-3">
            Payment Failed
          </h1>
          <p className="text-xl text-slate-300">
            We couldn't complete your booking
          </p>
        </div>

        {/* Payment Details Card */}
        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md border border-slate-700/50 shadow-2xl mb-6">
          <CardHeader className="bg-gradient-to-r from-red-500/15 to-rose-500/15 border-b border-slate-700/50">
            <CardTitle className="text-2xl text-white font-semibold flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-400" />
              Transaction Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/30">
                <p className="text-slate-400 text-sm mb-1">Transaction ID</p>
                <p className="text-white font-semibold text-lg">{paymentDetails.transactionId}</p>
              </div>
              {paymentDetails.bookingId && (
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/30">
                  <p className="text-slate-400 text-sm mb-1">Booking ID</p>
                  <p className="text-white font-semibold text-lg">{paymentDetails.bookingId}</p>
                </div>
              )}
              {paymentDetails.amount !== 'N/A' && (
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/30">
                  <p className="text-slate-400 text-sm mb-1">Attempted Amount</p>
                  <p className="text-slate-300 font-bold text-2xl">₹{paymentDetails.amount}</p>
                </div>
              )}
              <div className={`bg-slate-800/50 p-4 rounded-xl border border-slate-700/30 ${paymentDetails.bookingId || paymentDetails.amount !== 'N/A' ? '' : 'md:col-span-2'}`}>
                <p className="text-slate-400 text-sm mb-1">Payment Status</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-red-400 rounded-full"></div>
                  <p className="text-red-400 font-semibold text-lg capitalize">{paymentDetails.status}</p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            <div className="bg-gradient-to-r from-red-500/10 to-rose-500/10 p-4 rounded-xl border border-red-500/30">
              <p className="text-red-200 text-sm">
                <strong>Reason:</strong> {paymentDetails.error}
              </p>
            </div>

            {/* Event Info */}
            <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/30 mt-6">
              <p className="text-slate-400 text-sm mb-2">Event Name</p>
              <p className="text-white font-semibold text-xl">{paymentDetails.eventName}</p>
            </div>
          </CardContent>
        </Card>

        {/* Common Reasons Card */}
        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md border border-slate-700/50 shadow-2xl mb-6">
          <CardHeader className="bg-gradient-to-r from-[#00E1FC]/15 to-[#0F33D1]/15 border-b border-slate-700/50">
            <CardTitle className="text-xl text-white font-semibold flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-[#00E1FC]" />
              Common Reasons for Payment Failure
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <div className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-slate-300">1</span>
                </div>
                <p className="text-slate-300 text-sm">Insufficient funds in your account</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <div className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-slate-300">2</span>
                </div>
                <p className="text-slate-300 text-sm">Incorrect card details or CVV entered</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <div className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-slate-300">3</span>
                </div>
                <p className="text-slate-300 text-sm">Bank declined the transaction due to security reasons</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <div className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-slate-300">4</span>
                </div>
                <p className="text-slate-300 text-sm">OTP verification timeout or incorrect OTP</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <div className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-slate-300">5</span>
                </div>
                <p className="text-slate-300 text-sm">Network connectivity issues during payment</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Note */}
        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
          <p className="text-blue-200 text-sm">
            <strong>Note:</strong> If any amount was debited from your account, it will be automatically refunded within 5-7 business days. No action is required from your side.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {paymentDetails.paymentmode !== 'FREE' && (
            <Link href={`/events/${eventId}/book`}>
              <Button className="w-full sm:w-auto bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:from-[#00E1FC]/90 hover:to-[#0F33D1]/90 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-[#00E1FC]/25 transition-all duration-300">
                <RefreshCcw className="mr-2 h-5 w-5" />
                Try Again
              </Button>
            </Link>
          )}
          <Link href={`/events/${eventId}`}>
            <Button variant="outline" className="w-full sm:w-auto border-slate-600/50 text-slate-300 hover:bg-slate-800/50 hover:text-white px-8 py-6 text-lg transition-colors">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Event
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto border-slate-600/50 text-slate-300 hover:bg-slate-800/50 hover:text-white px-8 py-6 text-lg transition-colors">
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Button>
          </Link>
        </div>

        {/* Support */}
        <div className="text-center mt-8 p-4 bg-slate-900/50 rounded-xl border border-slate-700/30">
          <p className="text-slate-400 text-sm mb-2">
            Still facing issues? Our support team is here to help!
          </p>
          <a href="mailto:support@eventwebsite.com" className="text-[#00E1FC] hover:underline font-medium">
            support@eventwebsite.com
          </a>
          <span className="text-slate-500 mx-2">|</span>
          <a href="tel:+911234567890" className="text-[#00E1FC] hover:underline font-medium">
            +91 123-456-7890
          </a>
        </div>
      </div>
    </div>
  );
}

export default function BookingFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <BookingFailedContent />
    </Suspense>
  );
}
