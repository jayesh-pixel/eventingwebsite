"""
Generates a formatted Project Synopsis `.docx` using python-docx.

Usage:
  1. Install dependency: pip install python-docx
  2. Run: python scripts/generate_synopsis.py
  3. Output: ./output/EventingWebsite_Synopsis.docx and ./output/EventingWebsite_Synopsis.txt

The generated Word document uses Bookman Old Style (if installed on your system),
1-inch margins, 1.5 line spacing, and starts page numbering from the Introduction page.
"""
from docx import Document
from docx.enum.section import WD_SECTION
from docx.shared import Inches, Pt
from docx.enum.text import WD_PARAGRAPH_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
import os

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'output')
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

doc = Document()

# Set default Normal style font to Bookman Old Style 12
style = doc.styles['Normal']
style.font.name = 'Bookman Old Style'
style.font.size = Pt(12)
# For some Word clients this is also required to ensure the rFonts are set
style.element.rPr.rFonts.set(qn('w:ascii'), 'Bookman Old Style')
style.element.rPr.rFonts.set(qn('w:hAnsi'), 'Bookman Old Style')

# Title / Cover page
title_para = doc.add_paragraph()
title_para.alignment = WD_PARAGRAPH_ALIGNMENT.CENTER
run = title_para.add_run('Project Synopsis')
run.bold = True
run.font.name = 'Bookman Old Style'
run.font.size = Pt(14)

doc.add_paragraph()

p = doc.add_paragraph()
p.alignment = WD_PARAGRAPH_ALIGNMENT.CENTER
p.add_run('On').bold = False
p.add_run('\n"TITLE OF PROJECT"').bold = True

doc.add_paragraph('\nSubmitted to Chhatrapati Shivaji Maharaj University, Panvel, Navi Mumbai')
doc.add_paragraph('for the partial fulfillment of requirement for the Degree of')
doc.add_paragraph('BACHELOR COMPUTER APPLICATION')

doc.add_paragraph('\nSubmitted By')
doc.add_paragraph('Student 1\nStudent 2\nStudent 3\nStudent 4')

doc.add_paragraph('\nGuide')
doc.add_paragraph('Prof. X.Y.Z')

doc.add_paragraph('\nDepartment of Computer Science & Information Technology')
doc.add_paragraph('Chhatrapati Shivaji Maharaj University, Panvel, Navi Mumbai')
doc.add_paragraph('2024-25')

# Ensure 1-inch margins for the first section
section = doc.sections[0]
section.left_margin = Inches(1)
section.right_margin = Inches(1)
section.top_margin = Inches(1)
section.bottom_margin = Inches(1)

# Add a section break (new section) so we can start page numbering from Introduction
new_section = doc.add_section(WD_SECTION.NEW_PAGE)
new_section.left_margin = Inches(1)
new_section.right_margin = Inches(1)
new_section.top_margin = Inches(1)
new_section.bottom_margin = Inches(1)

# Restart page numbering at 1 on this new section
sectPr = new_section._sectPr
pgNumType = OxmlElement('w:pgNumType')
pgNumType.set(qn('w:start'), '1')
sectPr.append(pgNumType)

# Add footer with page number for the new section
footer = new_section.footer
f_para = footer.paragraphs[0]
f_para.alignment = WD_PARAGRAPH_ALIGNMENT.CENTER
run = f_para.add_run()
# Insert PAGE field
fld = run._r.add_fldSimple('PAGE')

# Utility to add a heading (12pt bold Bookman Old Style)
def add_heading(text):
    p = doc.add_paragraph()
    r = p.add_run(text)
    r.bold = True
    r.font.name = 'Bookman Old Style'
    r.font.size = Pt(12)
    # ensure rFonts
    r._element.rPr.rFonts.set(qn('w:ascii'), 'Bookman Old Style')
    r._element.rPr.rFonts.set(qn('w:hAnsi'), 'Bookman Old Style')
    return p

# Utility to add normal paragraph with 1.5 line spacing
def add_paragraph(text):
    p = doc.add_paragraph()
    r = p.add_run(text)
    r.font.name = 'Bookman Old Style'
    r.font.size = Pt(12)
    r._element.rPr.rFonts.set(qn('w:ascii'), 'Bookman Old Style')
    r._element.rPr.rFonts.set(qn('w:hAnsi'), 'Bookman Old Style')
    p.paragraph_format.line_spacing = 1.5
    return p

# Contents (drafted to fit ~4 pages when styled)
add_heading('1. Introduction')
add_paragraph('This project develops "EventingWebsite", a responsive web platform that connects event organizers, venues, artists, and attendees. The site provides searchable event listings, artist profiles, venue information, booking and ticketing workflows, organizer tools, and secure payment handling. The platform focuses on usability, discoverability, and mobile-first design to simplify event management and increase attendance for local events.')

add_heading('2. Problem Definition')
add_paragraph('Market fragmentation and inconsistent booking experiences make it difficult for small organizers and local artists to reach audiences. Attendees encounter confusing booking flows and unclear fees, reducing conversions. Organizers lack integrated tools for listings, booking management, and secure payment reception without a technical burden. These issues lead to reduced ticket sales, inefficient marketing spend, and increased overhead for event production.')

add_heading('3. Aims & Objective')
add_paragraph('Primary aim: Build a production-ready event discovery and management website that improves discoverability and conversion for small-to-medium events. Objectives include: implement intuitive event search and category browsing; provide artist and venue profiles; create a smooth booking flow with clear costs and confirmations; integrate secure payment processing and reliable payment-response handling; add an organizer dashboard for event and booking management; ensure accessibility and mobile responsiveness; and follow security and privacy best practices.')

add_heading('4. Proposed Work')
add_paragraph('Frontend: Next.js with server-side rendering for SEO; responsive components for listings, artist and venue pages, booking summary, and checkout. Backend/API: REST or serverless endpoints for event CRUD, booking creation, payment webhook handling, and authentication. Payments: Integrate a payment gateway (e.g., Stripe) with server-side verification and dedicated success/failure pages. Store & State: Use a lightweight store (Redux or Context) for booking and auth state. Data & Search: Event schema with categories, dates, and capacity; searchable indices and filters. Testing & QA: Unit and E2E tests for booking/payment flows. Deployment: CI/CD hosting with monitoring and basic analytics.')

add_heading('5. Plan of Work')
add_paragraph('Phase 1 — Requirements & Design (Week 1): finalize features and wireframes. Phase 2 — Core Implementation (Weeks 2–5): frontend skeleton, backend endpoints, payment sandbox. Phase 3 — Features & Integrations (Weeks 6–8): profiles, search filters, organizer dashboard, auth. Phase 4 — Testing & Polishing (Weeks 9–10): tests, accessibility, responsive tuning. Phase 5 — Deployment & Handover (Week 11): production deploy, monitoring, documentation. Milestones: Prototype (end Week 3), Beta with payments (end Week 6), Release candidate (end Week 10), Production launch (end Week 11).')

add_heading('6. Conclusion')
add_paragraph('EventingWebsite simplifies event discovery and booking while empowering organizers with intuitive tools. By prioritizing clear UX, robust payment handling, and mobile-first design, the platform aims to increase event attendance and reduce organizer overhead. The phased plan balances delivery speed with testing and security to enable a reliable public launch.')

add_heading('7. References')
add_paragraph('1. Nielsen Norman Group — UX best practices.\n2. Stripe Integration Docs.\n3. WCAG 2.1 guidelines.\n4. OWASP Top 10.')

# Signature block on the last page
doc.add_page_break()
p = doc.add_paragraph()
p.paragraph_format.line_spacing = 1.5
p.add_run('\n\n\n\n')
# signature layout using tabs/spaces to visually position
sig = doc.add_paragraph()
sig.add_run('               Prof.X.Y.Z.                                                           Dr.Praveen Gupta\n')
sig.add_run('                  Guide.                                                                         H.O.D.\n')
sig.add_run('           CS/IT Department                                                  CS/IT Department')

# Save docx
out_path = os.path.join(OUTPUT_DIR, 'EventingWebsite_Synopsis.docx')
doc.save(out_path)

# Also produce a plain text version for quick copy/paste
text_out = os.path.join(OUTPUT_DIR, 'EventingWebsite_Synopsis.txt')
with open(text_out, 'w', encoding='utf-8') as f:
    f.write('Project Synopsis\n')
    f.write('On\n"TITLE OF PROJECT"\n\n')
    f.write('Submitted to Chhatrapati Shivaji Maharaj University, Panvel, Navi Mumbai\n')
    f.write('for the partial fulfillment of requirement for the Degree of\n')
    f.write('BACHELOR COMPUTER APPLICATION\n\n')
    f.write('Submitted By\nStudent 1\nStudent 2\nStudent 3\nStudent 4\n\n')
    f.write('Guide\nProf. X.Y.Z\n\n')
    f.write('Department of Computer Science & Information Technology\nChhatrapati Shivaji Maharaj University, Panvel, Navi Mumbai\n2024-25\n\n')
    f.write('1. Introduction\n')
    f.write('This project develops "EventingWebsite", a responsive web platform that connects event organizers, venues, artists, and attendees. The site provides searchable event listings, artist profiles, venue information, booking and ticketing workflows, organizer tools, and secure payment handling. The platform focuses on usability, discoverability, and mobile-first design to simplify event management and increase attendance for local events.\n\n')
    f.write('2. Problem Definition\n')
    f.write('Market fragmentation and inconsistent booking experiences make it difficult for small organizers and local artists to reach audiences. Attendees encounter confusing booking flows and unclear fees, reducing conversions. Organizers lack integrated tools for listings, booking management, and secure payment reception without a technical burden. These issues lead to reduced ticket sales, inefficient marketing spend, and increased overhead for event production.\n\n')
    f.write('3. Aims & Objective\n')
    f.write('Primary aim: Build a production-ready event discovery and management website that improves discoverability and conversion for small-to-medium events. Objectives include: implement intuitive event search and category browsing; provide artist and venue profiles; create a smooth booking flow with clear costs and confirmations; integrate secure payment processing and reliable payment-response handling; add an organizer dashboard for event and booking management; ensure accessibility and mobile responsiveness; and follow security and privacy best practices.\n\n')
    f.write('4. Proposed Work\n')
    f.write('Frontend: Next.js with server-side rendering for SEO; responsive components for listings, artist and venue pages, booking summary, and checkout. Backend/API: REST or serverless endpoints for event CRUD, booking creation, payment webhook handling, and authentication. Payments: Integrate a payment gateway (e.g., Stripe) with server-side verification and dedicated success/failure pages. Store & State: Use a lightweight store (Redux or Context) for booking and auth state. Data & Search: Event schema with categories, dates, and capacity; searchable indices and filters. Testing & QA: Unit and E2E tests for booking/payment flows. Deployment: CI/CD hosting with monitoring and basic analytics.\n\n')
    f.write('5. Plan of Work\n')
    f.write('Phase 1 — Requirements & Design (Week 1): finalize features and wireframes. Phase 2 — Core Implementation (Weeks 2–5): frontend skeleton, backend endpoints, payment sandbox. Phase 3 — Features & Integrations (Weeks 6–8): profiles, search filters, organizer dashboard, auth. Phase 4 — Testing & Polishing (Weeks 9–10): tests, accessibility, responsive tuning. Phase 5 — Deployment & Handover (Week 11): production deploy, monitoring, documentation.\n\n')
    f.write('6. Conclusion\n')
    f.write('EventingWebsite simplifies event discovery and booking while empowering organizers with intuitive tools. By prioritizing clear UX, robust payment handling, and mobile-first design, the platform aims to increase event attendance and reduce organizer overhead. The phased plan balances delivery speed with testing and security to enable a reliable public launch.\n\n')
    f.write('7. References\n1. Nielsen Norman Group — UX best practices.\n2. Stripe Integration Docs.\n3. WCAG 2.1 guidelines.\n4. OWASP Top 10.\n\n')
    f.write('\n\n')
    f.write('               Prof.X.Y.Z.                                                           Dr.Praveen Gupta\n')
    f.write('                  Guide.                                                                         H.O.D.\n')
    f.write('           CS/IT Department                                                  CS/IT Department\n')

print('Generated:')
print(' -', out_path)
print(' -', text_out)
print('\nTo produce the .docx run: pip install python-docx && python scripts/generate_synopsis.py')
