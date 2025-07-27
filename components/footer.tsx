import { Instagram, Twitter, Music2, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Midnight Mirage
            </div>
            <p className="text-slate-400 leading-relaxed">
              Connecting music lovers with unforgettable experiences worldwide. Your gateway to the best live events.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-primary transition-colors duration-300">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-primary transition-colors duration-300">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-primary transition-colors duration-300">
                <Music2 className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-primary transition-colors duration-300">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Events */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Events</h3>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-primary transition-colors duration-300">Upcoming Events</a></li>
              <li><a href="#" className="hover:text-primary transition-colors duration-300">Featured Events</a></li>
              <li><a href="#" className="hover:text-primary transition-colors duration-300">Music Festivals</a></li>
              <li><a href="#" className="hover:text-primary transition-colors duration-300">Concerts</a></li>
              <li><a href="#" className="hover:text-primary transition-colors duration-300">Venues</a></li>
            </ul>
          </div>

          {/* Artists */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Artists</h3>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-primary transition-colors duration-300">Electronic</a></li>
              <li><a href="#" className="hover:text-primary transition-colors duration-300">Rock & Alternative</a></li>
              <li><a href="#" className="hover:text-primary transition-colors duration-300">Pop & Mainstream</a></li>
              <li><a href="#" className="hover:text-primary transition-colors duration-300">Jazz & Classical</a></li>
              <li><a href="#" className="hover:text-primary transition-colors duration-300">Discover Artists</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Support</h3>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-primary transition-colors duration-300">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors duration-300">Ticket Support</a></li>
              <li><a href="#" className="hover:text-primary transition-colors duration-300">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors duration-300">FAQ</a></li>
              <li><a href="#" className="hover:text-primary transition-colors duration-300">Terms & Privacy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-slate-400 text-sm mb-4 md:mb-0">
            © 2024 Midnight Mirage. All rights reserved. Crafted with passion for music lovers.
          </div>
          <div className="flex items-center space-x-4 text-sm text-slate-400">
            <a href="#" className="hover:text-primary transition-colors duration-300">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-primary transition-colors duration-300">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-primary transition-colors duration-300">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
