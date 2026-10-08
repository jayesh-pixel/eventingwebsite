"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Ticket, Star, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubscribe = () => {
    if (!email) {
      toast({
        title: "Please enter your email",
        description: "We need your email address to send you updates.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Thank you for subscribing!",
      description: "You will receive exclusive event updates in your inbox.",
    });
    setEmail("");
  };

  return (
    <section className="py-12 sm:py-14 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80" 
          alt="Festival crowd with stage lights" 
          className="w-full h-full object-cover object-center" 
        />
        <div className="absolute inset-0 bg-slate-950/85"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fadeInUp">
          <h2 className="text-3xl md:text-5xl font-bold mb-5 text-white">
            Never Miss a
            <span className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] bg-clip-text text-transparent"> Beat</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white font-medium mb-6 max-w-3xl mx-auto leading-relaxed">
            Get exclusive access to pre-sale tickets, artist announcements, and special events before anyone else.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-6">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white/10 backdrop-blur-md border-white/20 rounded-lg px-6 py-4 text-lg focus:ring-2 focus:ring-[#00E1FC] focus:border-[#00E1FC] transition-all duration-300 text-white placeholder-white/60"
            />
            <Button 
              onClick={handleSubscribe}
              className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] px-8 py-4 text-lg font-bold hover:shadow-xl hover:shadow-[#00E1FC]/50 transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
            >
              <Bell className="mr-2 h-4 w-4" />
              Get Notified
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-x-6 gap-y-3 md:gap-10 text-white flex-wrap">
            <div className="flex items-center gap-2">
              <Ticket className="text-[#00E1FC] h-6 w-6" />
              <span className="text-base font-semibold">Early Access</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="text-[#FFD700] h-6 w-6" />
              <span className="text-base font-semibold">Exclusive Events</span>
            </div>
            <div className="flex items-center gap-2">
              <Gift className="text-[#FF6B6B] h-6 w-6" />
              <span className="text-base font-semibold">Special Offers</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
