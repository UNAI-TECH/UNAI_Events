# UNAI Events — Premier Live Experiences & Luxury Shows Website

A luxury theater and live events static website built with **React**, **Vite**, and **Vanilla CSS Modules**. Designed with a refined **White background and Deep Navy Blue (`#0A1F44`) theme**, inspired by world-class grand auditoriums. Features direct **BookMyShow** ticketing integration, event modals, responsive layouts for all devices, and readiness for **Supabase backend dynamic updates** and **Vercel deployment**.

---

## 🌟 Key Features

- **Luxury Theater Aesthetic**: Crafted with classic typography (*Playfair Display*, *Cinzel*, and *Plus Jakarta Sans*), perforated ticket stubs, and clean white & deep navy palette.
- **Hero Stage Carousel**: Interactive event stage carousel showcasing featured headliners with smooth controls, date tags, and ticket notches.
- **Featured Upcoming Events**: Full listing matching the reference design layout with date stamp boxes, time pills, category badges, BookMyShow buttons, and ticket photos.
- **Interactive Event Calendar**: Date selector strip and day-by-day show schedule finder.
- **Detailed Event Modal**: Quick-view modal with seat tiers, duration, language, age ratings, highlights, and direct BookMyShow redirection.
- **Multi-Page Experience**: Includes **Home**, **About UNAI Events**, and **Contact & Venue** pages.
- **Fully Responsive**: Pixel-perfect adaptation across mobile, tablet, laptop, and ultra-wide desktop viewports.
- **Supabase-Ready**: Modular `useEvents` hook and `supabaseClient.js` ready for plug-and-play database connectivity.
- **Vercel-Ready**: Includes `vercel.json` rewrite rules for seamless Single Page Application (SPA) routing.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone or open the project folder
cd UNAI_Events

# Install dependencies
npm install

# Run the development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 🛠️ Build & Verification

```bash
# Create an optimized production build
npm run build

# Preview the production build locally
npm run preview
```

---

## 🎟️ Updating Events & BookMyShow URLs

All event data is managed in [`src/data/events.json`](src/data/events.json). To update an event or its BookMyShow booking link:

```json
{
  "id": "unai-001",
  "title": "William Smith Comedy Show",
  "subtitle": "Crack a Smile — 2026 World Tour",
  "category": "Comedy",
  "date": "2026-08-27",
  "display_date": {
    "month": "AUG",
    "day": "27",
    "time": "7:00 PM",
    "year": "2026"
  },
  "venue": "Royal Opera Auditorium, City Center",
  "city": "Mumbai",
  "price_starting": "₹499",
  "image_url": "https://images.unsplash.com/...",
  "bookmyshow_url": "https://in.bookmyshow.com/events/your-event-slug/ET00XXXXX",
  "featured": true,
  "hero_spotlight": true
}
```

---

## ⚡ Connecting to Supabase (Future Backend & Admin Dashboard)

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Create an `events` table with columns matching the fields in `src/data/events.json`.
3. Create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. The application will automatically detect the credentials in [`src/utils/supabaseClient.js`](src/utils/supabaseClient.js) and fetch live updates from your Supabase database!

---

## ☁️ Deploying to Vercel

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Go to [Vercel Dashboard](https://vercel.com) and click **"Add New Project"**.
3. Import your `UNAI_Events` repository.
4. Framework Preset will auto-detect as **Vite**.
5. Click **"Deploy"**.

The included `vercel.json` ensures all client-side routes (`/`, `/about`, `/contact`) work correctly without 404 errors.

---

## 📄 License & Credits
© UNAI Events. All rights reserved. Ticketing processed via BookMyShow.