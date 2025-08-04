"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Download, Calendar, Mail, Home } from "lucide-react";
import Link from "next/link";

export default function BookingSuccessPage() {
  const params = useParams();
  const eventId = params?.eventId as string;

  useEffect(() => {
    // You can add analytics or confirmation email logic here
    console.log('Booking completed for event:', eventId);
  }, [eventId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Success Animation */}
        <div className="mb-8">
          <div className="animate-bounce">
            <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-4" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Booking Confirmed!</h1>
          <p className="text-xl text-slate-400">
            Your tickets have been booked successfully
          </p>
        </div>

        {/* Success Card */}
        <Card className="glass-card border-slate-700 p-8 mb-8">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
              <p className="text-slate-300">
                Your booking confirmation has been sent to your email address.
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Booking ID</span>
                <span className="text-white font-mono">#BK{Date.now().toString().slice(-6)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Status</span>
                <span className="text-green-500 font-medium">Confirmed</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Payment</span>
                <span className="text-green-500 font-medium">Successful</span>
              </div>
            </div>

            <div className="space-y-4">
              <Button className="w-full bg-accent hover:bg-accent/90 text-white">
                <Download className="mr-2 h-4 w-4" />
                Download Tickets
              </Button>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                  <Calendar className="mr-2 h-4 w-4" />
                  Add to Calendar
                </Button>
                <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                  <Mail className="mr-2 h-4 w-4" />
                  Email Tickets
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Important Information */}
        <Card className="glass-card border-slate-700 p-6 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Important Information</h3>
          <div className="text-left space-y-3 text-slate-300">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p>Please carry a valid ID proof along with your tickets</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p>Arrive at the venue at least 30 minutes before the event starts</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p>Your tickets are non-refundable and non-transferable</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p>Check your email for detailed event information and updates</p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={`/events/${eventId}`}>
            <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
              View Event Details
            </Button>
          </Link>
          <Link href="/">
            <Button className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1]">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Footer Note */}
        <p className="text-slate-400 text-sm mt-8 mb-12">
          Need help? Contact our support team at support@eventingclub.in
        </p>
      </div>
    </div>
  );
}
