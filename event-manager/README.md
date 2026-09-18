# Marquee — Online Event Management System

A full front-end event booking platform built with plain HTML, CSS, and JavaScript — no frameworks, no backend, no build step. All data (users, events, bookings, feedback) lives in `localStorage`, acting as a lightweight client-side database.

## Live demo
Open `index.html` in a browser, or deploy the folder as-is to GitHub Pages.

**Demo admin login:** `admin@events.com` / `admin123`

## Modules

- **Login / Register** — tabbed auth form with client-side validation
- **Home page** — hero search, soon-closing events, category browse
- **Event listing** — search, category filter, sort by date/price/seats
- **Event details & booking** — ticket quantity selector, live total, seat-count enforcement
- **My bookings** — view and cancel bookings, seats are restored on cancel
- **Admin panel** — add / edit / delete events, view booking and feedback stats
- **Feedback form** — star rating + message, live feedback feed
- **Contact page** — validated contact form

## Concepts demonstrated

- Semantic HTML structure across 8 pages
- CSS Flexbox & Grid, custom properties, dark mode via `data-theme` attribute
- DOM manipulation and templating without a framework
- Event listeners for forms, modals, filters, and navigation
- `localStorage` as a persistence layer, shared across a small set of data modules (`Events`, `Users`, `Bookings`, `Feedback`, `Messages`)
- Client-side form validation (regex email checks, required fields, numeric ranges)
- Date handling: sorting by date, detecting past events, formatting for display

## Design

The visual identity is a "box office" theme — event cards are styled as literal ticket stubs, complete with a perforated divider and price/seat "stub" section, using a charcoal-and-brass palette with a condensed marquee display face (Bebas Neue) instead of a generic dashboard look.

## Project structure

```
event-manager/
├── index.html
├── login.html
├── events.html
├── event-details.html
├── my-bookings.html
├── admin.html
├── feedback.html
├── contact.html
├── css/
│   └── style.css
└── js/
    ├── data.js         # localStorage data layer (Events, Users, Bookings, Feedback, Messages, Session)
    ├── nav.js           # auth-aware nav, dark mode toggle, toast helper
    ├── render.js         # shared ticket-card template
    ├── home.js
    ├── auth.js
    ├── events.js
    ├── event-details.js
    ├── bookings.js
    ├── admin.js
    ├── feedback.js
    └── contact.js
```

## Notes

- This is a client-only demo: passwords are stored in plain text in `localStorage` and are **not** secure. Do not reuse real passwords when testing.
- Data is scoped to the browser you're using — clearing site data resets everything back to the seed events.

## License

MIT
