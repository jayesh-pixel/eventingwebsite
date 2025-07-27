import jsPDF from "jspdf"
import type { AstrologyData, BirthDetails } from "./astro-calculations"

export async function generateKundliPDF(birthDetails: BirthDetails, astrologyData: AstrologyData) {
  const pdf = new jsPDF("p", "mm", "a4")
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  // Set up fonts and colors
  pdf.setFont("helvetica")

  // Page 1: Title and Basic Details
  generateTitlePage(pdf, birthDetails, astrologyData)

  // Page 2: Charts
  pdf.addPage()
  generateChartsPage(pdf, astrologyData)

  // Page 3: Planetary Positions
  pdf.addPage()
  generatePlanetaryPositionsPage(pdf, astrologyData)

  // Page 4: Dasha Periods
  pdf.addPage()
  generateDashaPage(pdf, astrologyData)

  // Page 5: Predictions
  pdf.addPage()
  generatePredictionsPage(pdf, astrologyData)

  // Save the PDF
  pdf.save(`${birthDetails.name.replace(/\s+/g, "_")}_Kundli.pdf`)
}

function generateTitlePage(pdf: jsPDF, birthDetails: BirthDetails, astrologyData: AstrologyData) {
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  // Header
  pdf.setFontSize(24)
  pdf.setTextColor(128, 0, 128) // Purple
  pdf.text("VEDIC ASTROLOGY KUNDLI", pageWidth / 2, 30, { align: "center" })

  pdf.setFontSize(16)
  pdf.setTextColor(0, 0, 0)
  pdf.text(`${birthDetails.name}`, pageWidth / 2, 45, { align: "center" })

  // Birth Details Box
  pdf.setDrawColor(128, 0, 128)
  pdf.setLineWidth(0.5)
  pdf.rect(20, 60, pageWidth - 40, 80)

  pdf.setFontSize(14)
  pdf.setTextColor(128, 0, 128)
  pdf.text("BIRTH DETAILS", pageWidth / 2, 75, { align: "center" })

  pdf.setFontSize(11)
  pdf.setTextColor(0, 0, 0)

  const details = [
    `Name: ${birthDetails.name}`,
    `Date of Birth: ${new Date(birthDetails.date).toLocaleDateString("en-GB")}`,
    `Time of Birth: ${birthDetails.time}`,
    `Place of Birth: ${birthDetails.place}`,
    `Latitude: ${birthDetails.latitude.toFixed(4)}°`,
    `Longitude: ${birthDetails.longitude.toFixed(4)}°`,
    `Timezone: ${birthDetails.timezone} hours`,
    `Julian Day: ${astrologyData.julianDay.toFixed(2)}`,
    `Ayanamsa: ${astrologyData.ayanamsa.toFixed(2)}°`,
    `Ascendant: ${Math.floor(astrologyData.ascendant / 30) + 1} (${["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"][Math.floor(astrologyData.ascendant / 30)]})`,
  ]

  let yPos = 90
  details.forEach((detail) => {
    pdf.text(detail, 30, yPos)
    yPos += 8
  })

  // Current Dasha
  pdf.setFontSize(14)
  pdf.setTextColor(128, 0, 128)
  pdf.text("CURRENT DASHA", pageWidth / 2, 170, { align: "center" })

  pdf.setFontSize(11)
  pdf.setTextColor(0, 0, 0)
  pdf.text(`Current Mahadasha: ${astrologyData.dasha.current}`, 30, 185)
  pdf.text(`Balance: ${astrologyData.dasha.balance}`, 30, 195)

  // Footer
  pdf.setFontSize(8)
  pdf.setTextColor(128, 128, 128)
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 10, { align: "center" })
}

function generateChartsPage(pdf: jsPDF, astrologyData: AstrologyData) {
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  // Header
  pdf.setFontSize(18)
  pdf.setTextColor(128, 0, 128)
  pdf.text("BIRTH CHARTS", pageWidth / 2, 25, { align: "center" })

  // Lagna Chart
  pdf.setFontSize(14)
  pdf.setTextColor(0, 0, 0)
  pdf.text("Lagna Chart (D-1)", 30, 45)

  drawVedicChart(pdf, 30, 55, astrologyData.planets, astrologyData.ascendant, "lagna")

  // Navamsa Chart
  pdf.text("Navamsa Chart (D-9)", 120, 45)
  drawVedicChart(pdf, 120, 55, astrologyData.planets, astrologyData.ascendant, "navamsa")

  // Chart Legend
  pdf.setFontSize(10)
  pdf.text("Planet Abbreviations:", 30, 180)

  const abbreviations = [
    "Su = Sun, Mo = Moon, Ma = Mars, Me = Mercury",
    "Ju = Jupiter, Ve = Venus, Sa = Saturn",
    "Ra = Rahu, Ke = Ketu",
  ]

  let yPos = 190
  abbreviations.forEach((abbr) => {
    pdf.text(abbr, 30, yPos)
    yPos += 8
  })
}

function drawVedicChart(pdf: jsPDF, x: number, y: number, planets: any[], ascendant: number, chartType: string) {
  const size = 80

  // Draw the square chart
  pdf.setDrawColor(0, 0, 0)
  pdf.setLineWidth(0.3)

  // Outer square
  pdf.rect(x, y, size, size)

  // Inner divisions for North Indian style chart
  // Diagonal lines
  pdf.line(x, y, x + size, y + size)
  pdf.line(x + size, y, x, y + size)

  // Middle lines
  pdf.line(x + size / 2, y, x + size / 2, y + size)
  pdf.line(x, y + size / 2, x + size, y + size / 2)

  // House numbers (North Indian style)
  const housePositions = [
    { x: x + size / 2 + 5, y: y + 10 }, // House 1 (top center)
    { x: x + size - 15, y: y + 15 }, // House 2 (top right)
    { x: x + size - 10, y: y + size / 2 }, // House 3 (right center)
    { x: x + size - 15, y: y + size - 5 }, // House 4 (bottom right)
    { x: x + size / 2 + 5, y: y + size - 5 }, // House 5 (bottom center)
    { x: x + 15, y: y + size - 5 }, // House 6 (bottom left)
    { x: x + 5, y: y + size / 2 }, // House 7 (left center)
    { x: x + 15, y: y + 15 }, // House 8 (top left)
    { x: x + 25, y: y + 25 }, // House 9
    { x: x + size - 25, y: y + 25 }, // House 10
    { x: x + size - 25, y: y + size - 25 }, // House 11
    { x: x + 25, y: y + size - 25 }, // House 12
  ]

  // Place planets in houses
  pdf.setFontSize(8)
  planets.forEach((planet) => {
    const houseIndex = planet.house - 1
    if (houseIndex >= 0 && houseIndex < 12) {
      const pos = housePositions[houseIndex]
      const abbr = getPlanetAbbreviation(planet.name)
      pdf.text(abbr, pos.x, pos.y)
    }
  })

  // House numbers
  pdf.setFontSize(6)
  pdf.setTextColor(128, 128, 128)
  housePositions.forEach((pos, index) => {
    pdf.text((index + 1).toString(), pos.x - 8, pos.y - 3)
  })

  pdf.setTextColor(0, 0, 0)
}

function getPlanetAbbreviation(planetName: string): string {
  const abbreviations: Record<string, string> = {
    Sun: "Su",
    Moon: "Mo",
    Mars: "Ma",
    Mercury: "Me",
    Jupiter: "Ju",
    Venus: "Ve",
    Saturn: "Sa",
    Rahu: "Ra",
    Ketu: "Ke",
  }
  return abbreviations[planetName] || planetName.substring(0, 2)
}

function generatePlanetaryPositionsPage(pdf: jsPDF, astrologyData: AstrologyData) {
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  // Header
  pdf.setFontSize(18)
  pdf.setTextColor(128, 0, 128)
  pdf.text("PLANETARY POSITIONS", pageWidth / 2, 25, { align: "center" })

  // Table header
  pdf.setFontSize(10)
  pdf.setTextColor(0, 0, 0)

  const headers = ["Planet", "Sign", "Degree", "House", "Nakshatra", "Pada"]
  const colWidths = [25, 25, 20, 15, 30, 15]
  let xPos = 20

  pdf.setFont("helvetica", "bold")
  headers.forEach((header, index) => {
    pdf.text(header, xPos, 45)
    xPos += colWidths[index]
  })

  // Draw line under header
  pdf.setLineWidth(0.3)
  pdf.line(20, 48, pageWidth - 20, 48)

  // Planet data
  pdf.setFont("helvetica", "normal")
  let yPos = 58

  astrologyData.planets.forEach((planet) => {
    xPos = 20
    const data = [
      planet.name,
      planet.sign,
      `${planet.degree.toFixed(2)}°`,
      planet.house.toString(),
      planet.nakshatra,
      planet.pada.toString(),
    ]

    data.forEach((item, index) => {
      pdf.text(item, xPos, yPos)
      xPos += colWidths[index]
    })

    yPos += 8
  })

  // Additional information
  pdf.setFontSize(12)
  pdf.setTextColor(128, 0, 128)
  pdf.text("HOUSE CUSPS", 20, yPos + 20)

  pdf.setFontSize(10)
  pdf.setTextColor(0, 0, 0)
  yPos += 35

  astrologyData.houses.forEach((cusp, index) => {
    const sign = Math.floor(cusp / 30)
    const degree = cusp % 30
    const signName = [
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
    ][sign]

    pdf.text(`House ${index + 1}: ${signName} ${degree.toFixed(2)}°`, 20, yPos)
    yPos += 8

    if (yPos > pageHeight - 30) {
      pdf.addPage()
      yPos = 30
    }
  })
}

function generateDashaPage(pdf: jsPDF, astrologyData: AstrologyData) {
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  // Header
  pdf.setFontSize(18)
  pdf.setTextColor(128, 0, 128)
  pdf.text("VIMSHOTTARI DASHA", pageWidth / 2, 25, { align: "center" })

  // Current Dasha
  pdf.setFontSize(14)
  pdf.setTextColor(0, 0, 0)
  pdf.text(`Current Mahadasha: ${astrologyData.dasha.current}`, 20, 45)
  pdf.text(`Balance: ${astrologyData.dasha.balance}`, 20, 58)

  // Dasha periods table
  pdf.setFontSize(12)
  pdf.setTextColor(128, 0, 128)
  pdf.text("DASHA PERIODS", 20, 80)

  pdf.setFontSize(10)
  pdf.setTextColor(0, 0, 0)
  pdf.setFont("helvetica", "bold")

  const headers = ["Planet", "Start Date", "End Date"]
  const colWidths = [40, 50, 50]
  let xPos = 20

  headers.forEach((header, index) => {
    pdf.text(header, xPos, 95)
    xPos += colWidths[index]
  })

  pdf.setLineWidth(0.3)
  pdf.line(20, 98, pageWidth - 20, 98)

  pdf.setFont("helvetica", "normal")
  let yPos = 108

  astrologyData.dasha.periods.forEach((period) => {
    xPos = 20
    const data = [period.planet, period.start, period.end]

    data.forEach((item, index) => {
      pdf.text(item, xPos, yPos)
      xPos += colWidths[index]
    })

    yPos += 10
  })

  // Dasha explanation
  pdf.setFontSize(12)
  pdf.setTextColor(128, 0, 128)
  pdf.text("ABOUT VIMSHOTTARI DASHA", 20, yPos + 20)

  pdf.setFontSize(10)
  pdf.setTextColor(0, 0, 0)

  const explanation = [
    "Vimshottari Dasha is the most popular dasha system in Vedic astrology.",
    "It divides human life into periods ruled by different planets.",
    "Each planet has a specific duration of influence:",
    "• Sun: 6 years  • Moon: 10 years  • Mars: 7 years",
    "• Rahu: 18 years  • Jupiter: 16 years  • Saturn: 19 years",
    "• Mercury: 17 years  • Ketu: 7 years  • Venus: 20 years",
    "",
    "The current dasha period influences your life experiences,",
    "opportunities, and challenges during that time.",
  ]

  yPos += 35
  explanation.forEach((line) => {
    pdf.text(line, 20, yPos)
    yPos += 8
  })
}

function generatePredictionsPage(pdf: jsPDF, astrologyData: AstrologyData) {
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  // Header
  pdf.setFontSize(18)
  pdf.setTextColor(128, 0, 128)
  pdf.text("ASTROLOGICAL PREDICTIONS", pageWidth / 2, 25, { align: "center" })

  let yPos = 45

  const sections = [
    { title: "CHARACTER & PERSONALITY", content: astrologyData.predictions.character },
    { title: "CAREER & PROFESSION", content: astrologyData.predictions.career },
    { title: "HEALTH & WELLNESS", content: astrologyData.predictions.health },
    { title: "MARRIAGE & RELATIONSHIPS", content: astrologyData.predictions.marriage },
    { title: "FINANCE & WEALTH", content: astrologyData.predictions.finance },
  ]

  sections.forEach((section) => {
    // Section title
    pdf.setFontSize(12)
    pdf.setTextColor(128, 0, 128)
    pdf.text(section.title, 20, yPos)
    yPos += 10

    // Section content
    pdf.setFontSize(10)
    pdf.setTextColor(0, 0, 0)

    const lines = pdf.splitTextToSize(section.content, pageWidth - 40)
    lines.forEach((line: string) => {
      if (yPos > pageHeight - 30) {
        pdf.addPage()
        yPos = 30
      }
      pdf.text(line, 20, yPos)
      yPos += 6
    })

    yPos += 10
  })

  // Disclaimer
  pdf.setFontSize(8)
  pdf.setTextColor(128, 128, 128)

  const disclaimer = [
    "DISCLAIMER:",
    "These predictions are based on Vedic astrology principles and should be used for guidance only.",
    "Individual results may vary. Consult a qualified astrologer for detailed analysis.",
    "This report is generated using simplified calculations and may not reflect all astrological nuances.",
  ]

  yPos += 20
  disclaimer.forEach((line) => {
    if (yPos > pageHeight - 20) {
      pdf.addPage()
      yPos = 30
    }
    pdf.text(line, 20, yPos)
    yPos += 5
  })
}
