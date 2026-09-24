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
  CreditCard,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { TicketType } from "@/lib/types";
import { bookTicketApi, customer as customerApi, events as eventsConfig, promocode as promocodeConfig } from "@/utils/config";
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
  // Event-level convenience fee (fallback when ticket doesn't define its own)
  ConvinienceFeeUnit?: number;
  ConvinienceFeeValue?: number;
  ConvenienceFeeUnit?: number;
  ConvenienceFeeValue?: number;
}

interface ApiResponse {
  error: boolean;
  message: string;
  data: {
    EventDetailsObj: EventDetails;
    // Event-level convenience fee may be on the root data object
    ConvinienceFeeUnit?: number;
    ConvinienceFeeValue?: number;
    ConvenienceFeeUnit?: number;
    ConvenienceFeeValue?: number;
  } & Partial<EventDetails>;
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
  // Season pass tickets are not tied to a single show date
  EventDateTime_id?: string;
  TicketAvailibilty: number;
  BookingMaxLimit: number;
  // Set on load — true for passes valid across every day of a multi-day event
  isSeasonPass?: boolean;
  // Convenience fee fields — backend may send several spellings; we normalize on load
  ConvenienceFeeUnit?: number;
  ConvenienceFeeValue?: number;
  ConvinienceFeeUnit?: number;
  ConvinienceFeeValue?: number;
  ConFeeUnit?: number;
  ConFeeValue?: number;
  ConvFeeUnit?: number;
  ConvFeeValue?: number;
  ConvienceFeeUnit?: number;
  ConvienceFeeValue?: number;
  // Additional spellings returned by the ticket API
  ConfeeUnit?: number;
  ConValue?: number;
}

interface TicketResponse {
  error: boolean;
  message: string;
  data: TicketData[];
}

interface SeasonPassResponse {
  error: boolean;
  message: string;
  data: TicketData[] | null;
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

// Normalize backend convenience fee fields (backend sends several possible spellings)
const normalizeTicketFee = (ticket: any): Pick<TicketData, 'ConvinienceFeeUnit' | 'ConvinienceFeeValue'> => {
  const unit =
    Number(ticket.ConfeeUnit ?? ticket.ConvenienceFeeUnit ?? ticket.ConvinienceFeeUnit ?? ticket.ConFeeUnit ?? ticket.ConvFeeUnit ?? ticket.ConvienceFeeUnit ?? 0) || 0;
  const value =
    Number(ticket.ConValue ?? ticket.ConvenienceFeeValue ?? ticket.ConvinienceFeeValue ?? ticket.ConFeeValue ?? ticket.ConvFeeValue ?? ticket.ConvienceFeeValue ?? 0) || 0;
  return { ConvinienceFeeUnit: unit, ConvinienceFeeValue: value };
};

// Backend marks season pass tickets with TicketType 3
const SEASON_PASS_TICKET_TYPE = 3;

// Shared normalizer for day tickets and season passes (backend returns strings for some fields)
const normalizeTicket = (
  ticket: any,
  eventFee: { unit: number; value: number },
  isSeasonPass = false
): TicketData => {
  const feeNorm = normalizeTicketFee(ticket);
  return {
    ...ticket,
    // Ensure price is a number (backend may return string)
    TicketPrice: Number(ticket.TicketPrice ?? ticket.Price ?? 0) || 0,
    TicketAvailibilty: Number(ticket.TicketAvailibilty ?? ticket.AvailableQuantity ?? 0) || 0,
    BookingMaxLimit: Number(ticket.BookingMaxLimit ?? ticket.MaxQuantityAllowedPerOrder ?? 1) || 1,
    // If ticket has no convenience fee, fall back to event-level fee
    ConvinienceFeeUnit: feeNorm.ConvinienceFeeUnit || eventFee.unit || 0,
    ConvinienceFeeValue: feeNorm.ConvinienceFeeValue || eventFee.value || 0,
    isSeasonPass: isSeasonPass || Number(ticket.TicketType) === SEASON_PASS_TICKET_TYPE,
  };
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
  const [seasonPasses, setSeasonPasses] = React.useState<TicketData[]>([]);
  const [counts, setCounts] = React.useState<Record<string, number>>({});
  const [showCount, setShowCount] = React.useState<Record<string, boolean>>({});
  const [expandedDescriptions, setExpandedDescriptions] = React.useState<Record<string, boolean>>({});
  const [eventDetails, setEventDetails] = React.useState<EventDetails | null>(null);
  const [eventConvenienceFee, setEventConvenienceFee] = React.useState<{ unit: number; value: number }>({ unit: 0, value: 0 });
  const [currentStep, setCurrentStep] = React.useState<1 | 2 | 3 | 4>(1);
  // Which tab the user is booking from: a single show date, or the season pass
  const [selectionMode, setSelectionMode] = React.useState<"date" | "season">("date");

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
  // Day tickets and season passes are both bookable, so totals look at the union
  const allTickets = React.useMemo(() => [...seasonPasses, ...tickets], [seasonPasses, tickets]);
  const totalTickets = Object.values(counts).reduce((s, n) => s + n, 0);
  // Calculate total price based only on selected tickets
  const totalPrice = Object.entries(counts).reduce((sum, [ticketId, qty]) => {
    const ticket = allTickets.find(t => t.Ticket_Id === ticketId);
    return ticket ? sum + qty * ticket.TicketPrice : sum;
  }, 0);
  
  // Calculate convenience fees based on selected ticket's ConvinienceFeeUnit and ConvinienceFeeValue
  // ConvinienceFeeUnit: 1 = Amount (fixed per ticket), 2 = Percentage (of ticket price)
  const convenienceFee = Object.entries(counts).reduce((sum, [ticketId, qty]) => {
    const ticket = allTickets.find(t => t.Ticket_Id === ticketId);
    if (!ticket || qty <= 0) return sum;

    const feeUnit = Number(ticket.ConvinienceFeeUnit) || 0;
    const feeValue = Number(ticket.ConvinienceFeeValue) || 0;

    if (feeUnit === 1) {
      // Amount: fixed convenience fee per ticket
      return sum + feeValue * qty;
    } else if (feeUnit === 2) {
      // Percentage: convenience fee as percentage of ticket price
      return sum + (ticket.TicketPrice * qty * feeValue) / 100;
    }
    return sum;
  }, 0);

  // Detailed convenience fee per ticket for breakdown display
  const convenienceDetails = Object.entries(counts).map(([ticketId, qty]) => {
    const ticket = allTickets.find(t => t.Ticket_Id === ticketId);
    if (!ticket || qty <= 0) return null;
    const feeUnit = Number(ticket.ConvinienceFeeUnit) || 0;
    const feeValue = Number(ticket.ConvinienceFeeValue) || 0;
    let amount = 0;
    if (feeUnit === 1) amount = feeValue * qty;
    else if (feeUnit === 2) amount = (ticket.TicketPrice * qty * feeValue) / 100;
    return {
      ticketName: ticket.TicketName,
      qty,
      amount,
    };
  }).filter(Boolean) as { ticketName: string; qty: number; amount: number }[];

  // Add 18% GST directly into the convenience fee (not shown separately)
  const CONVENIENCE_FEE_GST_RATE = 0.18;
  const convenienceFeeWithGst =
    Math.round(convenienceFee * (1 + CONVENIENCE_FEE_GST_RATE) * 100) / 100;

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
  
  const finalAmount = Math.max(0, totalPrice + convenienceFeeWithGst - discountAmount);
  const selectedTickets = allTickets.filter((ticket) => counts[ticket.Ticket_Id] > 0);
  const selectedTicket = selectedTickets[0] ?? null;
  const selectedSeasonPass = selectedTickets.find((ticket) => ticket.isSeasonPass) ?? null;
  const isMultiDayEvent = dates.length > 1;

  // (Single-page booking flow) If user returns after login, keep selections and continue inline.

  // Fetch available promocodes
  React.useEffect(() => {
    const fetchPromocodes = async () => {
      if (!eventId) return;

      try {
        // Fetch customer-specific (private) promocodes if logged in
        const privatePayload: any = { event_id: eventId };
        if (customerId) privatePayload.customer_id = customerId;

        const [privateResp, publicResp] = await Promise.all([
          axios.post<PromocodeListResponse>(promocodeConfig.GET_ALL, privatePayload).catch(() => ({ data: { data: [] } } as any)),
          axios.post<PromocodeListResponse>(promocodeConfig.GET_ALL, { event_id: eventId }).catch(() => ({ data: { data: [] } } as any)),
        ]);

        const privateCodes = (privateResp.data?.data || []).map((p: any) => normalizePromocode(p));
        const publicCodes = (publicResp.data?.data || []).map((p: any) => normalizePromocode(p));

        // Merge unique by PromoCodeName
        const merged: Record<string, PromocodeData> = {};
        [...publicCodes, ...privateCodes].forEach((p) => {
          if (!p || !p.PromoCodeName) return;
          merged[p.PromoCodeName] = p;
        });

        setAvailablePromocodes(Object.values(merged));
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
      let pendingEventFee: { unit: number; value: number } | undefined;
      
      try {
        setLoading(true);
        
        // Fetch event details
        const eventDetailsResponse = await axios.post<ApiResponse>(
          eventsConfig.GET_ALL,
          { event_id: eventId }
        );

        if (eventDetailsResponse.data && !eventDetailsResponse.data.error) {
          const rootData = eventDetailsResponse.data.data;
          // The API may return event details in EventDetailsObj OR directly on data
          const ed = rootData.EventDetailsObj ?? rootData;
          // Normalize event-level convenience fee — check both EventDetailsObj and root data
          const eventFeeUnit =
            Number(ed.ConvinienceFeeUnit ?? ed.ConvenienceFeeUnit ?? rootData.ConvinienceFeeUnit ?? rootData.ConvenienceFeeUnit ?? 0) || 0;
          const eventFeeValue =
            Number(ed.ConvinienceFeeValue ?? ed.ConvenienceFeeValue ?? rootData.ConvinienceFeeValue ?? rootData.ConvenienceFeeValue ?? 0) || 0;
          setEventDetails({
            ...ed,
            ConvinienceFeeUnit: eventFeeUnit,
            ConvinienceFeeValue: eventFeeValue,
          });
          setEventConvenienceFee({ unit: eventFeeUnit, value: eventFeeValue });
          // Store locally so we can pass to loadTickets in the same render cycle
          pendingEventFee = { unit: eventFeeUnit, value: eventFeeValue };
        }

        // Fetch event dates and times
        const datesResponse = await axios.post<EventDateTimeResponse>(
          eventsConfig.GET_TICKETS_DATA,
          { event_id: eventId }
        );

        if (datesResponse.data && !datesResponse.data.error) {
          const eventDates = datesResponse.data.data.DateTimeDate;
          setDates(eventDates);
          
          // Season passes cover every day, so they only apply to multi-day events
          if (eventDates.length > 1) {
            await loadSeasonPasses(pendingEventFee);
          } else {
            setSeasonPasses([]);
          }

          // Auto-select the date if there's only one, or first date if multiple
          if (eventDates.length > 0) {
            const dateToSelect = eventDates[0].eventDateTime_id;
            setSelectedDateId(dateToSelect);
            // Pass the event-level fee directly to avoid stale state during initial load
            await loadTickets(dateToSelect, pendingEventFee);
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
  const loadTickets = async (eventDateTimeId: string, eventFeeOverride?: { unit: number; value: number }) => {
    // Determine the event-level fee to use as fallback for tickets without their own fee
    const eventFee = eventFeeOverride ?? eventConvenienceFee;
    try {
      const response = await axios.post<TicketResponse>(
        eventsConfig.GET_TICKETS_BY_ID,
        {
          event_id: eventId,
          eventDateTime_id: eventDateTimeId
        }
      );

      if (response.data && !response.data.error) {
        // Normalize convenience fee fields and ensure numeric types
        const normalizedTickets = response.data.data.map((ticket: any) => normalizeTicket(ticket, eventFee));
        setTickets(normalizedTickets);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    }
  };

  // Load season passes — one pass valid for every day of a multi-day event
  const loadSeasonPasses = async (eventFeeOverride?: { unit: number; value: number }) => {
    const eventFee = eventFeeOverride ?? eventConvenienceFee;
    try {
      const response = await axios.post<SeasonPassResponse>(
        eventsConfig.GET_SEASON_PASS,
        { event_id: eventId }
      );

      if (response.data && !response.data.error && Array.isArray(response.data.data)) {
        setSeasonPasses(response.data.data.map((pass: any) => normalizeTicket(pass, eventFee, true)));
      } else {
        setSeasonPasses([]);
      }
    } catch (error) {
      console.error('Failed to fetch season passes:', error);
      setSeasonPasses([]);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Handlers – date click, qty controls, navigation
  // ────────────────────────────────────────────────────────────────────────────
  const handleDateClick = async (eventDateTimeId: string) => {
    // A date booking and a season pass are different tabs — switching drops the other side
    setSelectionMode("date");
    setSelectedDateId(eventDateTimeId);
    setCounts({});
    setShowCount({});
    setAppliedPromocode(null);
    setPromocodeInput("");
    setPromocodeError("");
    setCurrentStep(2);
    await loadTickets(eventDateTimeId);
  };

  // Season pass tab — shows the passes instead of a single day's tickets
  const handleSeasonPassTabClick = () => {
    setSelectionMode("season");
    // Day tickets don't apply to a season pass booking
    const keepSeasonPassOnly = (prev: Record<string, any>) =>
      Object.fromEntries(
        Object.entries(prev).filter(([ticketId]) => seasonPasses.some((pass) => pass.Ticket_Id === ticketId))
      );
    setCounts(keepSeasonPassOnly);
    setShowCount(keepSeasonPassOnly);
    setAppliedPromocode(null);
    setPromocodeInput("");
    setPromocodeError("");
    setCurrentStep(2);
  };

  const handleIncrease = (ticketId: string) => {
    setCounts(prev => {
      // Check if there are any other tickets selected
      const hasOtherTickets = Object.keys(prev).some(id => id !== ticketId && prev[id] > 0);

      if (hasOtherTickets) {
        const seasonPassSelected = Object.keys(prev).some(
          id => id !== ticketId && prev[id] > 0 && seasonPasses.some(pass => pass.Ticket_Id === id)
        );
        toast.error(
          seasonPassSelected
            ? "Your season pass already covers every day. Remove it to book a single-day ticket."
            : "Please select only one ticket type per booking. Remove other tickets first."
        );
        return prev;
      }

      // Get the booking max limit for this ticket
      const ticket = allTickets.find(t => t.Ticket_Id === ticketId);
      const maxAllowed = ticket?.BookingMaxLimit || 1;
      const currentCount = prev[ticketId] || 0;
      
      if (currentCount >= maxAllowed) {
        toast.error(`Maximum ${maxAllowed} ticket${maxAllowed > 1 ? 's' : ''} allowed per booking.`);
        return prev;
      }

      // Warn if total exceeds 10
      const newTotal = Object.values(prev).reduce((s, n) => s + n, 0) + 1;
      if (newTotal > 10) {
        toast.error("You can book a maximum of 10 tickets per order.");
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
      const payload: any = {
        event_id: eventId,
        promocode_name: promocodeInput.trim(),
        amount: totalPrice.toString(),
      };
      if (customerId) payload.customer_id = customerId;

      const response = await axios.post<ApplyPromocodeResponse>(promocodeConfig.APPLY, payload);

      if (response.data && !response.data.error && response.data.data) {
        const promo = normalizePromocode(response.data.data);
        setAppliedPromocode(promo);
        toast.success(`Promocode "${promocodeInput}" applied successfully!`);
        setPromocodeInput("");
        setShowPromocodeSuggestions(false);
        setPromocodeError("");
      } else {
        const msg = (response.data && response.data.message) || "Invalid promocode";
        setPromocodeError(msg);
        toast.error(msg);
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || "Failed to apply promocode";
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

    const selectedTickets = allTickets.filter(t => counts[t.Ticket_Id] > 0);
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

      // Include promocode id if available; otherwise include promocode name as fallback
      const promoId = appliedPromocode?.promocode_id || appliedPromocode?._id;
      const promoName = appliedPromocode?.PromoCodeName || appliedPromocode?.PromoCodeName;
      if (promoId) {
        bookingPayload.Promocode_id = promoId;
      } else if (promoName) {
        // Backend may accept promocode name when id is not available
        (bookingPayload as any).PromocodeName = promoName;
      }
      
      console.log('Booking payload:', bookingPayload);

      // Encrypt the payload as backend expects (stringify first, then encrypt)
      const encryptedPayload = encryptData(JSON.stringify(bookingPayload), passphrase);

      // Call booking API with encrypted payload
      let response;
      try {
        response = await axios.post(`${bookTicketApi.POST_DATA}`, {
          string: encryptedPayload,
        });
      } catch (bookError: any) {
        // If booking with promocode fails, retry without promocode
        const hadPromo = Boolean(bookingPayload.Promocode_id || (bookingPayload as any).PromocodeName);
        if (hadPromo) {
          console.warn('Booking with promocode failed, retrying without promocode...', bookError);
          const fallbackPayload: BookingPayload = { ...bookingPayload };
          delete (fallbackPayload as any).Promocode_id;
          delete (fallbackPayload as any).PromocodeName;
          const fallbackEncrypted = encryptData(JSON.stringify(fallbackPayload), passphrase);
          response = await axios.post(`${bookTicketApi.POST_DATA}`, {
            string: fallbackEncrypted,
          });
        } else {
          throw bookError;
        }
      }

      toast.dismiss();

      if (response.data && (response.data as any).data) {
        // Decrypt payment gateway data as backend sends encrypted response
        const paymentData = decryptData((response.data as any).data, passphrase);
        console.log('Decrypted payment gateway data:', paymentData);
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
          
   //       Clean up form after submission
        
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
  // Ticket row (shared by day tickets and season passes)
  // ────────────────────────────────────────────────────────────────────────────
  const renderTicketRow = (ticket: TicketData) => {
    const count = counts[ticket.Ticket_Id] || 0;
    const selected = showCount[ticket.Ticket_Id];
    const soldOut = ticket.TicketAvailibilty === 0;
    const ticketDescription = normalizeTicketDescription(ticket.TicketDescprition);

    // Season passes highlight in amber (matching their section) so the selected
    // item is the pass itself, not a date
    const selectedClasses = ticket.isSeasonPass
      ? "border-amber-400 bg-amber-400/10 ring-2 ring-amber-400/40 shadow-lg shadow-amber-400/10"
      : "border-[#00E1FC] bg-slate-900/70 ring-2 ring-[#00E1FC]/30 shadow-lg shadow-[#00E1FC]/10";
    const idleClasses = ticket.isSeasonPass
      ? "border-amber-400/30 bg-slate-800/30 hover:border-amber-400/60"
      : "border-slate-700/50 bg-slate-800/30 hover:border-[#00E1FC]/40";

    return (
      <div
        key={ticket.Ticket_Id}
        className={`rounded-xl border transition-all duration-200 ${
          selected ? selectedClasses : idleClasses
        } ${soldOut ? "opacity-50" : ""}`}
      >
        <div className="p-2 sm:p-3">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Ticket name, price, description */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-white text-sm sm:text-base leading-tight">{ticket.TicketName}</h3>
                {selected && (
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                      ticket.isSeasonPass
                        ? "border-amber-400/60 text-amber-200 bg-amber-400/10"
                        : "border-[#00E1FC]/60 text-[#00E1FC] bg-[#00E1FC]/10"
                    }`}
                  >
                    Selected
                  </span>
                )}
              </div>
              <p className={`font-bold text-base sm:text-lg mt-1 flex items-center ${ticket.isSeasonPass ? "text-amber-300" : "text-[#00E1FC]"}`}>
                <IndianRupee className="h-4 w-4" />
                {ticket.TicketPrice}
              </p>
              {ticketDescription && (
                <p className={`text-xs text-slate-400 mt-1 ${expandedDescriptions[ticket.Ticket_Id] ? "" : "line-clamp-1"}`}>
                  {ticketDescription}
                  {ticketDescription.length > 60 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedDescriptions((prev) => ({
                          ...prev,
                          [ticket.Ticket_Id]: !prev[ticket.Ticket_Id],
                        }));
                      }}
                      className="ml-1 text-[#00E1FC] hover:text-[#00E1FC]/80 font-medium"
                    >
                      {expandedDescriptions[ticket.Ticket_Id] ? "less" : "more"}
                    </button>
                  )}
                </p>
              )}
            </div>

            {/* Right: Qty selector or Select button */}
            <div className="shrink-0">
              {soldOut ? (
                <span className="text-xs text-red-400 font-medium px-3 py-2">Sold Out</span>
              ) : selected ? (
                <div className="flex items-center gap-2 bg-slate-900/80 rounded-lg border border-slate-700/50 px-2 py-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDecrease(ticket.Ticket_Id)}
                    className="h-8 w-8 p-0 border-slate-600/50 hover:bg-slate-700/50 text-white"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className={`w-6 text-center font-bold text-base ${ticket.isSeasonPass ? "text-amber-300" : "text-[#00E1FC]"}`}>{count}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleIncrease(ticket.Ticket_Id)}
                    disabled={count >= (ticket.BookingMaxLimit || 10)}
                    className="h-8 w-8 p-0 border-slate-600/50 hover:bg-slate-700/50 text-white disabled:opacity-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => handleShowCount(ticket.Ticket_Id)}
                  className={`px-4 py-2 text-white text-sm font-medium rounded-lg ${
                    ticket.isSeasonPass
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-400/90 hover:to-amber-500/90 text-slate-900"
                      : "bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:from-[#00E1FC]/90 hover:to-[#0F33D1]/90"
                  }`}
                >
                  Add
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Season pass section — only shown for multi-day events that have passes
  // ────────────────────────────────────────────────────────────────────────────
  const renderSeasonPassSection = () => {
    if (!isMultiDayEvent || seasonPasses.length === 0) return null;

    return (
      <Card
        className={`bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md border shadow-2xl mb-4 sm:mb-6 transition-all duration-200 ${
          selectedSeasonPass ? "border-amber-400 ring-2 ring-amber-400/30" : "border-amber-400/30"
        }`}
      >
        <CardHeader className="bg-gradient-to-r from-amber-400/15 to-[#00E1FC]/10 border-b border-slate-700/50 px-4 py-3 sm:p-6">
          <CardTitle className="flex flex-wrap items-center gap-2 text-lg sm:text-xl text-white font-semibold">
            <Ticket className="h-5 w-5 text-amber-300" />
            Season Pass
            <Badge variant="outline" className="border-amber-400/50 text-amber-200 text-[11px]">
              All {dates.length} days
            </Badge>
          </CardTitle>

        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {seasonPasses.map((pass) => renderTicketRow(pass))}
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Valid for {dates.map((date) => `${date.Date} ${date.Month}`).join(", ")}
          </p>
        </CardContent>
      </Card>
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
      <div className="container mx-auto px-4 sm:px-8 pt-2 pb-24 sm:pb-28 max-w-3xl">
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
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-white line-clamp-1">{eventDetails.EventName}</h2>
                {selectedSeasonPass || (selectionMode === "season" && seasonPasses.length > 0) ? (
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                    <CalendarDays className="h-4 w-4 text-amber-300" />
                    <span className="truncate">Season pass · all {dates.length} days</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                    <CalendarDays className="h-4 w-4 text-[#00E1FC]" />
                    <span className="truncate">{selectedDateId ? dates.find((date) => date.eventDateTime_id === selectedDateId)?.Date || eventDetails.EventStartDate : eventDetails.EventStartDate}</span>
                    <Clock className="h-4 w-4 text-[#00E1FC] ml-2" />
                    <span className="truncate">{selectedDateId ? dates.find((date) => date.eventDateTime_id === selectedDateId)?.Time || eventDetails.EventStartTime : eventDetails.EventStartTime}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {(currentStep === 1 || currentStep === 2) && dates.length > 1 && (
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md border border-slate-700/50 shadow-2xl mb-4 sm:mb-6">
            <CardHeader className="bg-gradient-to-r from-[#00E1FC]/15 to-[#0F33D1]/15 border-b border-slate-700/50 px-4 py-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-white font-semibold">
                <CalendarDays className="h-5 w-5 text-[#00E1FC]" />
                {seasonPasses.length > 0 ? "Choose Date or Season Pass" : "Choose Your Date"}
              </CardTitle>
              <CardDescription className="text-slate-300">
                {seasonPasses.length > 0
                  ? "Pick a single show date, or switch to the Season Pass tab to cover every day."
                  : "Start by selecting the show date you want to attend."}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {/* Tab strip — every date plus the season pass, only one active at a time */}
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                {dates.map((date) => {
                  const active = selectionMode === "date" && selectedDateId === date.eventDateTime_id;
                  return (
                    <button
                      key={date.eventDateTime_id}
                      onClick={() => handleDateClick(date.eventDateTime_id)}
                      className={`shrink-0 min-w-[120px] rounded-2xl border-2 px-4 py-3 text-left transition-all duration-300 ${
                        active
                          ? "border-[#00E1FC] bg-gradient-to-r from-[#00E1FC]/20 to-[#0F33D1]/20 shadow-lg shadow-[#00E1FC]/20"
                          : "border-slate-700 bg-slate-800/40 hover:border-[#00E1FC]/40"
                      }`}
                    >
                      <p className="text-sm font-semibold text-white">{date.Day}</p>
                      <p className="text-xs text-slate-400 mt-1">{date.Month} {date.Date}</p>
                      <p className={`text-xs mt-2 font-medium ${active ? "text-[#00E1FC]" : "text-slate-400"}`}>{date.Time}</p>
                    </button>
                  );
                })}

                {seasonPasses.length > 0 && (
                  <button
                    onClick={handleSeasonPassTabClick}
                    className={`shrink-0 min-w-[140px] rounded-2xl border-2 px-4 py-3 text-left transition-all duration-300 ${
                      selectionMode === "season"
                        ? "border-amber-400 bg-amber-400/15 shadow-lg shadow-amber-400/20"
                        : "border-amber-400/30 bg-slate-800/40 hover:border-amber-400/60"
                    }`}
                  >
                    <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <Ticket className="h-4 w-4 text-amber-300" />
                      Season Pass
                    </p>
                    <p className="text-xs text-slate-400 mt-1">All {dates.length} days</p>
                    <p className={`text-xs mt-2 font-medium ${selectionMode === "season" ? "text-amber-300" : "text-slate-400"}`}>
                      One pass, every show
                    </p>
                  </button>
                )}
              </div>

              {currentStep === 1 && (
                <div className="mt-5 flex justify-end">
                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={selectionMode === "date" && !selectedDateId}
                    className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:from-[#00E1FC]/90 hover:to-[#0F33D1]/90 text-white"
                  >
                    Continue to Tickets
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && selectionMode === "season" && renderSeasonPassSection()}

        {((currentStep === 1 && dates.length === 1) || (currentStep === 2 && selectionMode === "date")) && selectedDateId && (
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md border border-slate-700/50 shadow-2xl mb-4 sm:mb-6">
            <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {tickets.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-slate-300 text-lg">No tickets available for this date</p>
                  <p className="text-slate-500 text-sm mt-2">Please try another date.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                {tickets.map((ticket) => renderTicketRow(ticket))}
                </div>
              )}

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
                {selectedTicket.isSeasonPass && (
                  <span className="text-amber-300"> · Valid for all {dates.length} days</span>
                )}
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
                    <p className="text-slate-400 text-xs">
                      Qty: {counts[selectedTicket.Ticket_Id]}
                      {selectedTicket.isSeasonPass ? ` · Season pass for all ${dates.length} days` : ""}
                    </p>
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
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        <p className="text-xs text-slate-400">Available promocodes:</p>
                        {availablePromocodes.map((promo) => (
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
                {convenienceFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Convenience Fee</span>
                    <span className="text-white">₹{convenienceFeeWithGst.toFixed(2)}</span>
                  </div>
                )}
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
                <span className="text-[#00E1FC] font-bold text-lg">₹{finalAmount.toFixed(2)}</span>
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
                      Pay ₹{finalAmount.toFixed(2)}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sticky footer for ticket selection (step 1 & 2) */}
        {((currentStep === 1 && dates.length === 1) || currentStep === 2) &&
          (selectionMode === "season" ? seasonPasses.length > 0 : Boolean(selectedDateId)) ? (
          <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-700/70 bg-slate-950/95 backdrop-blur-md p-3 sm:p-4">
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-400">
                  {totalTickets > 0
                    ? selectedSeasonPass
                      ? `${totalTickets} season pass${totalTickets > 1 ? 'es' : ''} · all ${dates.length} days`
                      : `${totalTickets} ticket${totalTickets > 1 ? 's' : ''} selected`
                    : 'No tickets selected'}
                </p>
                <p className="text-lg font-bold text-white">
                  {totalTickets > 0 ? `₹${totalPrice}` : '—'}
                </p>
              </div>
              <Button
                onClick={handleContinueToDetails}
                disabled={!selectedTicket}
                className="flex-1 sm:flex-none sm:px-12 h-12 bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:from-[#00E1FC]/90 hover:to-[#0F33D1]/90 text-white font-semibold shadow-lg"
              >
                Continue
              </Button>
            </div>
          </div>
        ) : null}
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
