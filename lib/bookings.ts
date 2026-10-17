// Shapes a customer booking from /customer/get_booked_tickets for display.
// The backend has used several spellings (and nested Event/Ticket objects) over time,
// so every field falls back through the known aliases - the same ones the dashboard reads.

const first = (...values: unknown[]) => {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
};

const firstNumber = (...values: unknown[]) => {
  for (const value of values) {
    if (value === undefined || value === null || value === "") continue;
    const num = Number(value);
    if (Number.isFinite(num)) return num;
  }
  return null;
};

export const bookingIdOf = (booking: any) =>
  first(booking?.Booking_id, booking?.booking_id, booking?.BookingId, booking?._id);

export const flattenBookings = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];

  const knownGroups = [
    data.UpcomingEventTickets,
    data.PastEventTickets,
    data.PromoterBookedTickets,
    data.upcoming,
    data.past,
    data.promoter_tickets,
    data.bookings,
    data.tickets,
  ];
  const grouped = knownGroups.flatMap((group) => (Array.isArray(group) ? group : []));
  return grouped.length ? grouped : [data];
};

export const mediaUrl = (path?: string) => {
  if (!path) return "";
  return path.startsWith("http")
    ? path
    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${path.replace(/^\//, "")}`;
};

const STATUS_LABELS: Record<string, string> = { "0": "Cancelled", "1": "Confirmed", "2": "Cancelled" };

const formatDateTime = (value: string) => {
  if (!value) return "";
  const parsed = new Date(value);
  // Only reformat ISO-like timestamps; leave human strings such as "11 Oct,2026" as sent.
  if (!/^\d{4}-\d{2}-\d{2}/.test(value) || isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const formatRupees = (amount: number | null) =>
  amount === null ? "" : `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export type BookingDetails = {
  bookingId: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  ticketName: string;
  quantity: number;
  ticketPrice: number | null;
  totalAmount: number | null;
  convenienceFee: number | null;
  promocode: string;
  bookedOn: string;
  paymentRef: string;
  status: string;
  qrCode: string;
  downloadable: string;
};

export const getBookingDetails = (booking: any): BookingDetails => {
  const event = booking?.Event || booking?.EventData || {};
  // A booking can carry its ticket lines as an array; summarise them by name.
  const ticketLines: any[] = Array.isArray(booking?.TicketsData)
    ? booking.TicketsData
    : Array.isArray(booking?.Tickets)
      ? booking.Tickets
      : [];
  const ticket = booking?.Ticket || ticketLines[0] || {};

  const quantity =
    firstNumber(
      booking?.TicketQuantity,
      booking?.Quantity,
      booking?.quantity,
      booking?.TotalQuantity,
      booking?.ticket_quantity,
      ticketLines.length
        ? ticketLines.reduce((sum, line) => sum + (Number(line?.TicketQuantity ?? line?.Quantity ?? 1) || 0), 0)
        : null
    ) || 1;

  const ticketName = ticketLines.length > 1
    ? ticketLines.map((line) => first(line?.TicketName, line?.ticket_name)).filter(Boolean).join(", ")
    : first(booking?.TicketName, booking?.EventTicketName, booking?.ticketName, booking?.ticket_name, ticket?.TicketName);

  const rawStatus = first(booking?.Status, booking?.status, booking?.bookingStatus, booking?.booking_status);

  return {
    bookingId: bookingIdOf(booking),
    eventId: first(booking?.event_id, booking?.EventId, booking?.Event_id, booking?.eventId, event?.event_id),
    eventName: first(booking?.EventName, booking?.event_name, booking?.eventName, event?.EventName) || "Event ticket",
    eventDate: first(
      booking?.EventDate,
      booking?.TicketDate,
      booking?.EventStartDate,
      booking?.Date,
      booking?.event_date,
      booking?.ticketDate,
      event?.EventStartDate
    ),
    eventTime: first(booking?.EventTime, booking?.EventStartTime, booking?.Time, booking?.TicketTime, event?.EventStartTime),
    venue: [
      first(booking?.EventVenue, booking?.EventVenueName, booking?.VenueName, booking?.venue, event?.VenueName),
      first(booking?.VenueCity, booking?.EventCityName, booking?.CityName, booking?.city, event?.VenueCity),
    ]
      .filter(Boolean)
      .join(", "),
    ticketName: ticketName || "Admission",
    quantity,
    ticketPrice: firstNumber(booking?.TicketPrice, booking?.ticketPrice, ticket?.TicketPrice),
    totalAmount: firstNumber(
      booking?.TotalAmount,
      booking?.totalAmount,
      booking?.total_amount,
      booking?.AmountPaid,
      booking?.Amount,
      booking?.Price
    ),
    convenienceFee: firstNumber(
      booking?.ConvinienceFeeAmount,
      booking?.ConvenienceFee,
      booking?.ConvinienceFeeValue,
      booking?.convenienceFee
    ),
    promocode: first(booking?.PromocodeName, booking?.CustomerPromocode, booking?.Promocode, booking?.promocode),
    bookedOn: formatDateTime(
      first(booking?.BookingDateTime, booking?.BookingDate, booking?.bookingDate, booking?.createdAt, booking?.created_at)
    ),
    paymentRef: first(booking?.Transaction_id, booking?.TransactionId, booking?.ReferenceId, booking?.Reference_id, booking?.referenceId),
    status: STATUS_LABELS[rawStatus] || rawStatus,
    qrCode: mediaUrl(first(booking?.QRCode, booking?.QrCode, booking?.QRCodeImage, booking?.qr_code, booking?.QrImage)),
    downloadable: mediaUrl(first(booking?.TicketUrl, booking?.TicketPDF, booking?.PdfUrl, booking?.ticket_url)),
  };
};
