"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X } from "lucide-react";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = require('next/navigation').useRouter();

  return (
    <nav className="fixed top-0 w-full z-50 glass-card">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16 px-0">
          <div className="flex pl-0 ml-0">
            <a href="/" className="block">
              <img
                src="/eventing-club-logo.svg"
                alt="Eventing Club Logo"
                className="h-20 w-auto"
                style={{ display: 'block' }}
              />
            </a>
          </div>
          
          <div className="hidden md:flex items-center text-white space-x-8">
            <a href="/" className="hover:text-primary transition-colors duration-300">Home</a>
            <a href="#" className="hover:text-primary transition-colors duration-300">Events</a>
            <a href="/artists" className="hover:text-primary transition-colors duration-300">Artists</a>
            <a href="/venues" className="hover:text-primary transition-colors duration-300">Venues</a>
            <a href="/about" className="hover:text-primary transition-colors duration-300">About Us</a>
            <a href="/listwithus" className="hover:text-primary transition-colors duration-300">List With Us</a>
            <a href="#" className="hover:text-primary transition-colors duration-300">Contact</a>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden sm:block">
              <Input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-800/50 border-slate-700 rounded-lg pl-10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            </div>
            <Button
              className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:shadow-lg hover:shadow-[#00E1FC]/25 transition-all duration-300 transform hover:scale-105"
              onClick={() => router.push('/signup')}
            >
              Sign Up
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-950/95 backdrop-blur-lg border-t border-slate-800">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <a href="/" className="block px-3 py-2 hover:text-primary transition-colors duration-300">Home</a>
            <a href="#" className="block px-3 py-2 hover:text-primary transition-colors duration-300">Events</a>
            <a href="/artists" className="block px-3 py-2 hover:text-primary transition-colors duration-300">Artists</a>
            <a href="/venues" className="block px-3 py-2 hover:text-primary transition-colors duration-300">Venues</a>
            <a href="/about" className="block px-3 py-2 hover:text-primary transition-colors duration-300">About Us</a>
            <a href="/listwithus" className="block px-3 py-2 hover:text-primary transition-colors duration-300">List With Us</a>
            <a href="#" className="block px-3 py-2 hover:text-primary transition-colors duration-300">Contact</a>
          </div>
        </div>
      )}
    </nav>
  );
}