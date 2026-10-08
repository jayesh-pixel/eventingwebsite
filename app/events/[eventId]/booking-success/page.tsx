"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Download, Calendar, Mail, Home, MapPin, Ticket, ArrowRight } from "lucide-react";
import Link from "next/link";

function BookingSuccessContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params?.eventId as string;
  
  // Get payment details from URL params
  const [paymentDetails, setPaymentDetails] = useState({
    transactionId: searchParams.get('txnid') || 'N/A',
    amount: searchParams.get('amount') || 'N/A',
    status: searchParams.get('status') || 'success',
    bookingId: searchParams.get('bookingId') || 'N/A',
    email: searchParams.get('email') || '',
    eventName: searchParams.get('eventName') || 'Event',
    paymentmode: searchParams.get('paymentmode') || '',
  });

  const isFreeBooking = paymentDetails.paymentmode === 'FREE';

  useEffect(() => {
    // Log payment success
    console.log('Payment successful:', paymentDetails);
  }, [paymentDetails]);

  // Prevent back navigation to payment gateway — send user to event details instead
  useEffect(() => {
    const onPop = () => {
      window.location.href = `/events/${eventId}`;
    };

    window.addEventListener('popstate', onPop);
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('popstate', onPop);
    };
  }, [eventId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black pt-6 sm:pt-20 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Success Animation */}
        <div className="text-center mb-6 sm:mb-8 animate-fadeInUp">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <CheckCircle2 className="relative h-20 w-20 sm:h-24 sm:w-24 text-green-400 mx-auto animate-scaleIn" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-4 sm:mt-6 mb-3">
            {isFreeBooking ? "Booking Confirmed! 🎉" : "Booking Confirmed! 🎉"}
          </h1>
          <p className="text-base sm:text-xl text-slate-300">
            {isFreeBooking ? "Your free booking has been successfully confirmed" : "Your tickets have been successfully booked"}
          </p>
        </div>

        {/* Payment Details Card */}
        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md border border-slate-700/50 shadow-2xl mb-6">
          <CardHeader className="bg-gradient-to-r from-green-500/15 to-emerald-500/15 border-b border-slate-700/50 p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl text-white font-semibold flex items-center gap-3">
              <Ticket className="h-6 w-6 text-green-400" />
              Booking Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/30">
                <p className="text-slate-400 text-sm mb-1">Transaction ID</p>
                <p className="text-white font-semibold text-lg break-all">{paymentDetails.transactionId}</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/30">
                <p className="text-slate-400 text-sm mb-1">Booking ID</p>
                <p className="text-white font-semibold text-lg break-all">{paymentDetails.bookingId}</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/30">
                <p className="text-slate-400 text-sm mb-1">{isFreeBooking ? "Amount" : "Amount Paid"}</p>
                <p className="text-green-400 font-bold text-2xl">{isFreeBooking ? "FREE" : `₹${paymentDetails.amount}`}</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/30">
                <p className="text-slate-400 text-sm mb-1">Payment Status</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-green-400 font-semibold text-lg capitalize">{isFreeBooking ? 'confirmed' : paymentDetails.status}</p>
                </div>
              </div>
            </div>

            {/* Event Info */}
            <div className="bg-gradient-to-r from-[#00E1FC]/10 to-[#0F33D1]/10 p-4 rounded-xl border border-[#00E1FC]/20 mt-6">
              <p className="text-slate-400 text-sm mb-2">Event Name</p>
              <p className="text-white font-semibold text-lg sm:text-xl break-words">{paymentDetails.eventName}</p>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps Card */}
        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md border border-slate-700/50 shadow-2xl mb-6">
          <CardHeader className="bg-gradient-to-r from-[#00E1FC]/15 to-[#0F33D1]/15 border-b border-slate-700/50 p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl text-white font-semibold">What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                <Mail className="h-6 w-6 text-[#00E1FC] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Check Your Email</h3>
                  <p className="text-slate-300 text-sm">
                    We've sent your tickets and booking confirmation to <span className="text-[#00E1FC] font-medium break-all">{paymentDetails.email || 'your registered email'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                <Download className="h-6 w-6 text-[#00E1FC] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Download Your Tickets</h3>
                  <p className="text-slate-300 text-sm">
                    Your e-tickets are attached in the email. Download and save them on your device.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                <Calendar className="h-6 w-6 text-[#00E1FC] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Mark Your Calendar</h3>
                  <p className="text-slate-300 text-sm">
                    Don't forget to add the event to your calendar and set a reminder!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                <MapPin className="h-6 w-6 text-[#00E1FC] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Plan Your Visit</h3>
                  <p className="text-slate-300 text-sm">
                    Check the venue location and plan your journey. Arrive 30 minutes before the event starts.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Note */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
          <p className="text-amber-200 text-sm">
            <strong>Important:</strong> Please carry a valid ID proof and your e-ticket (printed or digital) to the venue. Screenshots of tickets will not be accepted.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:from-[#00E1FC]/90 hover:to-[#0F33D1]/90 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-[#00E1FC]/25 transition-all duration-300">
              <Home className="mr-2 h-5 w-5" />
              Go to Home
            </Button>
          </Link>
          <Link href={`/events/${eventId}`}>
            <Button variant="outline" className="w-full sm:w-auto border-slate-600/50 text-slate-300 hover:bg-slate-800/50 hover:text-white px-8 py-6 text-lg transition-colors">
              View Event Details
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Support */}
        <div className="text-center mt-8 p-4 bg-slate-900/50 rounded-xl border border-slate-700/30">
          <p className="text-slate-400 text-sm">
            Need help? Contact our support team at{" "}
            <a href="mailto:support@eventwebsite.com" className="text-[#00E1FC] hover:underline break-all">
              support@eventwebsite.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}
