"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  IndianRupee,
  Loader2,
  Minus,
  Plus,
  Users,
  MapPin,
  Ticket,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { TicketType } from "@/lib/types";

// ──────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ──────────────────────────────────────────────────────────────────────────────
interface EventDetails {
  EventName: string;
  EventStartDate: string;
  EventStartTime: string;
  TicketPriceStartsFrom: number;
  VenueName: string;
  VenueCity: string;
  categoryName: string;
}

interface ApiResponse {
  error: boolean;
  message: string;
  data: {
    EventDetailsObj: EventDetails;
  };
}

interface EventDateTime {
  eventDateTime_id: string;
  Date: string;
  Time: string;
  Day: string;
  Month: string;
}

interface EventDateTimeResponse {
  error: boolean;
  message: string;
  data: {
    EventName: string;
    DateTimeDate: EventDateTime[];
    SeasonPassCount: number;
  };
}

interface TicketData {
  Ticket_Id: string;
  TicketName: string;
  TicketType: number;
  TicketDescprition: string | null;
  TicketPrice: number;
  EventDateTime_id: string;
  TicketAvailibilty: number;
  BookingMaxLimit: number;
  ConfeeUnit: number;
  ConValue: number;
}

interface TicketResponse {
  error: boolean;
  message: string;
  data: TicketData[];
}

interface BookingForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: string;
  whatsappNumber: string;
  isWhatsApp: 0 | 1;
  note: string;
}

// Mock user for demo
const mockUser = {
  user_id: "user_123",
  email: "user@example.com",
  name: "Demo User",
  role: "customer"
};

export default function BookEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.eventId as string;
  
  // ────────────────────────────────────────────────────────────────────────────
  // Local state
  // ────────────────────────────────────────────────────────────────────────────
  const [loading, setLoading] = React.useState(true);
  const [selectedDateId, setSelectedDateId] = React.useState<string | null>(null);
  const [dates, setDates] = React.useState<EventDateTime[]>([]);
  const [tickets, setTickets] = React.useState<TicketData[]>([]);
  const [counts, setCounts] = React.useState<Record<string, number>>({});
  const [showCount, setShowCount] = React.useState<Record<string, boolean>>({});
  const [customerFormPage, setCustomerFormPage] = React.useState(false);
  const [checkoutPage, setCheckoutPage] = React.useState(false);
  const [eventDetails, setEventDetails] = React.useState<EventDetails | null>(null);

  // Customer details -----------------------------------------------------------
  const [customer, setCustomer] = React.useState<BookingForm>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    age: "",
    note: "",
    whatsappNumber: "",
    isWhatsApp: 1,
  });
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

  // Derived totals -------------------------------------------------------------
  const totalTickets = Object.values(counts).reduce((s, n) => s + n, 0);
  // Calculate total price based only on selected tickets
  const totalPrice = Object.entries(counts).reduce((sum, [ticketId, qty]) => {
    const ticket = tickets.find(t => t.Ticket_Id === ticketId);
    return ticket ? sum + qty * ticket.TicketPrice : sum;
  }, 0);
  const finalAmount = totalPrice;
  const isAnyCountActive = Object.keys(showCount).some((id) => showCount[id] && counts[id] > 0);

  // ────────────────────────────────────────────────────────────────────────────
  // Fetch event details and dates on mount
  // ────────────────────────────────────────────────────────────────────────────
  React.useEffect(() => {
    const loadEventData = async () => {
      if (!eventId) return;
      
      try {
        setLoading(true);
        
        // Fetch event details
        const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL || "";
        const eventDetailsResponse = await axios.post<ApiResponse>(
          `${apiBase}/webiste/events/getEventDetailsById`,
          { event_id: eventId }
        );

        if (eventDetailsResponse.data && !eventDetailsResponse.data.error) {
          setEventDetails(eventDetailsResponse.data.data.EventDetailsObj);
        }

        // Fetch event dates and times
        const datesResponse = await axios.post<EventDateTimeResponse>(
          `${apiBase}/webiste/events/getEventDateTimeById`,
          { event_id: eventId }
        );

        if (datesResponse.data && !datesResponse.data.error) {
          const eventDates = datesResponse.data.data.DateTimeDate;
          setDates(eventDates);
          
          // Auto-select first date and load tickets
          if (eventDates.length > 0) {
            setSelectedDateId(eventDates[0].eventDateTime_id);
            await loadTickets(eventDates[0].eventDateTime_id);
          }
        }
        
      } catch (error) {
        console.error('Failed to fetch event data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [eventId]);

  // Load tickets for selected date
  const loadTickets = async (eventDateTimeId: string) => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "https://node.eventingclub.in";
      const response = await axios.post<TicketResponse>(
        `${apiBase}/webiste/eventtickets/getWebsiteTicketsbyEventDate`,
        {
          event_id: eventId,
          eventDateTime_id: eventDateTimeId
        }
      );

      if (response.data && !response.data.error) {
        setTickets(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Handlers – date click, qty controls, navigation
  // ────────────────────────────────────────────────────────────────────────────
  const handleDateClick = async (eventDateTimeId: string) => {
    setSelectedDateId(eventDateTimeId);
    setCounts({});
    setShowCount({});
    await loadTickets(eventDateTimeId);
  };

  const handleIncrease = (ticketId: string) => {
    setCounts(prev => ({ ...prev, [ticketId]: (prev[ticketId] || 0) + 1 }));
    setShowCount(prev => ({ ...prev, [ticketId]: true }));
  };
  
  const handleDecrease = (ticketId: string) => {
    setCounts((prev) => {
      const newCount = Math.max((prev[ticketId] || 0) - 1, 0);
      if (newCount === 0) {
        // Remove this ticket from counts and showCount, but keep others
        const { [ticketId]: _, ...rest } = prev;
        setShowCount(scPrev => {
          const { [ticketId]: __, ...scRest } = scPrev;
          return scRest;
        });
        return rest;
      }
      return { ...prev, [ticketId]: newCount };
    });
  };
  
  const handleShowCount = (ticketId: string) => setShowCount(prev => ({ ...prev, [ticketId]: true }));

  // ────────────────────────────────────────────────────────────────────────────
  // Customer form & validation
  // ────────────────────────────────────────────────────────────────────────────
  const handleCustChange = (field: keyof BookingForm, value: string | number) => {
    setCustomer((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateCustomerForm = () => {
    const errors: Record<string, string> = {};
    if (!customer.firstName.trim()) errors.firstName = "First name is required";
    if (!customer.lastName.trim()) errors.lastName = "Last name is required";
    if (!customer.phone.trim()) errors.phone = "Phone number is required";
    else if (customer.phone.length !== 10) errors.phone = "Phone number must be 10 digits";
    if (!customer.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) errors.email = "Enter a valid email";
    if (customer.age.trim()) {
      const age = parseInt(customer.age, 10);
      if (isNaN(age) || age < 1 || age > 120) errors.age = "Age should be 1–120";
    }
    if (customer.isWhatsApp === 0 && !customer.whatsappNumber.trim()) errors.whatsappNumber = "WhatsApp no. required";
    else if (customer.isWhatsApp === 0 && customer.whatsappNumber.length !== 10) errors.whatsappNumber = "WhatsApp no. must be 10 digits";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Booking simulation
  // ────────────────────────────────────────────────────────────────────────────
  const handleBooking = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Booking details:', {
        eventId,
        selectedDateId,
        customer,
        tickets: tickets.filter(t => counts[t.Ticket_Id] > 0),
        totalTickets,
        totalPrice: finalAmount
      });
      
      // Reset UI and redirect
      setCounts({});
      setShowCount({});
      setCheckoutPage(false);
      setCustomerFormPage(false);
      setCustomer({ 
        firstName: "", lastName: "", phone: "", email: "", age: "", 
        note: "", whatsappNumber: "", isWhatsApp: 1 
      });
      
      router.push(`/events/${eventId}/booking-success`);
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Loading state
  // ────────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] rounded-full blur-lg opacity-30 animate-pulse"></div>
            <Loader2 className="relative h-12 w-12 animate-spin text-[#00E1FC] mx-auto" />
          </div>
          <p className="text-slate-300 text-lg">Loading event details...</p>
          <div className="flex space-x-1 justify-center">
            <div className="h-2 w-2 bg-[#00E1FC] rounded-full animate-bounce"></div>
            <div className="h-2 w-2 bg-[#00E1FC] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="h-2 w-2 bg-[#00E1FC] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!eventDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-3xl p-12 shadow-2xl">
            <div className="text-6xl mb-6">🎫</div>
            <h1 className="text-4xl font-bold text-white mb-4">Event Not Found</h1>
            <p className="text-slate-300 mb-8 text-lg">The event you're trying to book doesn't exist or has been removed.</p>
            <Link href="/events">
              <Button className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:from-[#00E1FC]/80 hover:to-[#0F33D1]/80 text-white px-8 py-3 text-lg font-medium shadow-lg hover:shadow-[#00E1FC]/25 transition-all duration-300">
                Browse All Events
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // CHECKOUT PAGE (step 3)
  // ---------------------------------------------------------------------------
  if (checkoutPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black pt-20">
        <div className="container mx-auto px-4 sm:px-8 py-8 max-w-5xl">
          <div className="flex items-center gap-3 mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setCheckoutPage(false)} 
              className="text-white hover:bg-white/10 border border-slate-700/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">Final Checkout</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customer summary */}
            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md border border-slate-700/50 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-[#00E1FC]/15 to-[#0F33D1]/15 border-b border-slate-700/50">
                <CardTitle className="text-xl text-white font-semibold">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                    <span className="text-slate-400">Name:</span>
                    <span className="font-medium text-white">{customer.firstName} {customer.lastName}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                    <span className="text-slate-400">Phone:</span>
                    <span className="font-medium text-white">{customer.phone}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                    <span className="text-slate-400">Email:</span>
                    <span className="font-medium text-white">{customer.email}</span>
                  </div>
                  {customer.age && (
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                      <span className="text-slate-400">Age:</span>
                      <span className="font-medium text-white">{customer.age}</span>
                    </div>
                  )}
                  {customer.isWhatsApp === 0 && (
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                      <span className="text-slate-400">WhatsApp:</span>
                      <span className="font-medium text-white">{customer.whatsappNumber}</span>
                    </div>
                  )}
                  {customer.note && (
                    <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                      <span className="text-slate-400 block mb-2">Note:</span>
                      <span className="text-white">{customer.note}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Booking summary */}
            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md border border-slate-700/50 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-[#00E1FC]/15 to-[#0F33D1]/15 border-b border-slate-700/50">
                <CardTitle className="text-xl text-white font-semibold">Booking Summary</CardTitle>
                <CardDescription className="text-slate-300">Review your selection before confirming</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {tickets.filter((t) => counts[t.Ticket_Id] > 0).map((t) => (
                  <div key={t.Ticket_Id} className="flex justify-between items-center bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 hover:bg-slate-800/80 transition-colors">
                    <div className="space-y-1">
                      <p className="font-semibold text-white">{t.TicketName}</p>
                      <p className="text-xs text-slate-400">Quantity: {counts[t.Ticket_Id]}</p>
                    </div>
                    <p className="text-lg font-bold text-[#00E1FC]">₹{counts[t.Ticket_Id] * t.TicketPrice}</p>
                  </div>
                ))}

                <Separator className="bg-slate-600/50" />
                
                <div className="space-y-3">
                  <div className="flex justify-between text-slate-300 p-3 bg-slate-800/30 rounded-lg">
                    <span>Subtotal</span>
                    <span className="font-medium">₹{totalPrice}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-gradient-to-r from-[#00E1FC]/20 to-[#0F33D1]/20 p-4 rounded-xl border border-[#00E1FC]/30 shadow-lg">
                  <p className="font-bold text-white text-lg">Total ({totalTickets} ticket{totalTickets !== 1 ? "s" : ""})</p>
                  <p className="text-2xl font-bold text-[#00E1FC]">₹{finalAmount}</p>
                </div>

                <Button 
                  className="w-full h-12 bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:from-[#00E1FC]/90 hover:to-[#0F33D1]/90 text-white font-semibold shadow-lg hover:shadow-[#00E1FC]/25 transition-all duration-300 transform hover:scale-[1.02]" 
                  onClick={handleBooking}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Confirm Booking ₹{finalAmount}
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-slate-400 text-center mt-3">
                  🔒 Your payment is secured with 256-bit SSL encryption
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // CUSTOMER FORM (step 2)
  // ---------------------------------------------------------------------------
  if (customerFormPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black pt-20">
        <div className="container mx-auto px-4 sm:px-8 py-8 max-w-5xl">
          <div className="flex items-center gap-3 mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setCustomerFormPage(false)} 
              className="text-white hover:bg-white/10 border border-slate-700/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">Customer Details</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <Card className="lg:col-span-2 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md border border-slate-700/50 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-[#00E1FC]/15 to-[#0F33D1]/15 border-b border-slate-700/50">
                <CardTitle className="text-xl text-white font-semibold">Contact Information</CardTitle>
                <CardDescription className="text-slate-300">Required for booking confirmation and ticket delivery</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-200 font-medium">First Name *</Label>
                    <Input 
                      value={customer.firstName} 
                      className="bg-slate-800/60 border-slate-600/50 text-white placeholder-slate-400 focus:border-[#00E1FC] focus:ring-[#00E1FC]/20 transition-colors" 
                      placeholder="Enter first name"
                      onChange={(e) => handleCustChange("firstName", e.target.value)} 
                    />
                    {formErrors.firstName && <p className="text-red-400 text-xs mt-1">{formErrors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-200 font-medium">Last Name *</Label>
                    <Input 
                      value={customer.lastName} 
                      className="bg-slate-800/60 border-slate-600/50 text-white placeholder-slate-400 focus:border-[#00E1FC] focus:ring-[#00E1FC]/20 transition-colors" 
                      placeholder="Enter last name"
                      onChange={(e) => handleCustChange("lastName", e.target.value)} 
                    />
                    {formErrors.lastName && <p className="text-red-400 text-xs mt-1">{formErrors.lastName}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200 font-medium">Phone Number *</Label>
                  <Input 
                    value={customer.phone} 
                    maxLength={10} 
                    className="bg-slate-800/60 border-slate-600/50 text-white placeholder-slate-400 focus:border-[#00E1FC] focus:ring-[#00E1FC]/20 transition-colors" 
                    placeholder="Enter 10-digit phone number"
                    onChange={(e) => handleCustChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} 
                  />
                  {formErrors.phone && <p className="text-red-400 text-xs mt-1">{formErrors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200 font-medium">Email Address *</Label>
                  <Input 
                    value={customer.email} 
                    type="email" 
                    className="bg-slate-800/60 border-slate-600/50 text-white placeholder-slate-400 focus:border-[#00E1FC] focus:ring-[#00E1FC]/20 transition-colors" 
                    placeholder="Enter email address"
                    onChange={(e) => handleCustChange("email", e.target.value)} 
                  />
                  {formErrors.email && <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200 font-medium">Age (Optional)</Label>
                  <Input 
                    value={customer.age} 
                    type="number" 
                    className="bg-slate-800/60 border-slate-600/50 text-white placeholder-slate-400 focus:border-[#00E1FC] focus:ring-[#00E1FC]/20 transition-colors" 
                    placeholder="Enter age"
                    onChange={(e) => handleCustChange("age", e.target.value)} 
                  />
                  {formErrors.age && <p className="text-red-400 text-xs mt-1">{formErrors.age}</p>}
                </div>

                <div className="space-y-3">
                  <Label className="text-slate-200 font-medium">Is this a WhatsApp number?</Label>
                  <div className="flex gap-6 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-200 hover:text-white transition-colors">
                      <input 
                        type="radio" 
                        checked={customer.isWhatsApp === 1} 
                        onChange={() => handleCustChange("isWhatsApp", 1)}
                        className="accent-[#00E1FC] w-4 h-4"
                      /> 
                      Yes, same number
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-200 hover:text-white transition-colors">
                      <input 
                        type="radio" 
                        checked={customer.isWhatsApp === 0} 
                        onChange={() => handleCustChange("isWhatsApp", 0)}
                        className="accent-[#00E1FC] w-4 h-4"
                      /> 
                      No, different number
                    </label>
                  </div>
                </div>

                {customer.isWhatsApp === 0 && (
                  <div className="space-y-2">
                    <Label className="text-slate-200 font-medium">WhatsApp Number *</Label>
                    <Input 
                      value={customer.whatsappNumber} 
                      maxLength={10} 
                      className="bg-slate-800/60 border-slate-600/50 text-white placeholder-slate-400 focus:border-[#00E1FC] focus:ring-[#00E1FC]/20 transition-colors" 
                      placeholder="Enter WhatsApp number"
                      onChange={(e) => handleCustChange("whatsappNumber", e.target.value.replace(/\D/g, "").slice(0, 10))} 
                    />
                    {formErrors.whatsappNumber && <p className="text-red-400 text-xs mt-1">{formErrors.whatsappNumber}</p>}
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-slate-200 font-medium">Special Notes (Optional)</Label>
                  <textarea 
                    rows={3} 
                    value={customer.note} 
                    className="w-full p-3 rounded-xl border border-slate-600/50 bg-slate-800/60 text-white placeholder-slate-400 focus:border-[#00E1FC] focus:ring-[#00E1FC]/20 focus:outline-none transition-colors resize-none" 
                    placeholder="Any special requirements, dietary restrictions, or notes for the event organizers..."
                    onChange={(e) => handleCustChange("note", e.target.value)} 
                  />
                </div>

                <Button 
                  className="w-full h-12 bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:from-[#00E1FC]/90 hover:to-[#0F33D1]/90 text-white font-semibold shadow-lg hover:shadow-[#00E1FC]/25 transition-all duration-300 transform hover:scale-[1.02]" 
                  onClick={() => validateCustomerForm() && setCheckoutPage(true)}
                >
                  Continue to Checkout →
                </Button>
              </CardContent>
            </Card>

            {/* Sidebar summary */}
            <Card className="lg:col-span-1 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md border border-slate-700/50 shadow-2xl sticky top-4 h-fit">
              <CardHeader className="bg-gradient-to-r from-[#00E1FC]/15 to-[#0F33D1]/15 border-b border-slate-700/50">
                <CardTitle className="text-xl text-white font-semibold">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  {tickets.filter((t) => counts[t.Ticket_Id] > 0).map((t) => (
                    <div key={t.Ticket_Id} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{t.TicketName}</p>
                        <p className="text-slate-400 text-xs">Qty: {counts[t.Ticket_Id]}</p>
                      </div>
                      <span className="font-semibold text-[#00E1FC]">₹{counts[t.Ticket_Id] * t.TicketPrice}</span>
                    </div>
                  ))}
                </div>
                <Separator className="bg-slate-600/50" />
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-[#00E1FC]/10 to-[#0F33D1]/10 rounded-lg border border-[#00E1FC]/20">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-[#00E1FC] font-bold text-lg">₹{finalAmount}</span>
                </div>
                <p className="text-xs text-slate-400 text-center">
                  ✨ All taxes included
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // MAIN PAGE (step 1 – select date & tickets)
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black pt-20">
      <div className="container mx-auto px-4 sm:px-8 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <Link href={`/events/${eventId}`}>
              <Button variant="ghost" className="text-white hover:bg-white/10 border border-slate-700/50">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Event
              </Button>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight">Book Event Tickets</h1>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700/50">
            <ShieldCheck className="h-5 w-5 text-green-400" />
            <span className="text-sm text-slate-300">Secure & Encrypted</span>
          </div>
        </div>

        {/* Event Info Card */}
        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md border border-slate-700/50 shadow-2xl mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-3">{eventDetails.EventName}</h2>
                <Badge variant="secondary" className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] text-white mb-4 px-3 py-1">
                  {eventDetails.categoryName}
                </Badge>
                <div className="flex flex-wrap gap-4 text-slate-300">
                  <div className="flex items-center bg-slate-800/50 px-3 py-2 rounded-lg">
                    <CalendarDays className="h-4 w-4 mr-2 text-[#00E1FC]" />
                    <span className="text-sm">{eventDetails.EventStartDate}</span>
                  </div>
                  <div className="flex items-center bg-slate-800/50 px-3 py-2 rounded-lg">
                    <Clock className="h-4 w-4 mr-2 text-[#00E1FC]" />
                    <span className="text-sm">{eventDetails.EventStartTime}</span>
                  </div>
                  <div className="flex items-center bg-slate-800/50 px-3 py-2 rounded-lg">
                    <MapPin className="h-4 w-4 mr-2 text-[#00E1FC]" />
                    <span className="text-sm">{eventDetails.VenueName}, {eventDetails.VenueCity}</span>
                  </div>
                </div>
              </div>
              <div className="text-right bg-slate-800/50 p-4 rounded-xl border border-slate-700/30">
                <p className="text-slate-400 text-sm mb-1">Starting from</p>
                <p className="text-3xl font-bold text-[#00E1FC] flex items-center justify-end">
                  <IndianRupee className="h-6 w-6" />
                  {eventDetails.TicketPriceStartsFrom}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date selection */}
        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md border border-slate-700/50 shadow-2xl mb-8">
          <CardHeader className="bg-gradient-to-r from-[#00E1FC]/15 to-[#0F33D1]/15 border-b border-slate-700/50">
            <CardTitle className="flex items-center gap-2 text-xl text-white font-semibold">
              <CalendarDays className="h-5 w-5 text-[#00E1FC]" /> 
              {dates.length === 1 ? "Event Date" : "Select Event Date"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-4 flex-wrap">
              {dates.map((d) => {
                const selected = selectedDateId === d.eventDateTime_id;
                return (
                  <div 
                    key={d.eventDateTime_id} 
                    onClick={() => handleDateClick(d.eventDateTime_id)} 
                    className={`cursor-pointer border-2 rounded-2xl px-6 py-4 min-w-[160px] text-center transition-all duration-300 ${
                      selected 
                        ? "border-[#00E1FC] bg-gradient-to-r from-[#00E1FC]/20 to-[#0F33D1]/20 scale-105 shadow-lg shadow-[#00E1FC]/25" 
                        : "border-slate-600/50 bg-slate-800/30 hover:border-[#00E1FC]/50 hover:bg-slate-800/50"
                    }`}
                  >
                    <p className="text-sm font-semibold text-white mb-1">{d.Day}</p>
                    <p className="text-xs text-slate-400 mb-2">{d.Month} 2025</p>
                    <span className={`inline-block text-xl font-bold rounded-full px-4 py-2 ${
                      selected 
                        ? "bg-[#00E1FC] text-white shadow-lg" 
                        : "bg-slate-700 text-[#00E1FC]"
                    }`}>
                      {d.Date}
                    </span>
                    <p className="text-xs text-slate-400 mt-2">{d.Time}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Ticket selection */}
        {selectedDateId && (
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md border border-slate-700/50 shadow-2xl mb-8">
            <CardHeader className="bg-gradient-to-r from-[#00E1FC]/15 to-[#0F33D1]/15 border-b border-slate-700/50">
              <CardTitle className="flex items-center gap-2 text-xl text-white font-semibold">
                <Users className="h-5 w-5 text-[#00E1FC]" /> 
                Available Tickets
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {tickets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🎫</div>
                  <p className="text-slate-300 text-lg">No tickets available for this date</p>
                  <p className="text-slate-500 text-sm mt-2">Please select a different date or check back later</p>
                </div>
              ) : (
                tickets.map((t) => {
                  const count = counts[t.Ticket_Id] || 0;
                  const selected = showCount[t.Ticket_Id];
                  const soldOut = t.TicketAvailibilty === 0;
                  const maxAllowed = t.BookingMaxLimit;
                  
                  return (
                    <Card 
                      key={t.Ticket_Id} 
                      className={`border-2 transition-all duration-300 ${
                        selected 
                          ? "border-[#00E1FC] bg-slate-900/90 shadow-lg shadow-[#00E1FC]/20" 
                          : "border-slate-600/50 bg-slate-800/30 hover:border-[#00E1FC]/50 hover:bg-slate-800/50"
                      } ${soldOut ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <CardContent className="p-5">
                        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                          <div className="flex-1 space-y-3 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <h3 className={`font-bold text-lg leading-tight ${selected ? "text-white" : "text-white"}`}>{t.TicketName}</h3>
                              <Badge 
                                variant="outline" 
                                className={`shrink-0 ${
                                  soldOut ? "border-red-400/50 text-red-300 bg-red-900/20" : "border-green-400/50 text-green-300 bg-green-900/20"
                                }`}
                              >
                                {soldOut ? "Sold Out" : "Available"}
                              </Badge>
                            </div>
                            {t.TicketDescprition && (
                              <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/50 p-3 rounded-lg border border-slate-700/30">
                                {t.TicketDescprition}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                              <span className="bg-slate-800/50 px-2 py-1 rounded">Max {maxAllowed} per order</span>
                              <span className="bg-slate-800/50 px-2 py-1 rounded">Type: {t.TicketType === 1 ? 'Standard' : 'Special'}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-row lg:flex-col items-center gap-4 lg:gap-3">
                            <div className="text-center bg-slate-800/50 p-4 rounded-xl border border-slate-700/30">
                              <p className="text-3xl font-bold text-[#00E1FC] flex items-center justify-center">
                                <IndianRupee className="h-6 w-6" />
                                {t.TicketPrice}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">per ticket</p>
                            </div>
                            
                            {selected ? (
                              <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-700/30">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleDecrease(t.Ticket_Id)} 
                                  className="h-10 w-10 p-0 border-slate-600/50 hover:bg-slate-700/50 text-white"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-10 text-center font-bold text-[#00E1FC] text-xl">
                                  {count}
                                </span>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleIncrease(t.Ticket_Id)} 
                                  disabled={count >= maxAllowed} 
                                  className="h-10 w-10 p-0 border-slate-600/50 hover:bg-slate-700/50 text-white disabled:opacity-50"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                onClick={() => handleShowCount(t.Ticket_Id)} 
                                disabled={soldOut} 
                                className="px-8 py-3 bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:from-[#00E1FC]/90 hover:to-[#0F33D1]/90 text-white font-semibold shadow-lg hover:shadow-[#00E1FC]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {soldOut ? "Sold Out" : "Select Tickets"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </CardContent>
          </Card>
        )}

        {/* Sticky footer checkout */}
        {totalTickets > 0 && (
          <Card className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-md border border-slate-700/50 shadow-2xl sticky bottom-4 z-10">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-3xl font-bold text-[#00E1FC] flex items-center justify-center sm:justify-start">
                    <IndianRupee className="h-7 w-7" />
                    {finalAmount}
                  </p>
                  <p className="text-sm text-slate-300">
                    {totalTickets} ticket{totalTickets !== 1 ? "s" : ""} selected
                  </p>
                </div>
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:from-[#00E1FC]/90 hover:to-[#0F33D1]/90 text-white font-semibold text-lg shadow-lg hover:shadow-[#00E1FC]/25 transition-all duration-300 transform hover:scale-[1.02]" 
                  onClick={() => setCustomerFormPage(true)}
                >
                  Continue to Details →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
