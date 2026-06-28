# Foundrly

Foundrly is an AI-powered startup workspace for founders. It helps teams turn an early startup idea into a structured startup blueprint, generate and refine investor-ready pitch content, design slide decks, work with an AI cofounder, and manage investor outreach campaigns from a single Next.js application.

The app is built with the Next.js App Router, React 19, Supabase authentication, Tailwind CSS, shadcn/Radix UI primitives, Framer Motion, TinyMCE, Reveal.js, jsPDF, and a hosted backend at `https://pitchdeckbend.onrender.com`.

## What Foundrly does

- **Landing and authentication flow** — unauthenticated users are routed to the marketing experience, while authenticated users enter the workspace.
- **Startup blueprint creation** — founders enter company context such as title, description, industry, stage, and target market, then save it as a pitch deck/blueprint record.
- **Blueprint dashboard** — users can browse, search, filter, paginate, and delete saved startup blueprints.
- **AI pitch generation** — the pitch view can generate investor-facing pitch content, competitor analysis, validation scoring, and saved generated content.
- **Slide playground** — founders can generate editable slides, tune typography/layout, preview the deck, save slide content, and export presentation output.
- **AI cofounder chat** — each blueprint can have strategy, analytics, creative, and supportive chat sessions with saved conversations.
- **Outreach campaigns** — users can create campaigns from blueprints, add investors, generate personalized cold emails, send emails, and track outreach status.
- **Application shell** — the authenticated app uses a persistent sidebar, navbar, theme management, and toast notifications.

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 15 App Router, React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn-style components, Radix UI, Lucide icons |
| Motion/visuals | Framer Motion, Motion, React Parallax Tilt, Spline, Three/Fiber/Drei |
| Auth/data session | Supabase Auth with `@supabase/supabase-js` and auth helpers |
| Editor/deck output | TinyMCE, Reveal.js, jsPDF, html2canvas |
| Forms/validation | React Hook Form, Zod, hookform resolvers |
| State/theme | Recoil, next-themes, custom `ThemeManager` |
| Notifications | Sonner and local toast helpers |

## Repository structure

```text
.
├── app/
│   ├── (dashboard)/              # Authenticated workspace routes
│   ├── api/auth/                 # Local login/signup API route wrappers
│   ├── components/               # App-specific components used by routes
│   ├── home/                     # Public landing page
│   ├── login/                    # Login/signup UI
│   ├── ClientWrapper.tsx         # Global sidebar/navbar/layout shell
│   ├── globals.css               # Global Tailwind styles and animations
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Auth gate and initial redirect
├── components/
│   ├── ui/                       # Reusable UI primitives
│   ├── magicui/                  # Magic UI-style components
│   ├── app-sidebar.tsx           # Workspace sidebar
│   ├── nav-*.tsx                 # Navigation sections
│   └── pitchplayground.tsx       # Slide editor/generator/export experience
├── hooks/                        # Shared React hooks
├── lib/
│   ├── actions/                  # Client-side API helpers for backend calls
│   ├── recoil/                   # Recoil atoms
│   ├── theme/                    # Theme context/manager
│   └── utils.ts                  # Shared utility helpers
├── public/                       # Static assets
├── utils/supabase/               # Supabase browser/server clients
├── middleware.ts                 # Auth middleware/client setup
└── package.json                  # Scripts and dependencies
```

## Core routes

| Route | Purpose |
| --- | --- |
| `/` | Checks the Supabase session. Anonymous users go to `/home`; authenticated users see a welcome transition and are sent to `/appdash`. |
| `/home` | Public marketing/landing page. |
| `/login` | Authentication UI. |
| `/appdash` | Main dashboard with recent blueprints and an assistant-style helper chat. |
| `/createpitchdeck` | Startup blueprint creation form. |
| `/decks` | Blueprint library with filtering, pagination, and deletion. |
| `/pitchdeck/[pitchid]` | AI pitch generation, competitor analysis, validation, and saved content for one blueprint. |
| `/Slideplayground/[pitchid]` | Slide generation/editing playground for a blueprint. |
| `/cofounder` | Blueprint picker for AI cofounder sessions. |
| `/CofChat/[pitchid]` | AI cofounder chat for a specific blueprint. |
| `/outreach` | Outreach campaign creation flow. |
| `/campaigns` | Campaign list with search/filtering. |
| `/campaigns/[campaign_id]` | Campaign detail page for managing investors. |
| `/outreachcampaign/[campaign_id]/investor/[investor_id]` | Investor-specific outreach dashboard with generated emails and tracking. |
| `/aboutus` | Simple about page. |

## Backend integrations

Most product features call the hosted Foundrly backend at `https://pitchdeckbend.onrender.com`. The current frontend uses these capabilities:

- `GET /pitchdecks` — list saved blueprints.
- `POST /pitchdecks` — create a new blueprint.
- `GET /pitchdecks/:id` — fetch one blueprint.
- `DELETE /pitchdecks/:id` — delete a blueprint.
- `POST /generate-pitch` — generate pitch content.
- `POST /competitor-analysis` — generate competitor analysis.
- `POST /validator` — validate/score a pitch.
- `GET /get-gen/:id` — fetch generated content for a blueprint.
- `POST /save-content` — persist generated pitch content.
- `POST /generate-slides` — generate slide content.
- `POST /save-slides` — persist edited/generated slides.
- `GET /user/profile` — load the authenticated user profile.
- `POST /helper-chat` — dashboard helper chat.
- `GET /cofounder/chats/:pitchId` — load saved cofounder chats.
- `POST /cofounder/save` — save a cofounder chat.
- `DELETE /cofounder/chats/:chatId` — delete a saved cofounder chat.
- `POST /campaigns` and `GET /allcampaigns` — create and list outreach campaigns.
- `GET /campaigns/:campaignId` and `DELETE /campaigns/:campaignId` — campaign detail and deletion.
- `GET/POST /campaigns/:campaignId/investors` — list or add investors.
- `DELETE /campaigns/:campaignId/investors/:investorId` — remove investors.
- `GET /campaigns/:campaignId/investors/:investorId` — load investor details.
- `GET /campaigns/:campaignId/investors/:investorId/outreach-tracking` — load outreach tracking.
- `POST /outreach/generate-cold-email` — generate a personalized email.
- `POST /outreach/send-email` — send an outreach email.
- `PUT /outreach-tracking/:id` and `DELETE /outreach-tracking/:id` — update/delete tracked outreach records.

Authenticated requests attach the Supabase access token as `Authorization: Bearer <token>`.

## Environment variables

Create a local `.env.local` file before running the app:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
NEXT_PUBLIC_TINY_API_KEY="your-tinymce-api-key"
```

Notes:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are required by the browser Supabase client and auth token helpers.
- `SUPABASE_SERVICE_ROLE_KEY` is referenced by middleware. Treat it as a secret and do not expose it to the browser.
- `NEXT_PUBLIC_TINY_API_KEY` is used by the TinyMCE editor in the slide playground.
- The hosted backend URL is currently hard-coded in the frontend. If you deploy a separate backend, update the API URLs or introduce a shared environment variable before deployment.

## Getting started

### Prerequisites

- Node.js 20+
- npm
- A Supabase project with authentication enabled
- A TinyMCE API key if you want the slide editor to run without TinyMCE warnings
- Access to the hosted Foundrly backend or your own compatible backend

### Install dependencies

```bash
npm install
```

### Configure local secrets

```bash
cp .env.example .env.local
```

If `.env.example` does not exist, create `.env.local` manually using the environment variable block above.

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route checks authentication and redirects users to either `/home` or `/appdash`.

### Build for production

```bash
npm run build
npm run start
```

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Next.js development server with Turbopack. |
| `npm run build` | Creates a production build. |
| `npm run start` | Starts the production server after a build. |
| `npm run lint` | Runs the configured lint command. The current script uses `next lint`, which may need updating for newer Next.js versions. |

## Authentication model

Foundrly uses Supabase Auth for sessions. The app includes local Next.js API route wrappers for email/password and magic-link signup/login, while most authenticated product calls retrieve the current Supabase session and forward its access token to the external backend.

Important implementation details:

- The root route is a client-side auth gate.
- `ClientWrapper` hides the workspace sidebar/nav on public, auth, root, and slide-playground routes.
- `getAuthToken()` creates a Supabase client and reads `supabase.auth.getSession()` before backend calls.
- Supabase browser and server clients live under `utils/supabase/`.

## Product workflow

A typical founder journey looks like this:

1. Sign up or log in with Supabase auth.
2. Create a startup blueprint at `/createpitchdeck`.
3. Review saved blueprints at `/decks` or from the dashboard.
4. Open a blueprint at `/pitchdeck/[pitchid]` to generate pitch content, validation, and competitor analysis.
5. Generate/edit slides at `/Slideplayground/[pitchid]` and export a deck.
6. Use `/CofChat/[pitchid]` for strategic AI cofounder conversations.
7. Create an outreach campaign at `/outreach`, manage investors from `/campaigns/[campaign_id]`, and generate/send personalized cold emails from the investor outreach dashboard.

## UI and styling conventions

- Reusable primitives live in `components/ui` and follow shadcn/Radix composition patterns.
- Route-specific product UI is mostly colocated under `app/(dashboard)` and `app/components`.
- Global app chrome is managed by `app/ClientWrapper.tsx`, `components/app-sidebar.tsx`, and `app/components/navbar.tsx`.
- Tailwind classes are the primary styling mechanism, with custom animations in `app/globals.css` and component-level animation via Framer Motion.
- Theme state is coordinated with `next-themes` and the custom theme manager under `lib/theme`.

## Deployment notes

- Vercel is the natural deployment target for the Next.js frontend.
- Add all required environment variables in your hosting provider before building.
- Confirm the Supabase redirect URLs include your production domain.
- Confirm the backend accepts requests from your frontend origin and supports the same Supabase JWT issuer/audience.
- Because several backend URLs are hard-coded, audit them before deploying to staging or production environments.

## Troubleshooting

| Issue | What to check |
| --- | --- |
| `Missing Supabase URL or Anon Key` | Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in `.env.local`. |
| Authenticated API calls return 401/403 | Confirm the user is logged in, the token is being sent, and the backend validates the same Supabase project. |
| TinyMCE editor warnings | Set `NEXT_PUBLIC_TINY_API_KEY`. |
| Dashboard or deck pages show empty/error states | Verify backend availability and that the Supabase token is accepted by `pitchdeckbend.onrender.com`. |
| `npm run lint` fails with an unknown command | The script currently uses `next lint`; update the lint script for the installed Next.js version if needed. |

## Contributing

1. Create a focused branch.
2. Install dependencies with `npm install`.
3. Make changes in the relevant route/component/action files.
4. Run at least `npm run build` before opening a PR when environment variables and backend access are available.
5. Document new environment variables, routes, or backend endpoints in this README.
