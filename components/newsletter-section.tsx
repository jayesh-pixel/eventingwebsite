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
    <section className="py-20 relative md:-mt-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&h=600" 
          alt="Festival crowd with stage lights" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-slate-950/80"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fadeInUp">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Never Miss a 
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> Beat</span>
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Get exclusive access to pre-sale tickets, artist announcements, and special events before anyone else.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-8">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-slate-800/50 border-slate-700 rounded-lg px-6 py-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-white placeholder-slate-400"
            />
            <Button 
              onClick={handleSubscribe}
              className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] px-8 py-4 hover:shadow-lg hover:shadow-[#00E1FC]/25 transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
            >
              <Bell className="mr-2 h-4 w-4" />
              Get Notified
            </Button>
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-slate-400">
            <div className="flex items-center">
              <Ticket className="text-primary mr-2 h-5 w-5" />
              <span className="text-sm">Early Access</span>
            </div>
            <div className="flex items-center">
              <Star className="text-accent mr-2 h-5 w-5" />
              <span className="text-sm">Exclusive Events</span>
            </div>
            <div className="flex items-center">
              <Gift className="text-secondary mr-2 h-5 w-5" />
              <span className="text-sm">Special Offers</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
