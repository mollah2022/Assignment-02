# AIBR — All-Inclusive Beach Resorts

A responsive hotel resort listing and detail page built with vanilla HTML, CSS, and JavaScript. The frontend is served by a lightweight Express.js backend, and the app uses static JSON data for nearby property listings.

---

## Project Structure

```
/ (project root)
├── Readme.MD
├── backend
│   ├── package.json
│   ├── routes.js
│   ├── server.js
│   ├── public
│   │   └── image/
│   └── data
│       ├── highest_price.json
│       ├── lowest_price.json
│       └── most_popular.json
└── frontend
    ├── public
    │   ├── css
    │   │   └── style.css
    │   ├── image
    │   └── js
    │       ├── config.js
    │       └── modules
    │           ├── calendar.js
    │           ├── description.js
    │           ├── gallery.js
    │           └── nearbyProperties.js
    └── view
        └── index.html
```

---

## Overview

This project demonstrates a modern resort details page without a frontend framework.

Key experiences included:

- hotel overview layout and site navigation
- responsive image modal with grid and swipe slider
- interactive check-in/check-out calendar widget
- dynamic nearby property listing with sort and responsive limits
- favorites persistence via `localStorage`
- Google Maps marker integration

---

## Tech Stack

- Node.js
- Express.js
- Vanilla JavaScript
- HTML5 / CSS3
- `dotenv` for environment configuration

---

## Features

- `backend/server.js` launches an Express server on port `3000`
- `backend/routes.js` handles:
  - main `GET /` route for `frontend/view/index.html`
  - `GET /images` gallery image API
  - `GET /get-property` property list API
  - `GET /config` runtime configuration API
- `frontend/public/js/config.js` fetches `GOOGLE_MAPS_API_KEY` from `/config`
- `frontend/public/js/modules/calendar.js` provides a custom date picker
- `frontend/public/js/modules/gallery.js` opens a modal gallery and supports mobile swipe navigation
- `frontend/public/js/modules/nearbyProperties.js` loads property cards, binds favorites, and places Google Maps markers
- `frontend/public/js/modules/description.js` toggles the description expand/collapse state

---

## Setup

### Requirements

- Node.js (recommended v18+)
- npm

### Install

```bash
cd backend
npm install
```

### Run

```bash
cd backend
node server.js
```

Open the app:

```text
http://localhost:3000
```

---

## Environment Variables

The backend supports optional runtime configuration using a `.env` file.

A sample configuration is provided in `backend/.env.example`.

Create `backend/.env` with:

```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
PORT=3000
NODE_ENV=development
```

If `GOOGLE_MAPS_API_KEY` is missing, the app will still load but map features may fail.

---

## API Endpoints

### `GET /`

Serves the frontend HTML entrypoint from `frontend/view/index.html`.

### `GET /images`

Returns a JSON payload containing a list of image URLs used by the image gallery.

Example response:

```json
{
  "images": [
    "http://localhost:3000/image/1.jpg",
    "http://localhost:3000/image/2.jpg",
    ...
  ]
}
```

### `GET /get-property?sort={sort}&limit={limit}`

Loads property data from one of three JSON files in `backend/data/`.

Query parameters:

- `sort`: `most_popular`, `highest_price`, or `lowest_price`
- `limit`: number of items to return (default `6`)

Returns:

```json
{
  "items": [ ... ],
  "success": true,
  "sort": "most_popular",
  "limit": 6,
  "count": 6
}
```

### `GET /config`

Returns frontend configuration values such as the loaded Google Maps API key.

Example response:

```json
{
  "success": true,
  "googleMapsApiKey": "...",
  "environment": "development"
}
```

---

## How the App Works

- `index.html` loads styles from `frontend/public/css/style.css` and scripts from `frontend/public/js/`
- `config.js` fetches `/config` and exposes `window.GOOGLE_MAPS_API_KEY`
- `calendar.js` controls the date selection UI and total price calculation
- `gallery.js` fetches `/images` and manages modal open/close, desktop grid, and mobile swipe slider
- `nearbyProperties.js` fetches `/get-property`, renders cards, stores favorites, and creates Google Maps markers
- `description.js` toggles long-form resort description content

---

## Notes

- There is no build step; static files are served directly from the Express backend.
- The backend is intentionally simple and relies on local JSON files rather than a database.
- `localStorage` preserves favorite property selections across page reloads.
- The map uses Google Maps JS API and requires a valid API key for full functionality.

---

## Recommended Improvements

- add `npm start` script to `backend/package.json`
- validate query parameter values for `/get-property`
- implement graceful frontend fallback when Google Maps fails

---

## License

This project is provided for learning and demonstration purposes.
