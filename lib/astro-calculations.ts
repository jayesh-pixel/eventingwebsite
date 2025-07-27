// Simplified Vedic astrology calculations
// In production, use proper astronomical libraries like Swiss Ephemeris

export interface BirthDetails {
  name: string
  place: string
  date: string
  time: string
  latitude: number
  longitude: number
  timezone: number
}

export interface PlanetPosition {
  name: string
  longitude: number
  sign: string
  degree: number
  house: number
  nakshatra: string
  pada: number
}

export interface AstrologyData {
  birthDetails: BirthDetails
  julianDay: number
  ayanamsa: number
  ascendant: number
  planets: PlanetPosition[]
  houses: number[]
  nakshatras: string[]
  dasha: {
    current: string
    balance: string
    periods: Array<{ planet: string; start: string; end: string }>
  }
  predictions: {
    character: string
    career: string
    health: string
    marriage: string
    finance: string
  }
}

const SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
]

const NAKSHATRAS = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigasira",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishta",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati",
]

const PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]

export function calculateVedicChart(birthDetails: BirthDetails): AstrologyData {
  const birthDateTime = new Date(`${birthDetails.date}T${birthDetails.time}`)
  const julianDay = getJulianDay(birthDateTime)
  const ayanamsa = calculateAyanamsa(julianDay)

  // Calculate planetary positions (simplified)
  const planets = calculatePlanetaryPositions(julianDay, ayanamsa)

  // Calculate ascendant
  const ascendant = calculateAscendant(julianDay, birthDetails.latitude, birthDetails.longitude)

  // Calculate houses
  const houses = calculateHouses(ascendant)

  // Assign houses to planets
  planets.forEach((planet) => {
    planet.house = getHouseFromLongitude(planet.longitude, ascendant)
  })

  // Calculate current dasha
  const dasha = calculateDasha(planets.find((p) => p.name === "Moon")!.longitude, birthDateTime)

  // Generate predictions
  const predictions = generatePredictions(planets, ascendant)

  return {
    birthDetails,
    julianDay,
    ayanamsa,
    ascendant,
    planets,
    houses,
    nakshatras: NAKSHATRAS,
    dasha,
    predictions,
  }
}

function getJulianDay(date: Date): number {
  const a = Math.floor((14 - (date.getMonth() + 1)) / 12)
  const y = date.getFullYear() + 4800 - a
  const m = date.getMonth() + 1 + 12 * a - 3

  return (
    date.getDate() +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045 +
    (date.getHours() - 12) / 24 +
    date.getMinutes() / 1440 +
    date.getSeconds() / 86400
  )
}

function calculateAyanamsa(julianDay: number): number {
  // Lahiri Ayanamsa calculation (simplified)
  const t = (julianDay - 2451545.0) / 36525.0
  return 23.85 + 0.0139 * t // Simplified formula
}

function calculatePlanetaryPositions(julianDay: number, ayanamsa: number): PlanetPosition[] {
  const t = (julianDay - 2451545.0) / 36525.0
  const positions: PlanetPosition[] = []

  // Simplified planetary position calculations
  // In production, use proper astronomical algorithms

  const planetData = [
    { name: "Sun", meanLongitude: 280.46646 + 36000.76983 * t },
    { name: "Moon", meanLongitude: 218.3165 + 481267.8813 * t },
    { name: "Mars", meanLongitude: 355.433 + 19140.3 * t },
    { name: "Mercury", meanLongitude: 252.251 + 149472.67 * t },
    { name: "Jupiter", meanLongitude: 34.351 + 3034.906 * t },
    { name: "Venus", meanLongitude: 181.979 + 58517.816 * t },
    { name: "Saturn", meanLongitude: 50.078 + 1222.114 * t },
  ]

  planetData.forEach((planet) => {
    let longitude = planet.meanLongitude % 360
    if (longitude < 0) longitude += 360

    // Apply ayanamsa for sidereal positions
    longitude = (longitude - ayanamsa) % 360
    if (longitude < 0) longitude += 360

    const sign = SIGNS[Math.floor(longitude / 30)]
    const degree = longitude % 30
    const nakshatraIndex = Math.floor(longitude / (360 / 27))
    const nakshatra = NAKSHATRAS[nakshatraIndex]
    const pada = Math.floor((longitude % (360 / 27)) / (360 / 108)) + 1

    positions.push({
      name: planet.name,
      longitude,
      sign,
      degree,
      house: 1, // Will be calculated later
      nakshatra,
      pada,
    })
  })

  // Add Rahu and Ketu (simplified calculation)
  const rahuLongitude = (125.0 - 0.0529539 * (julianDay - 2451545.0)) % 360
  const ketuLongitude = (rahuLongitude + 180) % 360

  positions.push({
    name: "Rahu",
    longitude: rahuLongitude,
    sign: SIGNS[Math.floor(rahuLongitude / 30)],
    degree: rahuLongitude % 30,
    house: 1,
    nakshatra: NAKSHATRAS[Math.floor(rahuLongitude / (360 / 27))],
    pada: Math.floor((rahuLongitude % (360 / 27)) / (360 / 108)) + 1,
  })

  positions.push({
    name: "Ketu",
    longitude: ketuLongitude,
    sign: SIGNS[Math.floor(ketuLongitude / 30)],
    degree: ketuLongitude % 30,
    house: 1,
    nakshatra: NAKSHATRAS[Math.floor(ketuLongitude / (360 / 27))],
    pada: Math.floor((ketuLongitude % (360 / 27)) / (360 / 108)) + 1,
  })

  return positions
}

function calculateAscendant(julianDay: number, latitude: number, longitude: number): number {
  // Simplified ascendant calculation
  const t = (julianDay - 2451545.0) / 36525.0
  const siderealTime = 280.46061837 + 360.98564736629 * (julianDay - 2451545.0) + longitude

  // This is a very simplified calculation
  // In production, use proper astronomical libraries
  return (siderealTime + latitude * 0.5) % 360
}

function calculateHouses(ascendant: number): number[] {
  const houses = []
  for (let i = 0; i < 12; i++) {
    houses.push((ascendant + i * 30) % 360)
  }
  return houses
}

function getHouseFromLongitude(planetLongitude: number, ascendant: number): number {
  const houseLongitude = (planetLongitude - ascendant + 360) % 360
  return Math.floor(houseLongitude / 30) + 1
}

function calculateDasha(moonLongitude: number, birthDate: Date): any {
  // Simplified Vimshottari Dasha calculation
  const nakshatraIndex = Math.floor(moonLongitude / (360 / 27))
  const dashaLords = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]
  const dashaYears = [7, 20, 6, 10, 7, 18, 16, 19, 17]

  const currentLordIndex = nakshatraIndex % 9
  const currentLord = dashaLords[currentLordIndex]

  // Calculate balance (simplified)
  const nakshatraProgress = (moonLongitude % (360 / 27)) / (360 / 27)
  const totalDashaYears = dashaYears[currentLordIndex]
  const remainingYears = totalDashaYears * (1 - nakshatraProgress)

  const balance = `${Math.floor(remainingYears)} Y ${Math.floor((remainingYears % 1) * 12)} M ${Math.floor((((remainingYears % 1) * 12) % 1) * 30)} D`

  // Generate dasha periods
  const periods = []
  const currentDate = new Date(birthDate)

  for (let i = 0; i < 9; i++) {
    const lordIndex = (currentLordIndex + i) % 9
    const startDate = new Date(currentDate)
    currentDate.setFullYear(currentDate.getFullYear() + dashaYears[lordIndex])
    const endDate = new Date(currentDate)

    periods.push({
      planet: dashaLords[lordIndex],
      start: startDate.toLocaleDateString(),
      end: endDate.toLocaleDateString(),
    })
  }

  return {
    current: currentLord,
    balance,
    periods: periods.slice(0, 5), // Show first 5 periods
  }
}

function generatePredictions(planets: PlanetPosition[], ascendant: number): any {
  // Generate basic predictions based on planetary positions
  const ascendantSign = SIGNS[Math.floor(ascendant / 30)]

  const predictions = {
    character: generateCharacterPrediction(ascendantSign, planets),
    career: generateCareerPrediction(planets),
    health: generateHealthPrediction(planets),
    marriage: generateMarriagePrediction(planets),
    finance: generateFinancePrediction(planets),
  }

  return predictions
}

function generateCharacterPrediction(ascendantSign: string, planets: PlanetPosition[]): string {
  const characterTraits: Record<string, string> = {
    Aries:
      "You are energetic, ambitious, and natural leader. You have a pioneering spirit and are not afraid to take risks.",
    Taurus:
      "You are practical, reliable, and have a strong appreciation for beauty and comfort. You value stability and security.",
    Gemini:
      "You are curious, adaptable, and excellent communicator. You have a quick wit and love learning new things.",
    Cancer:
      "You are nurturing, intuitive, and deeply emotional. You have strong family values and protective instincts.",
    Leo: "You are confident, generous, and natural performer. You have leadership qualities and enjoy being in the spotlight.",
    Virgo:
      "You are analytical, detail-oriented, and perfectionist. You have a practical approach to life and strong work ethic.",
    Libra:
      "You are diplomatic, harmonious, and have refined taste. You seek balance and fairness in all aspects of life.",
    Scorpio:
      "You are intense, passionate, and mysterious. You have strong willpower and ability to transform yourself.",
    Sagittarius:
      "You are optimistic, adventurous, and philosophical. You love freedom and have a broad perspective on life.",
    Capricorn:
      "You are ambitious, disciplined, and responsible. You have strong organizational skills and long-term vision.",
    Aquarius: "You are innovative, independent, and humanitarian. You have unique ideas and care about social causes.",
    Pisces:
      "You are compassionate, intuitive, and artistic. You have deep empathy and strong connection to spirituality.",
  }

  return characterTraits[ascendantSign] || "You have a unique and complex personality with many positive qualities."
}

function generateCareerPrediction(planets: PlanetPosition[]): string {
  const jupiter = planets.find((p) => p.name === "Jupiter")
  const saturn = planets.find((p) => p.name === "Saturn")
  const mercury = planets.find((p) => p.name === "Mercury")

  let prediction = "Your career will be influenced by multiple planetary factors. "

  if (jupiter && jupiter.house <= 4) {
    prediction += "Jupiter's position suggests success in education, teaching, or advisory roles. "
  }

  if (saturn && saturn.house >= 6 && saturn.house <= 8) {
    prediction += "Saturn indicates hard work will lead to steady progress and recognition. "
  }

  if (mercury && mercury.house <= 3) {
    prediction += "Mercury suggests talent in communication, writing, or business. "
  }

  prediction += "Focus on developing your skills and maintaining professional relationships for long-term success."

  return prediction
}

function generateHealthPrediction(planets: PlanetPosition[]): string {
  const mars = planets.find((p) => p.name === "Mars")
  const sun = planets.find((p) => p.name === "Sun")

  let prediction = "Your health requires attention to both physical and mental well-being. "

  if (mars && mars.house >= 6 && mars.house <= 8) {
    prediction += "Mars position suggests need for regular exercise and avoiding stress-related issues. "
  }

  if (sun && sun.house <= 6) {
    prediction += "Sun's influence indicates good vitality but watch for heart and eye-related concerns. "
  }

  prediction += "Maintain a balanced diet, regular exercise routine, and practice stress management techniques."

  return prediction
}

function generateMarriagePrediction(planets: PlanetPosition[]): string {
  const venus = planets.find((p) => p.name === "Venus")
  const jupiter = planets.find((p) => p.name === "Jupiter")

  let prediction = "Your marriage and relationships will bring both joy and learning experiences. "

  if (venus && venus.house >= 5 && venus.house <= 7) {
    prediction += "Venus suggests a harmonious and loving relationship with your life partner. "
  }

  if (jupiter && jupiter.house === 7) {
    prediction += "Jupiter in the 7th house indicates a wise and supportive spouse. "
  }

  prediction += "Focus on communication, understanding, and mutual respect for a successful marriage."

  return prediction
}

function generateFinancePrediction(planets: PlanetPosition[]): string {
  const jupiter = planets.find((p) => p.name === "Jupiter")
  const venus = planets.find((p) => p.name === "Venus")
  const mercury = planets.find((p) => p.name === "Mercury")

  let prediction = "Your financial situation will improve through careful planning and wise investments. "

  if (jupiter && (jupiter.house === 2 || jupiter.house === 11)) {
    prediction += "Jupiter's position indicates good earning potential and financial growth. "
  }

  if (venus && venus.house <= 4) {
    prediction += "Venus suggests gains through luxury goods, arts, or beauty-related businesses. "
  }

  if (mercury && mercury.house >= 10) {
    prediction += "Mercury indicates success in business and communication-related ventures. "
  }

  prediction += "Avoid speculation and focus on steady, long-term financial planning."

  return prediction
}
