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
  Loader2,
  Minus,
  Plus,
  CreditCard,
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

// Keeps the line breaks typed in the dashboard (rendered with whitespace-pre-line): this
// used to collapse every \s - newlines included - so a 3-line description showed as one.
const normalizeTicketDescription = (value: string | null) => {
  const lines = asString(value)
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => {
      const sentences = line.replace(/[^\S\n]+/g, " ").trim().split(/(?<=[.!?])\s+/).filter(Boolean);
      return sentences
        .filter((sentence, index) => index === 0 || sentence.toLowerCase() !== sentences[index - 1].toLowerCase())
        .join(" ");
    });

  // At most one blank line between paragraphs.
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
};

// Normalize backend convenience fee fields (backend sends several possible spellings)
const normalizeTicketFee = (ticket: any): Pick<TicketData, 'ConvinienceFeeUnit' | 'ConvinienceFeeValue'> => {
  const unit =
    Number(ticket.ConfeeUnit ?? ticket.ConvenienceFeeUnit ?? ticket.ConvinienceFeeUnit ?? ticket.ConFeeUnit ?? ticket.ConvFeeUnit ?? ticket.ConvienceFeeUnit ?? 0) || 0;
  const value =
    Number(ticket.ConValue ?? ticket.ConvenienceFeeValue ?? ticket.ConvinienceFeeValue ?? ticket.ConFeeValue ?? ticket.ConvFeeValue ?? ticket.ConvienceFeeValue ?? 0) || 0;
  return { ConvinienceFeeUnit: unit, ConvinienceFeeValue: value };
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Split a show date into the pieces the date strip shows (day number, weekday, month).
// Backend fields vary in format, so fall back to parsing Date when Day/Month are missing.
const getDateChipParts = (date: EventDateTime) => {
  const rawDate = asString(date.Date).trim();
  const parsed = /^\d{1,2}$/.test(rawDate) ? null : new Date(rawDate);
  const validParsed = parsed && !isNaN(parsed.getTime()) ? parsed : null;

  const rawMonth = asString(date.Month).trim();
  const month = /^\d{1,2}$/.test(rawMonth)
    ? MONTH_NAMES[Number(rawMonth) - 1] ?? rawMonth
    : rawMonth || (validParsed ? MONTH_NAMES[validParsed.getMonth()] : "");
  const weekday =
    asString(date.Day).trim() ||
    (validParsed ? validParsed.toLocaleDateString("en-IN", { weekday: "short" }) : "");

  return {
    day: validParsed ? String(validParsed.getDate()) : rawDate,
    weekday: weekday.slice(0, 3),
    month: month.slice(0, 3),
  };
};

const formatShowDate = (date: EventDateTime) => {
  const { day, weekday, month } = getDateChipParts(date);
  return `${weekday ? `${weekday}, ` : ""}${day} ${month}${date.Time ? ` · ${date.Time}` : ""}`;
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
  const [ticketsLoading, setTicketsLoading] = React.useState(false);
  // Date chip shows that day's tickets; the season pass chip shows passes valid for every day
  const [selectionMode, setSelectionMode] = React.useState<"date" | "season">("date");
  const [counts, setCounts] = React.useState<Record<string, number>>({});
  const [expandedDescriptions, setExpandedDescriptions] = React.useState<Record<string, boolean>>({});
  const [eventDetails, setEventDetails] = React.useState<EventDetails | null>(null);
  const [eventConvenienceFee, setEventConvenienceFee] = React.useState<{ unit: number; value: number }>({ unit: 0, value: 0 });
  // 2 = pick date & tickets, 3 = customer details, 4 = review & pay
  const [currentStep, setCurrentStep] = React.useState<2 | 3 | 4>(2);

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
  const selectedSlot = dates.find((date) => date.eventDateTime_id === selectedDateId) ?? null;

  // Date strip shows one chip per calendar day; a day with several show times gets time chips below
  const dateGroups = React.useMemo(() => {
    const groups: { key: string; day: string; weekday: string; month: string; slots: EventDateTime[] }[] = [];
    dates.forEach((date) => {
      const parts = getDateChipParts(date);
      const key = `${parts.month}-${parts.day}`;
      const existing = groups.find((group) => group.key === key);
      if (existing) existing.slots.push(date);
      else groups.push({ key, ...parts, slots: [date] });
    });
    return groups;
  }, [dates]);
  const selectedGroup = dateGroups.find((group) =>
    group.slots.some((slot) => slot.eventDateTime_id === selectedDateId)
  );

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
          sessionStorage.setItem("lastEventName", asString(ed.EventName));
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

  // Tracks the latest date requested, so a slow response for a date the user already left is ignored
  const latestTicketsRequest = React.useRef<string | null>(null);

  // Load tickets for selected date
  const loadTickets = async (eventDateTimeId: string, eventFeeOverride?: { unit: number; value: number }) => {
    // Determine the event-level fee to use as fallback for tickets without their own fee
    const eventFee = eventFeeOverride ?? eventConvenienceFee;
    latestTicketsRequest.current = eventDateTimeId;
    // Clear the previous date's tickets so they never show under this date
    setTickets([]);
    setTicketsLoading(true);
    try {
      const response = await axios.post<TicketResponse>(
        eventsConfig.GET_TICKETS_BY_ID,
        {
          event_id: eventId,
          eventDateTime_id: eventDateTimeId
        }
      );
      if (latestTicketsRequest.current !== eventDateTimeId) return;

      if (response.data && !response.data.error && Array.isArray(response.data.data)) {
        // Normalize convenience fee fields and ensure numeric types; keep only this date's tickets
        const normalizedTickets = response.data.data
          .filter((ticket: any) => !ticket.EventDateTime_id || ticket.EventDateTime_id === eventDateTimeId)
          .map((ticket: any) => normalizeTicket(ticket, eventFee));
        setTickets(normalizedTickets);
      }
    } catch (error: any) {
      // Backend answers 404 "Event Tickets Not Found" for a date with no tickets — that's an empty list, not an error
      if (error?.response?.status !== 404) console.error('Failed to fetch tickets:', error);
    } finally {
      if (latestTicketsRequest.current === eventDateTimeId) setTicketsLoading(false);
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
  // Switching between a date and the season pass chip starts the selection over,
  // so the ticket list on screen always matches what's in the cart
  const resetSelection = () => {
    setCounts({});
    setAppliedPromocode(null);
    setPromocodeInput("");
    setPromocodeError("");
  };

  const handleDateClick = async (eventDateTimeId: string) => {
    if (selectionMode === "date" && eventDateTimeId === selectedDateId) return;
    setSelectionMode("date");
    resetSelection();
    if (eventDateTimeId !== selectedDateId) {
      setSelectedDateId(eventDateTimeId);
      await loadTickets(eventDateTimeId);
    }
  };

  const handleSeasonPassClick = () => {
    if (selectionMode === "season") return;
    setSelectionMode("season");
    resetSelection();
  };

  const handleIncrease = (ticketId: string) => {
    const ticket = allTickets.find(t => t.Ticket_Id === ticketId);
    const otherSelectedId = Object.keys(counts).find(id => id !== ticketId && counts[id] > 0);

    if (otherSelectedId) {
      const otherIsSeasonPass = seasonPasses.some(pass => pass.Ticket_Id === otherSelectedId);
      toast.error(
        otherIsSeasonPass
          ? "Your season pass already covers every day. Remove it to book a single-day ticket."
          : ticket?.isSeasonPass
            ? "Remove the single-day ticket to book a season pass."
            : "Please select only one ticket type per booking. Remove other tickets first."
      );
      return;
    }

    const maxAllowed = ticket?.BookingMaxLimit || 1;
    const currentCount = counts[ticketId] || 0;

    if (currentCount >= maxAllowed) {
      toast.error(`Maximum ${maxAllowed} ticket${maxAllowed > 1 ? 's' : ''} allowed per booking.`);
      return;
    }

    if (totalTickets + 1 > 10) {
      toast.error("You can book a maximum of 10 tickets per order.");
      return;
    }

    setCounts({ ...counts, [ticketId]: currentCount + 1 });
  };

  const handleDecrease = (ticketId: string) => {
    setCounts((prev) => {
      const newCount = (prev[ticketId] || 0) - 1;
      if (newCount <= 0) {
        const { [ticketId]: _, ...rest } = prev;
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

  // ────────────────────────────────────────────────────────────────────────────
  // Customer form & validation
  // ────────────────────────────────────────────────────────────────────────────
  const handleCustChange = (field: keyof BookingForm, value: string | number) => {
    setCustomer((prev) => {
      // isWhatsApp is intentionally numeric (0/1). Stringifying it makes both
      // strict comparisons fail and prevents the alternate number input opening.
      return { ...prev, [field]: value } as BookingForm;
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

    // Free (₹0) bookings are valid — the backend confirms them immediately.
    // Only reject negative amounts.
    if (finalAmount < 0) {
      toast.error("Invalid booking amount");
      return;
    }

    const isFreeBooking = finalAmount === 0;

    try {
      setPaymentProcessing(true);
      toast.loading(isFreeBooking ? "Confirming your free booking..." : "Preparing payment gateway...");
      
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
          sessionStorage.setItem('lastEventName', eventDetails?.EventName || '');

          // ── Free booking (₹0) ──────────────────────────────────────────────
          // The backend has already confirmed the booking and sent the ticket
          // email + WhatsApp. We just redirect to the success page — no PayU.
          if ((paymentData as any).isFreeBooking) {
            const redirectUrl = (paymentData as any).redirectUrl;
            toast.success("Your free booking is confirmed! 🎉");
            if (redirectUrl) {
              window.location.href = redirectUrl;
            } else {
              // Fallback: build the success URL ourselves
              const bookingId = (paymentData as any).Booking_id || '';
              const params = new URLSearchParams({
                Booking_id: bookingId,
                txnid: '',
                amount: '0',
                paymentmode: 'FREE',
              });
              window.location.href = `${window.location.origin}/success?${params.toString()}`;
            }
            return;
          }

          // ── Paid booking → existing PayU flow ──────────────────────────────
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
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-md border border-slate-700/50 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-[#00E1FC]/15 to-[#0F33D1]/15 border-b border-slate-700/50 pb-4">
              <CardTitle className="text-xl text-white font-semibold text-center">Login Required</CardTitle>
              <CardDescription className="text-slate-300 text-center">Please login to continue with your booking</CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="text-center space-y-4">
                <div className="text-4xl mb-4">🔐</div>
                <p className="text-sm sm:text-base text-slate-300 mb-6">
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
                    className="w-full h-11 sm:h-10 border-slate-600/50 text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors"
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
  // Ticket card (shared by day tickets and season passes)
  // ────────────────────────────────────────────────────────────────────────────
  const renderTicketRow = (ticket: TicketData) => {
    const count = counts[ticket.Ticket_Id] || 0;
    const selected = count > 0;
    const soldOut = ticket.TicketAvailibilty === 0;
    const ticketDescription =
      normalizeTicketDescription(ticket.TicketDescprition) ||
      (ticket.isSeasonPass ? `Valid for all ${dates.length} days of the event.` : "");
    const expanded = expandedDescriptions[ticket.Ticket_Id];

    // Season passes get an amber tint so they stand out above the day tickets
    const cardClasses = ticket.isSeasonPass
      ? selected
        ? "border-amber-400 bg-amber-400/10 ring-1 ring-amber-400/40"
        : "border-amber-400/40 bg-amber-400/[0.06] hover:border-amber-400/70"
      : selected
        ? "border-[#00E1FC] bg-slate-900/80 ring-1 ring-[#00E1FC]/30"
        : "border-slate-700/60 bg-slate-900/60 hover:border-[#00E1FC]/40";

    return (
      <div
        key={ticket.Ticket_Id}
        className={`rounded-2xl border p-4 transition-all duration-200 ${cardClasses} ${soldOut ? "opacity-50" : ""}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-white text-sm sm:text-base leading-snug">{ticket.TicketName}</h3>
              {ticket.isSeasonPass && (
                <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border border-amber-400/60 text-amber-200 bg-amber-400/10">
                  Season Pass
                </span>
              )}
            </div>
            <p className="mt-1.5 text-base font-semibold text-slate-100">₹{ticket.TicketPrice.toLocaleString("en-IN")}</p>
          </div>

          <div className="shrink-0">
            {soldOut ? (
              <span className="inline-flex h-10 sm:h-9 items-center text-xs text-red-400 font-semibold uppercase">Sold Out</span>
            ) : selected ? (
              <div className="flex h-10 w-[112px] sm:h-9 sm:w-[104px] items-center justify-between rounded-lg border border-slate-600/60 bg-slate-950/70 px-1">
                <button
                  onClick={() => handleDecrease(ticket.Ticket_Id)}
                  className="flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-md text-white hover:bg-slate-700/60"
                  aria-label={`Remove one ${ticket.TicketName}`}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className={`text-sm font-bold ${ticket.isSeasonPass ? "text-amber-300" : "text-[#00E1FC]"}`}>{count}</span>
                <button
                  onClick={() => handleIncrease(ticket.Ticket_Id)}
                  disabled={count >= (ticket.BookingMaxLimit || 10)}
                  className="flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-md text-white hover:bg-slate-700/60 disabled:opacity-40"
                  aria-label={`Add one ${ticket.TicketName}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Button
                onClick={() => handleIncrease(ticket.Ticket_Id)}
                className={`h-10 w-[112px] sm:h-9 sm:w-[104px] rounded-lg text-sm font-semibold uppercase tracking-wide ${
                  ticket.isSeasonPass
                    ? "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-400/90 hover:to-amber-500/90 text-slate-900"
                    : "bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:from-[#00E1FC]/90 hover:to-[#0F33D1]/90 text-white"
                }`}
              >
                Add
              </Button>
            )}
          </div>
        </div>

        {ticketDescription && (
          <div className="mt-3 border-t border-slate-700/60 pt-3">
            <p className={`whitespace-pre-line text-xs leading-relaxed text-slate-400 ${expanded ? "" : "line-clamp-2"}`}>
              {ticketDescription}
            </p>
            {/* Clamped to 2 lines, so 3+ short lines need the toggle too. */}
            {(ticketDescription.length > 60 || ticketDescription.split("\n").length > 2) && (
              <button
                onClick={() =>
                  setExpandedDescriptions((prev) => ({ ...prev, [ticket.Ticket_Id]: !prev[ticket.Ticket_Id] }))
                }
                className="mt-1 py-1.5 sm:py-0 text-xs font-medium text-[#00E1FC] hover:text-[#00E1FC]/80"
              >
                {expanded ? "Show less" : "Read more..."}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderSectionHeading = (label: string) => (
    <div className="mb-3 flex items-center gap-3">
      <h2 className="whitespace-nowrap text-sm font-extrabold uppercase tracking-wider text-white">{label}</h2>
      <div className="h-px flex-1 bg-slate-700/70" />
    </div>
  );

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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black pt-6 sm:pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 sm:p-12 shadow-2xl">
            <div className="text-5xl sm:text-6xl mb-4 sm:mb-6">🎫</div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-4">Event Not Found</h1>
            <p className="text-slate-300 mb-6 sm:mb-8 text-base sm:text-lg">The event you're trying to book doesn't exist or has been removed.</p>
            <Link href="/events">
              <Button className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:from-[#00E1FC]/80 hover:to-[#0F33D1]/80 text-white px-6 sm:px-8 py-3 text-base sm:text-lg font-medium shadow-lg hover:shadow-[#00E1FC]/25 transition-all duration-300">
                Browse All Events
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // MAIN PAGE
  // ---------------------------------------------------------------------------
  return (
    <>
      <LoginModal />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      <div className="container mx-auto px-4 sm:px-8 pt-2 pb-24 sm:pb-28 max-w-3xl">
        {/* Header — event name and venue, same for single and multi-day events */}
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <Link href={`/events/${eventId}`} aria-label="Back to event">
            <Button variant="ghost" className="h-10 w-10 p-0 text-white hover:bg-white/10 border border-slate-700/50 shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-white tracking-tight line-clamp-1">{eventDetails.EventName}</h1>
            {(eventDetails.VenueName || eventDetails.VenueCity) && (
              <p className="text-xs sm:text-sm text-slate-400 line-clamp-1">
                {[eventDetails.VenueName, eventDetails.VenueCity].filter(Boolean).join(", ")}
              </p>
            )}
            {!isMultiDayEvent && selectedSlot && (
              <p className="text-xs sm:text-sm text-[#00E1FC] mt-0.5">{formatShowDate(selectedSlot)}</p>
            )}
          </div>
        </div>

        {currentStep === 2 && (
          <>
            {/* Select date & time — single-day events skip straight to tickets */}
            {isMultiDayEvent && (
              <section className="mb-7">
                {renderSectionHeading("Select Date & Time")}

                <div className="flex items-stretch gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {dateGroups.map((group) => {
                    const active = selectionMode === "date" && selectedGroup?.key === group.key;
                    return (
                      <button
                        key={group.key}
                        onClick={() => handleDateClick(group.slots[0].eventDateTime_id)}
                        className={`flex h-[74px] w-[68px] shrink-0 flex-col items-center justify-center rounded-xl border px-1 text-center transition-all duration-200 ${
                          active
                            ? "border-transparent bg-gradient-to-b from-[#00E1FC] to-[#0F33D1] text-white shadow-lg shadow-[#00E1FC]/20"
                            : "border-slate-700/60 bg-slate-800/40 text-slate-100 hover:border-[#00E1FC]/50"
                        }`}
                      >
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${active ? "text-white/90" : "text-slate-400"}`}>{group.month}</span>
                        <span className="my-0.5 text-xl font-bold leading-none">{group.day}</span>
                        {group.weekday && (
                          <span className={`text-[11px] ${active ? "text-white/90" : "text-slate-400"}`}>{group.weekday}</span>
                        )}
                      </button>
                    );
                  })}

                  {isMultiDayEvent && seasonPasses.length > 0 && (
                    <button
                      onClick={handleSeasonPassClick}
                      className={`flex h-[74px] shrink-0 flex-col items-center justify-center rounded-xl border px-3 transition-all duration-200 ${
                        selectionMode === "season"
                          ? "border-transparent bg-gradient-to-b from-amber-400 to-amber-500 text-slate-900 shadow-lg shadow-amber-400/20"
                          : "border-amber-400/40 bg-amber-400/[0.06] text-amber-200 hover:border-amber-400/70"
                      }`}
                    >
                      <span className="text-sm font-bold leading-none">Season Pass</span>
                      <span className={`mt-1 text-xs ${selectionMode === "season" ? "text-slate-900/80" : "text-slate-400"}`}>
                        All {dates.length} days
                      </span>
                    </button>
                  )}
                </div>

                {selectionMode === "date" && selectedGroup && selectedGroup.slots.some((slot) => slot.Time) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedGroup.slots.map((slot) => {
                      const active = slot.eventDateTime_id === selectedDateId;
                      return (
                        <button
                          key={slot.eventDateTime_id}
                          onClick={() => handleDateClick(slot.eventDateTime_id)}
                          className={`h-11 min-w-[104px] rounded-xl border px-5 text-sm font-semibold transition-all duration-200 ${
                            active
                              ? "border-[#00E1FC] bg-[#00E1FC]/15 text-white"
                              : "border-slate-700/60 bg-slate-800/40 text-slate-300 hover:border-[#00E1FC]/50"
                          }`}
                        >
                          {slot.Time || "Show"}
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* Choose tickets — season passes or the selected date's tickets, per the chip above */}
            <section className="mb-6">
              <div className="grid grid-cols-1 gap-3">
                {selectionMode === "season" ? (
                  seasonPasses.map((pass) => renderTicketRow(pass))
                ) : ticketsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[#00E1FC]" />
                  </div>
                ) : tickets.length > 0 ? (
                  tickets.map((ticket) => renderTicketRow(ticket))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-700/60 py-8 text-center">
                    <p className="text-slate-300">No tickets available</p>
                  </div>
                )}
              </div>
            </section>
          </>
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
                {selectedTicket.isSeasonPass ? (
                  <span className="text-amber-300"> · Valid for all {dates.length} days</span>
                ) : selectedSlot ? (
                  <span className="text-slate-400"> · {formatShowDate(selectedSlot)}</span>
                ) : null}
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
                  <label className="flex items-center gap-2 min-h-[40px] sm:min-h-0 cursor-pointer text-slate-200 hover:text-white transition-colors">
                    <input
                      type="radio"
                      checked={customer.isWhatsApp === 1}
                      onChange={() => handleCustChange("isWhatsApp", 1)}
                      className="accent-[#00E1FC] w-4 h-4"
                    />
                    Yes, use same number
                  </label>
                  <label className="flex items-center gap-2 min-h-[40px] sm:min-h-0 cursor-pointer text-slate-200 hover:text-white transition-colors">
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
                  className="flex-1 sm:flex-none bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:from-[#00E1FC]/90 hover:to-[#0F33D1]/90 text-white"
                >
                  {finalAmount === 0 ? "Continue to Booking" : "Continue to Payment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 4 && selectedTicket && (
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md border border-slate-700/50 shadow-2xl mb-4 sm:mb-6">
            <CardHeader className="bg-gradient-to-r from-[#00E1FC]/15 to-[#0F33D1]/15 border-b border-slate-700/50 px-4 py-3 sm:p-6">
              <CardTitle className="text-lg sm:text-xl text-white font-semibold">
                {finalAmount === 0 ? "Review & Confirm" : "Review & Pay"}
              </CardTitle>
              <CardDescription className="text-slate-300">
                {finalAmount === 0
                  ? "Check your booking summary, apply a coupon if needed, and confirm your free booking."
                  : "Check your booking summary, apply a coupon if needed, and complete payment."}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">{selectedTicket.TicketName}</p>
                    <p className="text-slate-400 text-xs">
                      Qty: {counts[selectedTicket.Ticket_Id]}
                      {selectedTicket.isSeasonPass
                        ? ` · Season pass for all ${dates.length} days`
                        : selectedSlot
                          ? ` · ${formatShowDate(selectedSlot)}`
                          : ""}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold text-[#00E1FC]">₹{counts[selectedTicket.Ticket_Id] * selectedTicket.TicketPrice}</span>
                </div>
                <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/30 text-sm text-slate-300 break-words">
                  <p className="font-medium text-white">{customer.firstName} {customer.lastName}</p>
                  <p>{customer.phone}</p>
                  <p className="break-all">{customer.email}</p>
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
                        className="shrink-0 bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:from-[#00E1FC]/90 hover:to-[#0F33D1]/90 text-white"
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
                            className="w-full text-left p-3 sm:p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded border border-slate-700/30 transition-colors"
                          >
                            <div className="flex justify-between items-center gap-2">
                              <span className="min-w-0 truncate text-[#00E1FC] font-semibold text-sm">{promo.PromoCodeName}</span>
                              <Badge variant="outline" className="shrink-0 text-xs border-green-400/50 text-green-300">
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
                    <div className="flex justify-between items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-green-300 font-semibold text-sm break-all">{appliedPromocode.PromoCodeName}</p>
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
                        className="shrink-0 text-red-400 hover:text-red-300 hover:bg-red-900/20 h-10 sm:h-8"
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
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="min-w-0 break-all text-green-400">Discount ({appliedPromocode.PromoCodeName})</span>
                    <span className="shrink-0 text-green-400">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <Separator className="bg-slate-600/50" />

              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-[#00E1FC]/10 to-[#0F33D1]/10 rounded-lg border border-[#00E1FC]/20">
                <span className="text-white font-semibold">Total</span>
                <span className="text-[#00E1FC] font-bold text-lg">₹{finalAmount.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <Button variant="outline" onClick={() => setCurrentStep(3)} className="h-12 sm:h-10 border-slate-600/50 text-slate-200 hover:bg-slate-800/50">
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
                      {finalAmount === 0 ? "Confirming..." : "Processing Payment..."}
                    </>
                  ) : finalAmount === 0 ? (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Book for Free
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

        {/* Sticky footer for ticket selection */}
        {currentStep === 2 && selectedDateId ? (
          <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-700/70 bg-slate-950/95 backdrop-blur-md p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
              <div className="shrink-0">
                <p className="text-xs text-slate-400">
                  {totalTickets > 0
                    ? selectedSeasonPass
                      ? `${totalTickets} season pass${totalTickets > 1 ? 'es' : ''} · all ${dates.length} days`
                      : `${totalTickets} ticket${totalTickets > 1 ? 's' : ''} selected`
                    : 'No tickets selected'}
                </p>
                <p className="text-lg font-bold text-white">
                  {totalTickets > 0 ? `₹${totalPrice.toLocaleString("en-IN")}` : '—'}
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
