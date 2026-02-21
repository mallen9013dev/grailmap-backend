# GrailMap Backend

Fastify API that powers location search + Google Maps directions link generation for GrailMap.

## Prereqs

- Node.js (recommended: 18+)
- A Google Maps API key with the required APIs enabled (Geocoding + Places)

## Setup

```bash
cd backend
npm install
cp .env.example .env
```

Update `.env` with your values (especially `GOOGLE_MAPS_API_KEY`).

## Run

```bash
# dev (nodemon)
npm run dev

# production
npm start
```

Server listens on `PORT` (default `3000`) and binds to `0.0.0.0`.

## Environment variables

See `backend/.env.example`.

- `NODE_ENV`: `development` | `production` | `test`
- `PORT`: server port (default: `3000`)
- `LOGGER_LEVEL`: `trace` | `debug` | `info` | `warn` | `error` | `fatal`
- `FRONTEND_URL`: allowed origin for CORS (e.g. `http://localhost:9200`)
- `FRONTEND_URL_LAN` (optional): additional allowed CORS origin (LAN IP)
- `GOOGLE_MAPS_API_KEY`: Google API key used for Geocoding + Places requests

## API

All routes are registered at the root (no prefix).

### `GET /search-options`

Returns the supported search option list (`id`, `label`) used by the frontend.

```bash
curl -s http://localhost:3000/search-options | jq
```

### `POST /search`

Searches for places near an origin using a `searchOptionId`.

Body accepts either an origin `query` (forward geocode) or `coords` (reverse geocode):

```bash
curl -s http://localhost:3000/search \
  -H 'content-type: application/json' \
  -d '{"location":{"query":"Austin, TX","coords":null},"searchOptionId":"comic_books"}' | jq
```

Rate-limited to `10/min` per IP (in addition to the global rate limit).

### `POST /create-directions-url`

Creates a Google Maps directions URL from an ordered list of Places (`id`, `name`):

```bash
curl -s http://localhost:3000/create-directions-url \
  -H 'content-type: application/json' \
  -d '[{"id":"place_id_1","name":"Stop 1"},{"id":"place_id_2","name":"Stop 2"}]' | jq
```

## Notes

- Global rate limit: `300` requests / `5 minutes`.
- Search results are distance-filtered to ~`100 miles` by default (`backend/src/constants/search.constants.js`).
