"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
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
import { bookTicketApi, customer as customerApi, promocode } from "@/utils/config";
import { encryptData, decryptData } from "@/utils/constants";
import toast, { Toaster } from "react-hot-toast";

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

interface CustomerProfileResponse {
  error?: boolean;
  message?: string;
  data?: {
    CustomerName?: string;
    Email?: string;
    MobileNumber?: string;
    Address?: string;
    Pincode?: string;
    Country?: string;
    State?: string;
    City?: string;
  };
}

interface PromocodeData {
  _id?: string;
  promocode_id?: string;
  PromoCodeName: string;
  TermsCondition: string;
  PromType: number; // 1 for fixed amount, 2 for percentage
  Value: number;
  MinAmount?: number;
  MinCheckoutAmount?: string;
  ExpiryDate?: string;
  OneTimeUseFlag?: string;
  PromocodeValidFor?: string;
}

interface PromocodeListResponse {
  error: boolean;
  message: string;
  data: PromocodeData[];
}

interface ApplyPromocodeResponse {
  error: boolean;
  message: string;
  data: PromocodeData;
}

interface BookingPayload {
  customer_id: string;
  event_id: string;
  EventTicket_id: string;
  TicketQuantity: number;
  Promocode_id?: string;
}

const asString = (value: unknown) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const normalizeTicketDescription = (value: string | null) => {
  const text = asString(value).replace(/\s+/g, " ").trim();
  if (!text) return "";

  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const deduped = sentences.filter((sentence, index) => {
    if (index === 0) return true;
    return sentence.trim().toLowerCase() !== sentences[index - 1].trim().toLowerCase();
  });

  return deduped.join(" ");
};

export default function BookEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.eventId as string;
  
  // Authentication state
  const auth = useSelector((store: any) => store.uSess);
  const passphrase = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "";
  
  // Decrypt auth data
  const isLoggedIn = auth?.jL3 ? decryptData(auth.jL3, passphrase) : null;
  const customerId = auth?.xA1 ? decryptData(auth.xA1, passphrase) : null;
  const customerExists = auth?.zX9 ? decryptData(auth.zX9, passphrase) : null;
  
  // Check if user is authenticated
  const isAuthenticated = isLoggedIn === "true" && customerId;
  
  // ────────────────────────────────────────────────────────────────────────────
  // Local state
  // ────────────────────────────────────────────────────────────────────────────
  const [loading, setLoading] = React.useState(true);
  const [paymentProcessing, setPaymentProcessing] = React.useState(false);
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const [selectedDateId, setSelectedDateId] = React.useState<string | null>(null);
  const [dates, setDates] = React.useState<EventDateTime[]>([]);
  const [tickets, setTickets] = React.useState<TicketData[]>([]);
  const [counts, setCounts] = React.useState<Record<string, number>>({});
  const [showCount, setShowCount] = React.useState<Record<string, boolean>>({});
  const [expandedDescriptions, setExpandedDescriptions] = React.useState<Record<string, boolean>>({});
  const [eventDetails, setEventDetails] = React.useState<EventDetails | null>(null);
  const [currentStep, setCurrentStep] = React.useState<1 | 2 | 3 | 4>(1);

  // Promocode state ------------------------------------------------------------
  const [promocodeInput, setPromocodeInput] = React.useState("");
  const [appliedPromocode, setAppliedPromocode] = React.useState<PromocodeData | null>(null);
  const [promocodeLoading, setPromocodeLoading] = React.useState(false);
  const [promocodeError, setPromocodeError] = React.useState("");
  const [availablePromocodes, setAvailablePromocodes] = React.useState<PromocodeData[]>([]);
  const [showPromocodeSuggestions, setShowPromocodeSuggestions] = React.useState(false);

  // Normalize backend promocode object to frontend shape
  const normalizePromocode = (p: any): PromocodeData => {
    return {
      _id: p._id || p.promocode_id || p.id,
      promocode_id: p.promocode_id || p._id,
      PromoCodeName: p.PromoCodeName || p.PromoCode || p.promocode_name || p.PromoCodeName,
      TermsCondition: p.TermsCondition || p.Terms || p.terms || p.TermsCondition || "",
      PromType: p.PromType ?? p.PromocodeType ?? p.Promocode_Type ?? 1,
      Value: Number(p.Value ?? p.value ?? 0),
      MinAmount: Number(p.MinAmount ?? p.minAmount ?? p.MinCheckoutAmount ?? 0),
      MinCheckoutAmount: p.MinCheckoutAmount ?? p.MinAmount ?? undefined,
      ExpiryDate: p.ExpiryDate ?? p.expiryDate ?? undefined,
      OneTimeUseFlag: p.OneTimeUseFlag ?? p.oneTimeUseFlag ?? undefined,
      PromocodeValidFor: p.PromocodeValidFor ?? p.promocodeValidFor ?? undefined,
    } as PromocodeData;
  };
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
  
  // Calculate discount from promocode
  let discountAmount = 0;
  if (appliedPromocode) {
    if (appliedPromocode.PromType === 1) {
      // Fixed amount discount
      discountAmount = Math.min(Number(appliedPromocode.Value ?? 0), totalPrice);
    } else if (appliedPromocode.PromType === 2) {
      // Percentage discount
      discountAmount = Math.min((totalPrice * Number(appliedPromocode.Value ?? 0)) / 100, totalPrice);
    }
  }
  
  const finalAmount = Math.max(0, totalPrice - discountAmount);
  const selectedTickets = tickets.filter((ticket) => counts[ticket.Ticket_Id] > 0);
  const selectedTicket = selectedTickets[0] ?? null;

  // (Single-page booking flow) If user returns after login, keep selections and continue inline.

  // Fetch available promocodes
  React.useEffect(() => {
    const fetchPromocodes = async () => {
      if (!eventId || !customerId) return;
      
      try {
        const response = await axios.post<PromocodeListResponse>(
          promocode.GET_ALL,
          {
            event_id: eventId,
            customer_id: customerId
          }
        );
        
        if (response.data && !response.data.error) {
          setAvailablePromocodes((response.data.data || []).map((p: any) => normalizePromocode(p)));
        }
      } catch (error) {
        console.error('Failed to fetch promocodes:', error);
      }
    };
    
    fetchPromocodes();
  }, [eventId, customerId]);

  React.useEffect(() => {
    const fetchCustomerProfile = async () => {
      if (!customerId) return;

      try {
        const response = await axios.post<CustomerProfileResponse>(customerApi.GET_BY_ID, {
          customer_id: customerId,
        });

        const data = response.data?.data;
        if (!data) return;

        const customerName = asString(data.CustomerName).trim();
        const [firstName = "", ...lastNameParts] = customerName.split(/\s+/).filter(Boolean);
        const email = asString(data.Email).trim();
        const phone = asString(data.MobileNumber).trim();

        setCustomer((prev) => ({
          ...prev,
          firstName: prev.firstName || firstName,
          lastName: prev.lastName || lastNameParts.join(" "),
          email: prev.email || email,
          phone: prev.phone || phone,
        }));
      } catch (error) {
        console.error("Failed to fetch customer profile:", error);
      }
    };

    fetchCustomerProfile();
  }, [customerId]);

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
          
          // Auto-select the date if there's only one, or first date if multiple
          if (eventDates.length > 0) {
            const dateToSelect = eventDates[0].eventDateTime_id;
            setSelectedDateId(dateToSelect);
            await loadTickets(dateToSelect);
            setCurrentStep(eventDates.length === 1 ? 2 : 1);
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
      const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL || "";
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
    setAppliedPromocode(null);
    setPromocodeInput("");
    setPromocodeError("");
    setCurrentStep(2);
    await loadTickets(eventDateTimeId);
  };

  const handleIncrease = (ticketId: string) => {
    setCounts(prev => {
      // Check if there are any other tickets selected
      const hasOtherTickets = Object.keys(prev).some(id => id !== ticketId && prev[id] > 0);
      
      if (hasOtherTickets) {
        toast.error("Please select only one ticket type per booking. Remove other tickets first.");
        return prev;
      }
      
      // Get the booking max limit for this ticket
      const ticket = tickets.find(t => t.Ticket_Id === ticketId);
      const maxAllowed = ticket?.BookingMaxLimit || 1;
      const currentCount = prev[ticketId] || 0;
      
      if (currentCount >= maxAllowed) {
        toast.error(`Maximum ${maxAllowed} ticket${maxAllowed > 1 ? 's' : ''} allowed per booking.`);
        return prev;
      }
      
      return { ...prev, [ticketId]: (prev[ticketId] || 0) + 1 };
    });
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

  // ────────────────────────────────────────────────────────────────────────────
  // Promocode functions
  // ────────────────────────────────────────────────────────────────────────────
  const handleApplyPromocode = async () => {
    if (!promocodeInput.trim()) {
      setPromocodeError("Please enter a promocode");
      return;
    }
    
    if (!eventId || !customerId) {
      toast.error("Please login to apply promocode");
      return;
    }
    
    setPromocodeLoading(true);
    setPromocodeError("");
    
    try {
      const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL || "";
      const response = await axios.post<ApplyPromocodeResponse>(
        `${apiBase}/webiste/promocodes/applyPromocodeForWebsite`,
        {
          event_id: eventId,
          customer_id: customerId,
          promocode_name: promocodeInput.trim(),
          amount: totalPrice.toString()
        }
      );
      
      if (response.data && !response.data.error) {
        setAppliedPromocode(normalizePromocode(response.data.data));
        toast.success(`Promocode "${promocodeInput}" applied successfully!`);
        setPromocodeInput("");
        setShowPromocodeSuggestions(false);
      } else {
        setPromocodeError(response.data.message || "Invalid promocode");
        toast.error(response.data.message || "Invalid promocode");
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to apply promocode";
      setPromocodeError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setPromocodeLoading(false);
    }
  };

  const handleRemovePromocode = () => {
    setAppliedPromocode(null);
    setPromocodeInput("");
    setPromocodeError("");
    toast.success("Promocode removed");
  };
  
  const handleContinueToDetails = () => {
    if (!selectedDateId) {
      toast.error("Please select an event date");
      return;
    }

    if (selectedTickets.length === 0) {
      toast.error("Please select at least one ticket");
      return;
    }

    if (selectedTickets.length > 1) {
      toast.error("Please select only one ticket type per booking.");
      return;
    }

    if (!isAuthenticated) {
      const currentUrl = window.location.pathname;
      sessionStorage.setItem('redirectAfterLogin', currentUrl);
      setShowLoginModal(true);
      return;
    }
    setCurrentStep(3);
  };

  const handleContinueToCheckout = () => {
    if (!validateCustomerForm()) {
      toast.error("Please correct customer details");
      return;
    }

    setCurrentStep(4);
  };

  const handleShowCount = (ticketId: string) => setShowCount(prev => ({ ...prev, [ticketId]: true }));

  // ────────────────────────────────────────────────────────────────────────────
  // Customer form & validation
  // ────────────────────────────────────────────────────────────────────────────
  const handleCustChange = (field: keyof BookingForm, value: string | number) => {
    setCustomer((prev) => {
      const normalizedValue = typeof value === "number" ? String(value) : value;
      return { ...prev, [field]: normalizedValue } as BookingForm;
    });
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateCustomerForm = () => {
    const errors: Record<string, string> = {};
    const firstName = asString(customer.firstName).trim();
    const lastName = asString(customer.lastName).trim();
    const phone = asString(customer.phone).trim();
    const email = asString(customer.email).trim();
    const ageValue = asString(customer.age).trim();
    const whatsappNumber = asString(customer.whatsappNumber).trim();

    if (!firstName) errors.firstName = "First name is required";
    if (!lastName) errors.lastName = "Last name is required";
    if (!phone) errors.phone = "Phone number is required";
    else if (phone.length !== 10) errors.phone = "Phone number must be 10 digits";
    if (!email) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email";
    if (ageValue) {
      const age = parseInt(ageValue, 10);
      if (isNaN(age) || age < 1 || age > 120) errors.age = "Age should be 1–120";
    }
    if (customer.isWhatsApp === 0 && !whatsappNumber) errors.whatsappNumber = "WhatsApp no. required";
    else if (customer.isWhatsApp === 0 && whatsappNumber.length !== 10) errors.whatsappNumber = "WhatsApp no. must be 10 digits";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Payment gateway booking integration
  // ────────────────────────────────────────────────────────────────────────────
  const handleBooking = async () => {
    if (!isAuthenticated) {
      const currentUrl = window.location.pathname;
      sessionStorage.setItem('redirectAfterLogin', currentUrl);
      setShowLoginModal(true);
      return;
    }

    // Validation checks
    if (!selectedDateId) {
      toast.error("Please select a valid event date");
      return;
    }

    const selectedTickets = tickets.filter(t => counts[t.Ticket_Id] > 0);
    if (selectedTickets.length === 0) {
      toast.error("Please select at least one ticket");
      return;
    }

    // Check if multiple different ticket types are selected
    if (selectedTickets.length > 1) {
      toast.error("Please select only one ticket type per booking. You can make separate bookings for different ticket types.");
      return;
    }

    // Customer validation
    if (!asString(customer.firstName).trim() || !asString(customer.lastName).trim()) {
      toast.error("Please fill in your name");
      return;
    }

    if (!asString(customer.email).trim() || !asString(customer.phone).trim()) {
      toast.error("Please provide email and phone number");
      return;
    }

    if (!validateCustomerForm()) {
      toast.error("Please correct customer details");
      return;
    }

    if (finalAmount <= 0) {
      toast.error("Invalid booking amount");
      return;
    }

    try {
      setPaymentProcessing(true);
      toast.loading("Preparing payment gateway...");
      
      // Get encryption key
      const passphrase = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
      if (!passphrase) {
        throw new Error("Payment configuration error. Please contact support.");
      }

      // Prepare booking payload to match backend expectation
      const selectedTicket = selectedTickets[0];
      const ticketQuantity = counts[selectedTicket.Ticket_Id];

      const bookingPayload: BookingPayload = {
        customer_id: String(customerId),
        event_id: eventId,
        EventTicket_id: selectedTicket.Ticket_Id,
        TicketQuantity: ticketQuantity,
      };

      if (appliedPromocode?.promocode_id || appliedPromocode?._id) {
        bookingPayload.Promocode_id = appliedPromocode.promocode_id ?? appliedPromocode._id;
      }
      
      console.log('Booking payload:', bookingPayload);

      // Encrypt the payload as backend expects (stringify first, then encrypt)
      const encryptedPayload = encryptData(JSON.stringify(bookingPayload), passphrase);

      // Call booking API with encrypted payload
      const response = await axios.post(`${bookTicketApi.POST_DATA}`, {
        string: encryptedPayload,
      });

      toast.dismiss();

      if (response.data && (response.data as any).data) {
        // Decrypt payment gateway data as backend sends encrypted response
        const paymentData = decryptData((response.data as any).data, passphrase);
        
        if (paymentData && typeof paymentData === 'object') {
          console.log('Payment gateway data received:', Object.keys(paymentData));
          
          // Store event ID in sessionStorage for success/failure page redirect
          sessionStorage.setItem('lastEventId', eventId);
          
          // Show success message before redirect
          toast.success("Redirecting to secure payment gateway...");
          
          // Create and submit PayU form
          const form = document.createElement("form");
          form.setAttribute("method", "POST");
          form.setAttribute("action", process.env.NEXT_PUBLIC_PAYU_URL || "https://test.payu.in/_payment");
          form.setAttribute("target", "_self");

          // Add all payment parameters to form
          Object.keys(paymentData).forEach((key) => {
            const hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", String(paymentData[key]));
            form.appendChild(hiddenField);
          });

          document.body.appendChild(form);
          
          // Submit form to PayU payment gateway
          form.submit();
          
          // Clean up form after submission
          setTimeout(() => {
            document.body.removeChild(form);
          }, 1000);
        } else {
          throw new Error("Invalid payment gateway response format");
        }
      } else {
        throw new Error("No payment data received from server");
      }
      
    } catch (error) {
      console.error('Payment initiation failed:', error);
      toast.dismiss();
      
      if (error instanceof Error) {
        if ('response' in error && error.response) {
          const axiosError = error as any;
          const { status } = axiosError.response;
          
          switch (status) {
            case 400:
              toast.error("Invalid booking details. Please check your information.");
              break;
            case 401:
              toast.error("Authentication required. Please login and try again.");
              break;
            case 403:
              toast.error("Access denied. Please try again.");
              break;
            case 404:
              toast.error("Event or tickets not found. Please refresh and try again.");
              break;
            case 409:
              toast.error("Tickets no longer available. Please select different tickets.");
              break;
            case 500:
              toast.error("Server error. Please try again in a moment.");
              break;
            default:
              toast.error("Network error. Please check your connection.");
          }
        } else if (error.message.includes("Payment configuration")) {
          toast.error(error.message);
        } else {
          toast.error("Connection error. Please check your internet and try again.");
        }
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setPaymentProcessing(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Login Modal Component
  // ────────────────────────────────────────────────────────────────────────────
  const LoginModal = () => {
    if (!showLoginModal) return null;
    
    return (
      <>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" aria-hidden="true" onClick={() => setShowLoginModal(false)}></div>
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
          <Card className="w-full max-w-md bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-md border border-slate-700/50 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-[#00E1FC]/15 to-[#0F33D1]/15 border-b border-slate-700/50 pb-4">
              <CardTitle className="text-xl text-white font-semibold text-center">Login Required</CardTitle>
              <CardDescription className="text-slate-300 text-center">Please login to continue with your booking</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="text-center space-y-4">
                <div className="text-4xl mb-4">🔐</div>
                <p className="text-slate-300 mb-6">
                  You need to be logged in to book tickets. This helps us secure your booking and send you confirmation details.
                </p>
                <div className="space-y-3">
                  <Button 
                    onClick={() => {
                      setShowLoginModal(false);
                      // Pass redirect URL as query parameter
                      const redirectUrl = encodeURIComponent(window.location.pathname);
                      router.push(`/signup?redirect=${redirectUrl}`);
                    }}
                    className="w-full h-12 bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:from-[#00E1FC]/90 hover:to-[#0F33D1]/90 text-white font-semibold shadow-lg hover:shadow-[#00E1FC]/25 transition-all duration-300"
                  >
                    Login / Sign Up
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowLoginModal(false)}
                    className="w-full h-10 border-slate-600/50 text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors"
                  >
                    Continue Browsing
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
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
  // MAIN PAGE (step 1 – select date & tickets)
  // ---------------------------------------------------------------------------
  return (
    <>
      <LoginModal />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      <div className="container mx-auto px-4 sm:px-8 pt-2 pb-5 sm:py-8 max-w-3xl">
        <div className="flex flex-col gap-3 mb-5 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-col gap-2">
              <Link href={`/events/${eventId}`}>
                <Button variant="ghost" className="h-10 px-4 text-white hover:bg-white/10 border border-slate-700/50 w-fit">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Event
                </Button>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight">Book Event Tickets</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                <ShieldCheck className="h-4 w-4 text-green-400" />
                <span className="text-xs sm:text-sm text-slate-300">Secure & Encrypted</span>
              </div>
              {isAuthenticated ? (
                <div className="flex items-center gap-2 bg-green-900/20 px-3 py-1.5 rounded-lg border border-green-500/50">
                  <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm text-green-400">Logged In</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-orange-900/20 px-3 py-1.5 rounded-lg border border-orange-500/50">
                  <div className="h-2 w-2 bg-orange-400 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm text-orange-400">Login required before details</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 rounded-2xl border border-slate-800 bg-slate-900/50 p-2">
            {[
              { id: 1, label: "Date" },
              { id: 2, label: "Ticket" },
              { id: 3, label: "Details" },
              { id: 4, label: "Pay" },
            ].map((step) => {
              const isActive = currentStep === step.id;
              const isComplete = currentStep > step.id;

              return (
                <div
                  key={step.id}
                  className={`rounded-xl px-3 py-2 text-center text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] text-white"
                      : isComplete
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        : "bg-slate-800/60 text-slate-400"
                  }`}
                >
                  {step.label}
                </div>
              );
            })}
          </div>
        </div>

        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md border border-slate-700/50 shadow-2xl mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-white line-clamp-2">{eventDetails.EventName}</h2>
                  <Badge variant="secondary" className="mt-2 bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] text-white px-3 py-1">
                    {eventDetails.categoryName}
                  </Badge>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-400">Starting from</p>
                  <p className="text-2xl font-bold text-[#00E1FC] flex items-center justify-end">
                    <IndianRupee className="h-5 w-5" />
                    {eventDetails.TicketPriceStartsFrom}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-slate-300">
                <div className="flex items-center bg-slate-800/50 px-3 py-2 rounded-lg min-w-0">
                  <CalendarDays className="h-4 w-4 mr-2 text-[#00E1FC]" />
                  <span className="text-sm truncate">{selectedDateId ? dates.find((date) => date.eventDateTime_id === selectedDateId)?.Date || eventDetails.EventStartDate : eventDetails.EventStartDate}</span>
                </div>
                <div className="flex items-center bg-slate-800/50 px-3 py-2 rounded-lg min-w-0">
                  <Clock className="h-4 w-4 mr-2 text-[#00E1FC]" />
                  <span className="text-sm truncate">{selectedDateId ? dates.find((date) => date.eventDateTime_id === selectedDateId)?.Time || eventDetails.EventStartTime : eventDetails.EventStartTime}</span>
                </div>
                <div className="flex items-center bg-slate-800/50 px-3 py-2 rounded-lg min-w-0 w-full">
                  <MapPin className="h-4 w-4 mr-2 text-[#00E1FC]" />
                  <span className="text-sm truncate">{eventDetails.VenueName}, {eventDetails.VenueCity}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {currentStep === 1 && dates.length > 1 && (
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md border border-slate-700/50 shadow-2xl mb-4 sm:mb-6">
            <CardHeader className="bg-gradient-to-r from-[#00E1FC]/15 to-[#0F33D1]/15 border-b border-slate-700/50 px-4 py-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-white font-semibold">
                <CalendarDays className="h-5 w-5 text-[#00E1FC]" />
                Choose Your Date
              </CardTitle>
              <CardDescription className="text-slate-300">Start by selecting the show date you want to attend.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-2 gap-3">
                {dates.map((date) => {
                  const selected = selectedDateId === date.eventDateTime_id;
                  return (
                    <button
                      key={date.eventDateTime_id}
                      onClick={() => handleDateClick(date.eventDateTime_id)}
                      className={`rounded-2xl border-2 px-4 py-4 text-left transition-all duration-300 ${
                        selected
                          ? "border-[#00E1FC] bg-gradient-to-r from-[#00E1FC]/20 to-[#0F33D1]/20 shadow-lg shadow-[#00E1FC]/20"
                          : "border-slate-700 bg-slate-800/40 hover:border-[#00E1FC]/40"
                      }`}
                    >
                      <p className="text-sm font-semibold text-white">{date.Day}</p>
                      <p className="text-xs text-slate-400 mt-1">{date.Month} {date.Date}</p>
                      <p className="text-sm text-[#00E1FC] mt-3 font-medium">{date.Time}</p>
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 flex justify-end">
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!selectedDateId}
                  className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:from-[#00E1FC]/90 hover:to-[#0F33D1]/90 text-white"
                >
                  Continue to Tickets
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {((currentStep === 1 && dates.length === 1) || currentStep === 2) && selectedDateId && (
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md border border-slate-700/50 shadow-2xl mb-4 sm:mb-6">
            <CardHeader className="bg-gradient-to-r from-[#00E1FC]/15 to-[#0F33D1]/15 border-b border-slate-700/50 px-4 py-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-white font-semibold">
                <Users className="h-5 w-5 text-[#00E1FC]" />
                Choose Your Ticket
              </CardTitle>
              <CardDescription className="text-slate-300">Pick one ticket type and quantity to continue.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {tickets.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-slate-300 text-lg">No tickets available for this date</p>
                  <p className="text-slate-500 text-sm mt-2">Please try another date.</p>
                </div>
              ) : (
                tickets.map((ticket) => {
                  const count = counts[ticket.Ticket_Id] || 0;
                  const selected = showCount[ticket.Ticket_Id];
                  const soldOut = ticket.TicketAvailibilty === 0;
                  const maxAllowed = ticket.BookingMaxLimit;
                  const ticketDescription = normalizeTicketDescription(ticket.TicketDescprition);

                  return (
                    <Card
                      key={ticket.Ticket_Id}
                      className={`border-2 transition-all duration-300 ${
                        selected
                          ? "border-[#00E1FC] bg-slate-900/90 shadow-lg shadow-[#00E1FC]/20"
                          : "border-slate-600/50 bg-slate-800/30 hover:border-[#00E1FC]/50 hover:bg-slate-800/50"
                      } ${soldOut ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="font-bold text-lg text-white leading-tight">{ticket.TicketName}</h3>
                              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                                <span className="bg-slate-800/50 px-2 py-1 rounded">Max {maxAllowed} per order</span>
                                <span className="bg-slate-800/50 px-2 py-1 rounded">{ticket.TicketType === 1 ? "Standard" : "Special"}</span>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={`shrink-0 ${
                                soldOut ? "border-red-400/50 text-red-300 bg-red-900/20" : "border-green-400/50 text-green-300 bg-green-900/20"
                              }`}
                            >
                              {soldOut ? "Sold Out" : "Available"}
                            </Badge>
                          </div>

                          {ticketDescription && (
                            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/30">
                              <div className="relative">
                                <p className={`text-sm text-slate-300 leading-relaxed overflow-hidden transition-all duration-300 ${
                                  !expandedDescriptions[ticket.Ticket_Id] ? "line-clamp-2 max-h-[3.5em]" : "max-h-[5000px]"
                                }`}>
                                  {ticketDescription}
                                </p>
                                {!expandedDescriptions[ticket.Ticket_Id] && (
                                  <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-t from-slate-800/70 to-transparent pointer-events-none"></div>
                                )}
                              </div>
                              {ticketDescription.length > 100 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedDescriptions((prev) => ({
                                      ...prev,
                                      [ticket.Ticket_Id]: !prev[ticket.Ticket_Id],
                                    }));
                                  }}
                                  className="mt-2 text-[#00E1FC] hover:text-[#00E1FC]/80 text-xs font-semibold transition-colors duration-200 flex items-center gap-1"
                                >
                                  {expandedDescriptions[ticket.Ticket_Id] ? "Show Less" : "Read More"}
                                  <svg
                                    className={`h-4 w-4 transition-transform duration-300 ${expandedDescriptions[ticket.Ticket_Id] ? "rotate-180" : ""}`}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="text-left bg-slate-800/50 p-3 rounded-xl border border-slate-700/30 w-full sm:w-auto">
                              <p className="text-xs text-slate-400 mb-1">Price</p>
                              <p className="text-2xl font-bold text-[#00E1FC] flex items-center">
                                <IndianRupee className="h-5 w-5" />
                                {ticket.TicketPrice}
                              </p>
                            </div>

                            {selected ? (
                              <div className="flex items-center justify-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-700/30 w-full sm:w-auto">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDecrease(ticket.Ticket_Id)}
                                  className="h-10 w-10 p-0 border-slate-600/50 hover:bg-slate-700/50 text-white"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-10 text-center font-bold text-[#00E1FC] text-xl">{count}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleIncrease(ticket.Ticket_Id)}
                                  disabled={count >= maxAllowed}
                                  className="h-10 w-10 p-0 border-slate-600/50 hover:bg-slate-700/50 text-white disabled:opacity-50"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                onClick={() => handleShowCount(ticket.Ticket_Id)}
                                disabled={soldOut}
                                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:from-[#00E1FC]/90 hover:to-[#0F33D1]/90 text-white font-semibold shadow-lg hover:shadow-[#00E1FC]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {soldOut ? "Sold Out" : "Select Ticket"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}

              <div className="flex items-center justify-between gap-3 border-t border-slate-700/50 pt-4">
                <div>
                  <p className="text-sm text-slate-400">Selected</p>
                  <p className="text-base font-semibold text-white">
                    {selectedTicket ? `${selectedTicket.TicketName} x ${counts[selectedTicket.Ticket_Id]}` : "No ticket selected"}
                  </p>
                </div>
                <Button
                  onClick={handleContinueToDetails}
                  disabled={!selectedTicket}
                  className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:from-[#00E1FC]/90 hover:to-[#0F33D1]/90 text-white"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && selectedTicket && (
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md border border-slate-700/50 shadow-2xl mb-4 sm:mb-6">
            <CardHeader className="bg-gradient-to-r from-[#00E1FC]/15 to-[#0F33D1]/15 border-b border-slate-700/50 px-4 py-3 sm:p-6">
              <CardTitle className="text-lg sm:text-xl text-white font-semibold">Enter Your Details</CardTitle>
              <CardDescription className="text-slate-300">Only the details required to complete your booking.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-3 text-sm text-slate-300">
                <span className="font-semibold text-white">{selectedTicket.TicketName}</span>
                <span className="text-slate-400"> · Qty {counts[selectedTicket.Ticket_Id]} · ₹{totalPrice}</span>
              </div>

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
                <Label className="text-slate-200 font-medium">Is this your WhatsApp number?</Label>
                <div className="flex flex-col sm:flex-row gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-200 hover:text-white transition-colors">
                    <input
                      type="radio"
                      checked={customer.isWhatsApp === 1}
                      onChange={() => handleCustChange("isWhatsApp", 1)}
                      className="accent-[#00E1FC] w-4 h-4"
                    />
                    Yes, use same number
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-200 hover:text-white transition-colors">
                    <input
                      type="radio"
                      checked={customer.isWhatsApp === 0}
                      onChange={() => handleCustChange("isWhatsApp", 0)}
                      className="accent-[#00E1FC] w-4 h-4"
                    />
                    Use different number
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

              <div className="flex items-center justify-between gap-3 border-t border-slate-700/50 pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(2)} className="border-slate-600/50 text-slate-200 hover:bg-slate-800/50">
                  Back
                </Button>
                <Button
                  onClick={handleContinueToCheckout}
                  className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:from-[#00E1FC]/90 hover:to-[#0F33D1]/90 text-white"
                >
                  Continue to Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 4 && selectedTicket && (
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md border border-slate-700/50 shadow-2xl mb-4 sm:mb-6">
            <CardHeader className="bg-gradient-to-r from-[#00E1FC]/15 to-[#0F33D1]/15 border-b border-slate-700/50 px-4 py-3 sm:p-6">
              <CardTitle className="text-lg sm:text-xl text-white font-semibold">Review & Pay</CardTitle>
              <CardDescription className="text-slate-300">Check your booking summary, apply a coupon if needed, and complete payment.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{selectedTicket.TicketName}</p>
                    <p className="text-slate-400 text-xs">Qty: {counts[selectedTicket.Ticket_Id]}</p>
                  </div>
                  <span className="font-semibold text-[#00E1FC]">₹{counts[selectedTicket.Ticket_Id] * selectedTicket.TicketPrice}</span>
                </div>
                <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/30 text-sm text-slate-300">
                  <p className="font-medium text-white">{customer.firstName} {customer.lastName}</p>
                  <p>{customer.phone}</p>
                  <p>{customer.email}</p>
                </div>
              </div>

              <Separator className="bg-slate-600/50" />

              <div className="space-y-3">
                {!appliedPromocode ? (
                  <>
                    <div className="flex gap-2">
                      <Input
                        value={promocodeInput}
                        onChange={(e) => setPromocodeInput(e.target.value.toUpperCase())}
                        placeholder="Enter promocode"
                        className="bg-slate-800/60 border-slate-600/50 text-white placeholder-slate-400 focus:border-[#00E1FC] focus:ring-[#00E1FC]/20"
                        onFocus={() => setShowPromocodeSuggestions(true)}
                      />
                      <Button
                        onClick={handleApplyPromocode}
                        disabled={promocodeLoading || !promocodeInput.trim()}
                        className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:from-[#00E1FC]/90 hover:to-[#0F33D1]/90 text-white"
                      >
                        {promocodeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                      </Button>
                    </div>
                    {promocodeError && <p className="text-red-400 text-xs">{promocodeError}</p>}
                    {showPromocodeSuggestions && availablePromocodes.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-400">Available promocodes:</p>
                        {availablePromocodes.slice(0, 3).map((promo) => (
                          <button
                            key={promo.promocode_id}
                            onClick={() => {
                              setPromocodeInput(promo.PromoCodeName);
                              setShowPromocodeSuggestions(false);
                            }}
                            className="w-full text-left p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded border border-slate-700/30 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[#00E1FC] font-semibold text-sm">{promo.PromoCodeName}</span>
                              <Badge variant="outline" className="text-xs border-green-400/50 text-green-300">
                                {promo.PromType === 1 ? `₹${promo.Value} OFF` : `${promo.Value}% OFF`}
                              </Badge>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-3 bg-green-900/20 border border-green-400/30 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-green-300 font-semibold text-sm">{appliedPromocode.PromoCodeName}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {appliedPromocode.PromType === 1
                            ? `₹${appliedPromocode.Value} discount applied`
                            : `${appliedPromocode.Value}% discount applied`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemovePromocode}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-8"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="bg-slate-600/50" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Subtotal</span>
                  <span className="text-white">₹{totalPrice}</span>
                </div>
                {appliedPromocode && discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">Discount ({appliedPromocode.PromoCodeName})</span>
                    <span className="text-green-400">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <Separator className="bg-slate-600/50" />

              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-[#00E1FC]/10 to-[#0F33D1]/10 rounded-lg border border-[#00E1FC]/20">
                <span className="text-white font-semibold">Total</span>
                <span className="text-[#00E1FC] font-bold text-lg">₹{finalAmount}</span>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <Button variant="outline" onClick={() => setCurrentStep(3)} className="border-slate-600/50 text-slate-200 hover:bg-slate-800/50">
                  Back
                </Button>
                <Button
                  className="flex-1 h-12 bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:from-[#00E1FC]/90 hover:to-[#0F33D1]/90 text-white font-semibold shadow-lg hover:shadow-[#00E1FC]/25 transition-all duration-300"
                  onClick={handleBooking}
                  disabled={paymentProcessing}
                >
                  {paymentProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Pay ₹{finalAmount}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #475569'
          },
          success: {
            iconTheme: {
              primary: '#00E1FC',
              secondary: '#fff'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff'
            }
          }
        }}
      />
    </div>
    </>
  );
}
