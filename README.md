# CSB Bistro • Sport Bar — Website

A bespoke, agency-level website for **CSB Bistro • Sport Bar**. Built with hand-crafted HTML, CSS, and vanilla JavaScript. No templates. No frameworks. Fully responsive, performant, and easy to maintain.

---

## What's Included

| File / Folder | Purpose |
|---------------|---------|
| `index.html` | Homepage with hero, featured experience, happy hour, about preview, and reservation CTA |
| `menu.html` | Full interactive menu with tabs for Food, Drinks, and Happy Hour |
| `about.html` | Brand story, history, timeline, and values |
| `gallery.html` | Filterable masonry gallery for venue, food, drinks, and events |
| `contact.html` | Reservation form, contact details, hours, and embedded map |
| `css/styles.css` | Complete design system, layout, animations, and responsive rules |
| `js/main.js` | Navigation, scroll reveals, menu tabs, form handling, smooth scroll |
| `assets/` | Provided menu images (`happy-hour.png`, `menu-food.png`, `menu-drinks.png`) |
| `images/` | Empty folder for your own venue/food/event photos |

---

## Quick Start

1. Open `index.html` in a browser to view the site locally.
2. To publish, upload the entire `csb-bistro-website` folder to any static host (Netlify, Vercel, GitHub Pages, traditional web hosting, etc.).

---

## Required Customisations

The following placeholders must be replaced with the business's real information before launch.

### 1. Business Address & Contact Details

The following have already been updated across the site:

- **Address**: 1033 Granville St, Vancouver, BC
- **Phone**: (604) 828-3165

Still to confirm/update:

- **Email**: Replace `hello@csbbistro.com` with the real business email
- **Hours**: Adjust if different from the current placeholder hours

### 2. Google Maps Embed

The map in `contact.html` currently points to `1033 Granville Street Vancouver BC` via a generic embed. For a polished, branded map, replace it with an official embed from the Google Business listing:

1. Go to [Google Maps](https://maps.google.com).
2. Search for **CSB Bistro Sport Bar**.
3. Click **Share** → **Embed a map**.
4. Copy the HTML iframe code.
5. Replace the existing `<iframe>` in `contact.html`.

### 3. Social Media Links

Replace all `#` placeholders for Instagram and Facebook with real URLs:

- `index.html` (footer)
- `about.html` (footer)
- `menu.html` (footer)
- `gallery.html` (footer)
- `contact.html` (contact info card)

Search for `href="#"` near `aria-label="Instagram"` and `aria-label="Facebook"`.

### 4. About Page History

The About page contains a generic note about the space previously being a "beloved local pub." Replace this with the actual prior business name and history once confirmed from the Google Business profile or owner.

### 5. Gallery Images

Nine provided photos have already been added to `/images` and wired into `gallery.html`, `index.html`, and `about.html`.

To swap or add more photos:

1. Add new images to the `/images` folder.
2. Update the `src` paths in `gallery.html`, `index.html`, or `about.html`.
3. Update the `alt` text and captions (`gallery-item-title` and `gallery-item-meta`) as needed.

### 6. Reservation Form Backend

The contact form currently shows a success message but does not actually submit anywhere. To make it functional, connect it to:

- A form backend service like [Formspree](https://formspree.io), [Netlify Forms](https://docs.netlify.com/forms/setup/), or [Getform](https://getform.io)
- Your own server endpoint
- An email service API

Update the `<form>` tag's `action` attribute and method accordingly.

---

## Design System

### Colour Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0a0a0a` | Page background |
| `--bg-secondary` | `#111111` | Cards and surfaces |
| `--text-primary` | `#f6f3ed` | Headings and primary text |
| `--text-secondary` | `#a9a59c` | Body text and descriptions |
| `--gold` | `#c9a962` | Accent colour, prices, CTAs |
| `--gold-soft` | `#d4b978` | Hover states |

### Typography

- **Display / Headings**: [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) (elegant serif, matching the logo aesthetic)
- **Body / UI**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (clean, modern sans-serif)

### Key Features

- Floating glass pill navigation
- Custom cubic-bezier motion curves
- Scroll-triggered reveal animations via IntersectionObserver
- Mobile-first responsive design
- Double-bezel card architecture for premium depth
- Filterable gallery
- Interactive menu tabs
- Subtle animated grain overlay

---

## Browser Support

- Chrome / Edge (latest)
- Safari (latest)
- Firefox (latest)
- Mobile browsers (iOS Safari, Chrome for Android)

---

## Notes

- The site uses Google Fonts loaded from `fonts.googleapis.com`. An internet connection is required for the fonts to load on first view.
- All animations use GPU-safe `transform` and `opacity` only.
- `backdrop-filter` is applied only to the fixed navigation and mobile menu overlay for performance.
- No cookies, trackers, or third-party scripts beyond Google Fonts and the optional Google Maps embed.

---

## Credits

Design and build by Kimi Code for CSB Bistro • Sport Bar.
