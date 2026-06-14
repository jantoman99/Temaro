# DESIGN.md - Temaro

This file is the visual contract for AI-assisted UI work in Temaro. Read it before changing marketing, booking, dashboard, or demo UI. If this conflicts with an older design note, this file wins for visual direction.

## 1. Product And Audience

Temaro is a Czech multi-tenant booking SaaS for local service businesses: salons, barbers, beauty, massage, wellness, trainers, and other businesses that sell time.

The buyer is usually an owner/operator, not a software enthusiast. They need to quickly understand:

- Will this reduce calls and message chaos?
- Will clients understand booking without help?
- Will the calendar protect revenue and no-show risk?
- Does this look trustworthy enough for my clients?

The interface must feel like a premium salon platform: visual, calm, direct, and commercially trustworthy. It must not feel like a generic Linear/Vercel clone, a sterile dashboard template, a dark command center, or a lifestyle salon brochure with no product truth.

## 2. Creative Direction

Name: Fresha-like Premium Salon Platform.

Promise: The business owner sees booking, calendar, client context, deposits, and source channels in one beautiful salon operating surface.

Signature move: A full-width hero with a large editorial headline, a direct product object across the page, and a short strip of salon imagery that makes the product feel real without using website screenshots.

Visual intensity: Premium, warm, spacious, and colorful. Use fewer words, larger surfaces, and sharper visual proof.

Reference direction:

- Fresha-like first impression: large simple claim, direct business software preview, minimal text, service-business imagery, high trust.
- Temaro must stay Czech, concrete, and honest: no fake testimonials, no fake customer logos, no invented scale metrics.
- The first 5 seconds matter more than explaining every feature.

## 3. Color System

Use color in large, intentional surfaces. The page must not become pale porcelain cards with small cobalt accents.

Core neutrals:

- Ink: `#171A21` for high-contrast text and dark command surfaces.
- Porcelain: `#F6F4EF` for calm page background only.
- Deep porcelain: `#EDEAE2` for section breaks.
- White: `#FFFFFF` for focused product panels.

Brand/action:

- Cobalt: `#2B3FF2` for primary CTA, selected state, active nav, and one key product signal.
- Cobalt deep: `#1F2FC4` for hover and high-contrast action.

Operational colors:

- Apricot: `#FFB98A` for pending, waiting, deposits, and attention.
- Mint: `#BFEAD4` for available slots, confirmed state, success, and safe actions.
- Signal red: `#E5484D` for risk and no-show only.
- Ink surface: `#171A21` or darker for command/product contrast.

Rules:

- Every screen or section needs one dominant color decision: dark command surface, apricot attention surface, mint availability surface, or cobalt action surface.
- Do not use cobalt as decoration everywhere. Cobalt is action and selection.
- Do not use status colors as brand decoration. Mint means available/success. Apricot means attention/pending. Red means risk.
- Avoid pale-on-pale combinations. If a section feels washed out, add a strong surface, not another border.

## 4. Typography

Fonts:

- Display: Bricolage Grotesque.
- Body/UI: Instrument Sans.
- Time/data labels: IBM Plex Mono.

Rules:

- Headlines should be short and forceful. Maximum 8-10 words where possible.
- Paragraphs on landing pages should be 1-2 lines. If a paragraph needs 4 lines, turn it into a visual product object.
- Use mono labels for time, status, sources, prices, and operational metadata.
- Avoid long explanatory cards. Prefer label + product object + one sentence.
- No filler uppercase labels such as "POWERFUL PLATFORM" or "NEXT GENERATION".

## 5. Layout Rhythm

Landing rhythm should alternate:

1. Full-screen premium hero with one strong product proof.
2. Service-business imagery and industry proof.
3. Dense product object or mini flow.
4. Short text/CTA.
5. Dark or colored contrast band.

Rules:

- Do not stack five pale card sections in a row.
- Do not use decorative background grids or dot patterns. They make Temaro look noisy and generic.
- No decorative grid background is visible.
- Do not add more cards to fix boring UI. Change scale, color, composition, or product proof.
- Use breakout sections. At least one major section per page should escape the standard white-card rhythm.
- Mobile must still sell the product, not merely stack desktop sections.

## 6. Product Proof

Use product-native visuals instead of screenshots when possible:

- Calendar day/week surface.
- Booking slot cards.
- Client memory card.
- SMS reminder sequence.
- Source channel strip: web, Instagram, QR, Google, widget.
- Revenue/deposit/no-show signal.
- Product columns that show real booking states such as Instagram source, team calendar, client card, SMS, and deposit.

Rules:

- Product proof must be interactive or feel alive: selected slot, active signal, changing status, progress through a flow.
- Do not use screenshots of the marketing website as product proof.
- Do not use screenshots of the product UI as a crutch when the source code can produce a cleaner code-native demo.
- Do not use fake testimonials, fake customer logos, or unverified scale metrics.
- Sample data must read as sample product data, not as real customer claims.

## 7. Imagery And Visual Assets

Temaro needs more visual material, but not generic stock imagery.

Allowed:

- Code-native product illustrations.
- Simple service-category visual cards with real functional labels.
- Abstract color panels tied to operational meaning.
- AI-generated or locally owned salon imagery when it supports service-business context and does not pretend to be a customer photo.
- Later: real pilot customer photos with permission.

Avoid:

- Random AI salon interiors that are not tied to the product composition.
- Lifestyle photos that do not explain booking.
- Screenshot galleries.
- Decorative dashboard mockups without product truth.

## 8. Motion

Motion must explain cause and effect.

Allowed:

- A booking slot becomes selected.
- A pending reservation gets confirmed.
- A SMS reminder is queued.
- A source channel feeds the calendar.
- A risky client signal appears.

Avoid:

- Decorative pulsing dots.
- Infinite background scanning.
- Moving gradients that do not explain workflow.
- Motion that steals attention from CTA or product proof.

Respect `prefers-reduced-motion`.

## 9. Components

Buttons:

- Primary CTA: cobalt filled, high contrast, rounded pill.
- Secondary CTA: white or porcelain with clear border, never competing with primary.
- Destructive/risk actions: red only when the action is truly destructive or risk-related.

Cards:

- Default cards are not enough for marketing.
- Use cards only when they contain a meaningful product object.
- Avoid identical cards with same border, radius, shadow, and density.

Calendar:

- Slot cards carry the hierarchy, not background grid lines.
- Time labels can stay, but decorative grids are forbidden.
- Booking status should be visible through left rail, surface tone, and label.

Booking:

- Public booking should feel like checkout, not a form.
- Always show service, time, price/deposit, and confirmation state clearly.

## 10. Content Rules

Cut before adding.

Landing copy should answer:

- What does it do?
- For whom?
- What operational pain disappears?
- What can I click next?

Replace feature paragraphs with concrete situations:

- "10:30 čeká na potvrzení"
- "16:00 volné okno z Instagramu"
- "Klient má 2 no-show"
- "SMS připomínka připravena"
- "Záloha 300 Kč uhrazena"

Forbidden content:

- Fake customer logos.
- Fake testimonials.
- "AI-powered" unless there is a concrete safe workflow.
- Long internal terms: MVP, tenant, self-service, booking flow.

## 11. Accessibility And Trust

- Contrast must be readable on mobile.
- Touch targets should be at least 44px.
- Color cannot be the only status indicator.
- Public booking and auth must feel calmer than marketing hero.
- No hidden important meaning on hover only.

## 12. AI Workflow For UI Changes

For every UX/UI change:

1. Read this `DESIGN.md`.
2. Capture current desktop and mobile screenshots.
3. Name the specific weakness: color, rhythm, proof, hierarchy, text, mobile, or trust.
4. Change one section or one component group at a time.
5. Capture screenshots after the change.
6. Use vision review against this checklist:
   - Is there one dominant visual idea?
   - Are there strong color surfaces?
   - Is text shorter than before?
   - Is product proof visible before long explanation?
   - Are there no decorative grids?
   - Does mobile still sell?
7. Run relevant tests and `npx impeccable detect app components`.
8. Update docs if the direction changes.

## 13. Anti-Patterns

Do not ship:

- Decorative background grids.
- Pale cards everywhere.
- Purple/cobalt glow as personality.
- Repeated rounded cards with only text.
- Website screenshots pretending to be product screenshots.
- Generic SaaS bento without hierarchy.
- Overlong paragraphs below every heading.
- Fake proof.
- Dark mode bias on public marketing pages.
- More visual tricks before the main product proof is clear.

## 14. 5/5 Landing Acceptance Bar

A landing iteration is not 5/5 unless:

- A visitor understands Temaro as booking software for service businesses within 5 seconds.
- The first product proof is visual, not textual.
- The page has at least three distinct visual temperatures: calm, command, and operational color.
- Mobile shows product proof before the page becomes a wall of copy.
- At least 30 percent of long marketing copy has been replaced by product objects.
- No decorative grid background is visible.
- No screenshot of the website is used as product proof.
- CTAs are obvious and repeated without becoming noisy.
- The page would be recognizable as Temaro without the logo.
