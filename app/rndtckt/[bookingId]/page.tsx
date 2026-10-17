"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import axios from "axios";
import { ArrowLeft, Calendar, Download, MapPin, RefreshCcw, Ticket as TicketIcon } from "lucide-react";
import { customer } from "@/utils/config";
import { decryptData } from "@/utils/constants";
import { bookingIdOf, flattenBookings, formatRupees, getBookingDetails } from "@/lib/bookings";

export default function TicketPage({ params }: { params: { bookingId: string } }) {
  const passphrase = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "";
  const auth = useSelector((store: any) => store.uSess);
  const customerId = auth?.xA1 ? decryptData(auth.xA1, passphrase) : "";
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTicket = useCallback(async () => {
    if (!customerId) {
      setError("Please sign in to view this ticket.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await axios.post<any>(customer.GET_TICKETS_BY_ID, { customer_id: customerId });
      const bookings = flattenBookings(response.data?.data);
      const match = bookings.find((booking) => bookingIdOf(booking) === String(params.bookingId));
      if (!match) throw new Error("Ticket not found in your bookings.");
      setTicket(match);
    } catch (requestError: any) {
      const status = requestError?.response?.status;
      setError(
        status === 502
          ? "The ticket service is temporarily unavailable. Your booking is still safe—please try again shortly."
          : requestError?.response?.data?.message || requestError?.message || "We could not load this ticket."
      );
    } finally {
      setLoading(false);
    }
  }, [customerId, params.bookingId]);

  useEffect(() => { loadTicket(); }, [loadTicket]);

  const details = useMemo(() => (ticket ? getBookingDetails(ticket) : null), [ticket]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-[#00E1FC]" />
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-center">
          <TicketIcon className="mx-auto mb-4 h-12 w-12 text-slate-500" />
          <h1 className="text-xl font-bold text-white">Ticket unavailable</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{error}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button onClick={loadTicket} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] px-5 py-3 font-semibold text-white">
              <RefreshCcw className="h-4 w-4" /> Retry
            </button>
            <Link href={`/userDetails/${customerId}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-200">
              <ArrowLeft className="h-4 w-4" /> My tickets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-lg">
        <Link href={`/userDetails/${customerId}`} className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to my tickets
        </Link>
        <article className="overflow-hidden rounded-3xl border border-[#00E1FC]/25 bg-slate-900 shadow-2xl">
          <header className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/75">Eventing Club e-ticket</p>
            <h1 className="mt-2 break-words text-2xl font-bold text-white sm:text-3xl">{details.eventName}</h1>
          </header>
          <div className="space-y-5 p-5 sm:p-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Ticket</p>
              <p className="mt-1 font-semibold text-white">{details.ticketName} × {details.quantity}</p>
              {details.totalAmount !== null && (
                <p className="mt-1 text-sm text-slate-400">Amount paid: {formatRupees(details.totalAmount)}</p>
              )}
            </div>
            <div className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 sm:grid-cols-2">
              <p className="flex items-start gap-2 text-sm text-slate-300">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#00E1FC]" />
                <span>{details.eventDate || "Date to be announced"}{details.eventTime ? ` · ${details.eventTime}` : ""}</span>
              </p>
              {details.venue && (
                <p className="flex items-start gap-2 text-sm text-slate-300">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#00E1FC]" />
                  <span>{details.venue}</span>
                </p>
              )}
            </div>
            <dl className="space-y-1.5 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-sm">
              {[
                ["Ticket price", formatRupees(details.ticketPrice)],
                ["Convenience fee", details.convenienceFee ? formatRupees(details.convenienceFee) : ""],
                ["Promo code", details.promocode],
                ["Amount paid", formatRupees(details.totalAmount)],
                ["Booked on", details.bookedOn],
                ["Payment ref", details.paymentRef],
                ["Status", details.status],
              ]
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-3">
                    <dt className="shrink-0 text-slate-500">{label}</dt>
                    <dd className="min-w-0 break-words text-right text-slate-200">{value}</dd>
                  </div>
                ))}
            </dl>
            {details.qrCode && (
              <div className="mx-auto w-fit rounded-2xl bg-white p-3">
                <img src={details.qrCode} alt={`QR code for booking ${params.bookingId}`} className="h-44 w-44 object-contain" />
              </div>
            )}
            <div className="rounded-xl border border-dashed border-slate-700 p-3 text-center">
              <p className="text-xs uppercase tracking-wider text-slate-500">Booking ID</p>
              <p className="mt-1 break-all font-mono text-sm font-semibold text-white">{params.bookingId}</p>
            </div>
            {details.downloadable && (
              <a href={details.downloadable} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] px-5 py-3 font-semibold text-white">
                <Download className="h-4 w-4" /> Download ticket
              </a>
            )}
            <p className="text-center text-xs leading-relaxed text-slate-500">Keep this ticket and booking ID ready at the venue. Do not share it publicly.</p>
          </div>
        </article>
      </div>
    </div>
  );
}
