<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/6e7e9cb6-c1f5-4b8b-857a-bf9ecca869b8

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Vercel (Node + Express)

This project runs an Express server that also serves the Vite-built SPA.

1. Push the repo to GitHub.
2. In Vercel, create a new Project from GitHub.
3. Set **Environment Variables**:
   - `GEMINI_API_KEY` (required for real Gemini responses; if omitted, the app falls back to local simulation and will still work)
4. Use the default build settings from `vercel.json`:
   - Build command: `npm run build`
   - Install command: `npm ci`

After deployment, test:
- `GET /` (frontend)
- `POST /api/onboard`
- `POST /api/choice`
- `POST /api/voice`

