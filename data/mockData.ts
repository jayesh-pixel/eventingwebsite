export const mockCategories = [
  {
    id: "electronic",
    name: "Electronic & EDM",
    slug: "electronic",
    description: "High-energy electronic beats and world-class DJs",
    eventCount: 24,
    icon: "fas fa-music",
    color: "primary"
  },
  {
    id: "rock",
    name: "Rock & Alternative",
    slug: "rock",
    description: "Raw energy and powerful guitar riffs",
    eventCount: 18,
    icon: "fas fa-guitar",
    color: "secondary"
  },
  {
    id: "pop",
    name: "Pop & Mainstream",
    slug: "pop",
    description: "Chart-topping hits and crowd favorites",
    eventCount: 32,
    icon: "fas fa-microphone",
    color: "accent"
  },
  {
    id: "jazz",
    name: "Jazz & Classical",
    slug: "jazz",
    description: "Sophisticated melodies and timeless performances",
    eventCount: 12,
    icon: "fas fa-piano",
    color: "danger"
  }
];

export const mockArtists = [
  {
    id: "djnova",
    name: "DJ Nova",
    genre: "Electronic / House",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
    eventCount: 3
  },
  {
    id: "lunawave",
    name: "Luna Wave",
    genre: "Pop / Indie",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    eventCount: 2
  },
  {
    id: "stormrider",
    name: "Storm Rider",
    genre: "Rock / Metal",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    eventCount: 4
  },
  {
    id: "smoothjazz",
    name: "Marcus Smooth",
    genre: "Jazz / Blues",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    eventCount: 1
  },
  {
    id: "synthwave",
    name: "Synth Master",
    genre: "Synthwave / Retro",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    eventCount: 5
  },
  {
    id: "acoustica",
    name: "Acoustica",
    genre: "Folk / Acoustic",
    imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    eventCount: 2
  }
];

export const mockVenues = [
  {
    id: "midnight-arena",
    name: "Midnight Arena",
    location: "Downtown Metro • USA",
    capacity: 50000,
    description: "State-of-the-art arena with world-class acoustics and lighting systems.",
    imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop"
  },
  {
    id: "intimate-space",
    name: "The Intimate Space",
    location: "Arts District • USA",
    capacity: 200,
    description: "Cozy venue perfect for acoustic performances and close artist interactions.",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop"
  },
  {
    id: "thunder-arena",
    name: "Thunder Arena",
    location: "Industrial Quarter • USA",
    capacity: 15000,
    description: "High-energy venue designed for rock, metal, and alternative performances.",
    imageUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&h=400&fit=crop"
  },
  {
    id: "grand-hall",
    name: "Grand Hall",
    location: "Cultural Center • USA",
    capacity: 2500,
    description: "Historic venue with exceptional acoustics for classical and jazz performances.",
    imageUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=400&fit=crop"
  }
];

export const mockEvents = [
  {
    id: "midnight-main",
    title: "Midnight Mirage Festival 2024",
    description: "Experience the ultimate electronic music journey with world-renowned DJs, stunning visuals, and an unforgettable atmosphere under the stars.",
    category: "Electronic",
    venue: "Midnight Arena",
    date: "28 JUL",
    time: "8:00 PM",
    price: 89,
    capacity: 50000,
    imageUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&h=800&fit=crop",
    featured: "true",
    artistIds: ["djnova", "synthwave"]
  },
  {
    id: "acoustic-night",
    title: "Acoustic Night Sessions",
    description: "An intimate evening of acoustic performances featuring rising indie artists.",
    category: "Acoustic",
    venue: "The Intimate Space",
    date: "30 JUL",
    time: "8:00 PM",
    price: 45,
    capacity: 200,
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop",
    featured: "false",
    artistIds: ["acoustica"]
  },
  {
    id: "rock-revival",
    title: "Rock Revival Night",
    description: "High-energy rock performances that will shake the foundations.",
    category: "Rock",
    venue: "Thunder Arena",
    date: "02 AUG",
    time: "9:00 PM",
    price: 65,
    capacity: 15000,
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop",
    featured: "false",
    artistIds: ["stormrider"]
  }
];