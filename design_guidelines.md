# Design Guidelines: ReelCutter AI - YouTube to Social Media Converter

## Design Approach
**Reference-Based Design** drawing inspiration from modern video editing SaaS platforms (CapCut, Descript, Runway) combined with conversion-focused landing page patterns (Linear, Vercel). The design emphasizes approachability, speed, and creative empowerment for social media content creators.

## Core Design Principles
1. **Instant Clarity**: Users understand the value proposition within 2 seconds
2. **Speed Perception**: Every interaction feels instantaneous through optimized micro-feedback
3. **Creator-Centric**: Interface designed for content creators who value aesthetics and efficiency
4. **Trust Through Polish**: Professional finish builds confidence in the tool's capability

---

## Typography System

**Font Stack**:
- Primary: Inter (Google Fonts) - UI elements, body text, forms
- Accent: Cal Sans or Archivo Black (Google Fonts) - Hero headlines, section titles

**Hierarchy**:
- Hero Headline: 3.5rem (56px) / Bold / Tight leading (1.1)
- Section Headers: 2.25rem (36px) / Bold
- Feature Titles: 1.25rem (20px) / Semibold
- Body Text: 1rem (16px) / Regular / Medium leading (1.6)
- UI Labels: 0.875rem (14px) / Medium
- Captions: 0.75rem (12px) / Regular

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16, 24** for consistency
- Micro spacing (buttons, inputs): 2, 4
- Component spacing: 6, 8
- Section padding: 12, 16, 24

**Grid Structure**:
- Container max-width: `max-w-7xl` (1280px)
- Content sections: `max-w-5xl` for readable width
- Multi-column grids: 2-3 columns max on desktop, always single on mobile

**Section Rhythm** (Landing Page):
- Hero: 90vh minimum, generous padding top/bottom
- Feature sections: py-20 desktop, py-12 mobile
- Testimonials/Social Proof: py-16
- Footer: py-12

---

## Landing Page Structure

### Hero Section (Full Impact)
- Background: Subtle animated gradient mesh or video preview grid
- Layout: Centered content with asymmetric supporting visuals
- Components:
  - Power headline emphasizing speed + results ("YouTube → Viral Reels in 30 Seconds")
  - Subheading with specific benefit ("No editing skills. No downloads. Just paste & go.")
  - Primary CTA: Large gradient button (h-14) "Try Free Now"
  - Social proof badge: "500K+ clips created" with trending indicator
  - Live demo preview or screenshot carousel below fold
  - Trust indicators: "No credit card • No signup • 100% free"

### Features Showcase (3-Column Grid)
- Icon + Title + Description cards with subtle hover lift effect
- Features to highlight:
  1. Auto-detect best moments
  2. One-click aspect ratio conversion (9:16, 1:1, 4:5, 16:9)
  3. Timeline precision editing
  4. Instant download/export
  5. SEO optimization for discoverability
  6. Unlimited usage

### How It Works (3-Step Visual Process)
- Large numbered steps (1→2→3) with connecting flow arrows
- Step cards with icon, action, and visual preview
- Emphasize simplicity: "Paste URL → Select Time → Download"

### Social Proof Section
- 2-column testimonial cards with creator photos
- Metrics showcase: "2M+ minutes downloaded" "50K+ creators" "4.9★ rating"
- Platform badges: YouTube, TikTok, Instagram, Shorts logos

### Use Cases Grid (2x2 Cards)
- Content creators, educators, marketers, podcasters
- Each with icon, headline, specific benefit

### FAQ Accordion
- 6-8 common questions addressing technical concerns, usage limits, quality

### Final CTA Section
- Bold headline: "Ready to go viral?"
- Gradient background with subtle pattern
- Oversized CTA button centered
- Secondary link: "See pricing" (even if free, builds credibility)

---

## Application Interface Design

### Main App Layout
**Header** (sticky):
- Logo left
- Navigation: "How it Works" "Examples" "FAQ"
- Theme toggle icon
- Primary CTA button right

**Editor Canvas** (centered card, max-w-4xl):
- Generous padding (p-8)
- Soft shadow and subtle border

**Input Section**:
- Large YouTube URL input with placeholder: "Paste any YouTube URL..."
- Auto-fetch: Shows video thumbnail + title immediately below input
- Visual feedback: Smooth expand animation when video detected

**Timeline Editor**:
- Visual representation of video duration as horizontal bar
- Draggable range selector with time stamps
- Dual time inputs (start/end) with format: HH:MM:SS
- Live duration calculator shows selected segment length

**Aspect Ratio Selector**:
- 4 large icon buttons in horizontal row
- Each shows visual representation: 9:16 (phone), 1:1 (square), 16:9 (desktop), 4:5 (portrait)
- Active state: gradient border
- Labels: "Reels/TikTok" "Instagram" "YouTube" "Facebook"

**Preview Window** (if video loaded):
- Aspect ratio preview box showing crop area
- Playback controls for segment review

**Action Buttons**:
- Primary: "Download Segment" - large gradient button (w-full, h-12)
- Progress indicator: Smooth progress bar with percentage during processing
- Success state: Confetti animation + download auto-starts

### Component Library

**Buttons**:
- Primary: Gradient background (purple-to-pink or blue-to-purple), white text, rounded-lg
- Secondary: Outline with gradient border, transparent background
- Sizes: sm (h-9), md (h-10), lg (h-12), xl (h-14)

**Inputs**:
- Border-2 with focus:ring effect
- Rounded-lg corners
- Generous padding (px-4, py-3)
- Monospace font for time inputs

**Cards**:
- Subtle background (opacity 95%)
- Soft shadow: shadow-xl
- Border: 1px subtle
- Rounded corners: rounded-xl (12px)

**Icons**:
- Library: Lucide React
- Size: Consistent 20-24px for UI elements, 32-48px for feature showcases
- Style: Outlined, not filled

**Progress Indicators**:
- Height: h-2 for subtle, h-3 for prominent
- Gradient fill matching brand colors
- Smooth animation (transition-all duration-300)

**Modals/Dialogs**:
- Backdrop blur effect
- Centered with max-width constraints
- Slide-up animation on entry

---

## Images & Visuals

### Hero Section
**Main Image**: Composite screenshot showing:
- Left: YouTube video interface
- Center: Arrow/transformation indicator
- Right: Vertical phone mockup showing Reels/TikTok interface
- Style: Modern, clean screenshots with subtle shadow depth

### Feature Section Icons
**Custom illustrations** (if possible) or high-quality Lucide icons representing:
- Scissors for cutting
- Crop tool for aspect ratio
- Clock for timeline
- Download cloud for export

### Testimonial Section
**Creator photos**: Circular avatars, 64x64px minimum
**Platform screenshots**: Real examples of viral content made with tool (with permission)

---

## Accessibility & Polish

- Maintain WCAG AA contrast ratios (4.5:1 minimum for text)
- Focus states: 3px gradient ring on all interactive elements
- Keyboard navigation: Logical tab order through form
- Loading states: Skeleton loaders for async content
- Error states: Red accent with helpful error messages
- Empty states: Friendly illustrations with clear CTAs
- Toast notifications: Bottom-right, auto-dismiss in 4s

---

## Animations (Minimal, Purposeful)

- Hero section: Subtle gradient shift on background (slow, 10s loop)
- Button hover: Scale 1.02 transform, 150ms
- Card hover: translateY(-4px), 200ms
- Progress bar: Smooth width transition
- Success state: One-time confetti burst
- NO scroll-triggered animations, NO parallax effects

---

**Brand Essence**: Fast, friendly, powerful - like having a professional video editor in your browser. Every detail reinforces speed and creative empowerment.