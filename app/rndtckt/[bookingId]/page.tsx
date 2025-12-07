"use client";
import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function RndTcktPage({ params }: { params: { bookingId: string } }) {
  useEffect(() => {
    const redirectToExternal = () => {
      toast.loading("Redirecting to ticket service...", { id: "rndtckt" });
      const host = process.env.NEXT_PUBLIC_RNDTCKT_HOST || "https://devapi.eventingclub.in";
      const externalUrl = `${host.replace(/\/$/, "")}/rndtckt/${encodeURIComponent(params.bookingId)}`;
      // Navigate the browser to the external ticket URL
      window.location.href = externalUrl;
    };

    redirectToExternal();
  }, [params.bookingId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <Toaster />
      <div className="text-center">
        <p className="text-lg">Preparing your ticket… Redirecting now.</p>
      </div>
    </div>
  );
}
