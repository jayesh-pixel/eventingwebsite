import { Button } from "@/components/ui/button";
import { Calendar, Play } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&h=1380" 
          alt="Music festival crowd" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-slate-950/90"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fadeInUp">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Experience
            </span>
            <br />
            <span className="text-white">Music Like Never Before</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover exclusive events, world-class artists, and unforgettable moments at the most incredible venues around the globe.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] px-8 py-4 text-lg hover:shadow-2xl hover:shadow-[#00E1FC]/25 transition-all duration-300 transform hover:scale-105 animate-glow">
              <Calendar className="mr-2 h-5 w-5" />
              Explore Events
            </Button>
            <Button variant="outline" className="border-2 border-[#FD743F] px-8 py-4 text-lg hover:bg-[#FDAB8B]/10 transition-all duration-300 transform text-[#FD743F] hover:scale-105">
              <Play className="mr-2 h-5 w-5" />
              Watch Experience
            </Button>
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full opacity-20 animate-float"></div>
      <div className="absolute bottom-1/3 right-16 w-16 h-16 bg-gradient-to-r from-accent to-destructive rounded-full opacity-30 animate-float" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-gradient-to-r from-secondary to-primary rounded-full opacity-25 animate-float" style={{animationDelay: '4s'}}></div>
    </section>
  );
}
