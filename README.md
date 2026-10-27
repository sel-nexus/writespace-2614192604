# WriteSpace

WriteSpace is a browser-only blog demo for discovering posts, creating local writing accounts, and managing posts by author or administrator role.

## Requirements

- Node.js 20 or later
- npm
- A modern browser with `localStorage` and `crypto.randomUUID()` support

## Run locally

```sh
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite. The default demo administrator is `admin` / `admin`.

## Tests and build

```sh
cd frontend
npm test
npm run build
npm run test:e2e
```

The unit/component tests use Vitest and Testing Library. The Playwright end-to-end suite starts the Vite server itself and covers account access, post journeys, and admin behavior.

## Vercel deployment

The repository contains a nested static frontend in `frontend/`. Configure Vercel with repository root as the project root. The root `vercel.json` runs `cd frontend && npm install && npm run build`, publishes `frontend/dist`, and rewrites direct client-side routes to the SPA entry point.

## Demo data and security limits

This product stores posts, user records, and the current session only in the current browser's localStorage. Data is not synchronized to other browsers or devices. Passwords for demo-created accounts are stored in plain text, and role checks run in the browser only. The hard-coded `admin` / `admin` credentials are for demonstration only. **Do not use real passwords, sensitive information, or private content in WriteSpace.** Clearing browser storage removes locally saved data.
