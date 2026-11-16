# LevelUp

LevelUp is a premium personal growth platform for **Android, iOS and Web**. It brings
daily priorities, habits, goals, learning and an AI coach into one calm, focused place.

This repository is a **Turborepo + pnpm monorepo** with two apps, the **Next.js web app**
and the **Expo (React Native) app** for Android and iOS, built on shared packages for design
tokens, types, logic and Supabase.

> **Status — Foundation, web experience and mobile app.** The monorepo, design system,
> responsive web app, native Android/iOS app, dashboard, theming and Supabase integration
> layer are in place. The feature modules (Today, Habits, Goals, Learning, AI Coach) are
> intentionally **not built yet**; their screens describe what's planned and link back to
> the dashboard.
>
> ⚠️ `PROJECT_SPEC.md` was not present in the repository when this milestone was built.
> The milestone brief was used as the working specification. Add the spec to the repo
> root so later milestones can be checked against it.

---

## Contents

- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Repository structure](#repository-structure)
- [Architecture](#architecture)
- [Design system](#design-system)
- [Web app](#web-app)
- [Mobile app](#mobile-app)
- [Supabase](#supabase)
- [Code quality](#code-quality)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)

---

## Tech stack

| Area          | Choice                                                  | Notes                                                                                          |
| ------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Monorepo      | **Turborepo 2.11**, **pnpm 10** workspaces              | `apps/*` and `packages/*`                                                                      |
| Web framework | **Next.js 16.4** (App Router, Turbopack)                | React 19.3, typed routes, `proxy.ts`                                                           |
| Mobile        | **Expo SDK 58**, **React Native 0.88**, Expo Router     | Android + iOS; New Architecture, Hermes; same React 19.3 as web                                |
| Language      | **TypeScript 6.0** (strict)                             | Pinned to `~6.0` because `typescript-eslint` doesn't support TypeScript 7 yet                  |
| Styling       | **Tailwind CSS 4.3**                                    | Theme generated from `@levelup/tokens`                                                         |
| Fonts         | **Manrope** (display), **Inter** (UI/body)              | `next/font` on web; `@expo-google-fonts` (only the weights used) on mobile                     |
| Backend       | **Supabase** (`@supabase/supabase-js`, `@supabase/ssr`) | Optional during development; both apps run without it                                          |
| Icons         | `lucide-react`, `lucide-react-native`                   | Same icon set on both platforms                                                                |
| Lint / format | **ESLint 9** (flat config), **Prettier 3**              | ESLint 9 rather than 10: the React/a11y/import plugins in `eslint-config-next` support up to 9 |
| Unit tests    | **Vitest 5**                                            | Shared packages                                                                                |

## Getting started

### Prerequisites

- **Node.js 24** (see `.nvmrc`; anything ≥ 20.9 works)
- **pnpm 10** via Corepack: `corepack enable` (once per machine). The exact version is pinned in `package.json → packageManager`.
- **Windows only:** Turborepo's binary needs the Microsoft Visual C++ Redistributable.
  If `pnpm dev` fails with exit code `3221225781` / `0xC0000135`, run
  `winget install Microsoft.VCRedist.2015+.x64`. Until then, use `pnpm dev:web`.
  See [Troubleshooting](#troubleshooting).

### Install and run

```bash
pnpm install
pnpm dev            # all workspaces via Turborepo
# or, without Turborepo:
pnpm dev:web
```

Open <http://localhost:3000>. `/` redirects to `/dashboard`.

### On an Android (or iOS) phone: native app

The quickest way to run the real app on your phone is **Expo Go**. No Android SDK or build needed:

1. Install **Expo Go** from the Google Play Store (or the App Store on iPhone).
2. Connect the phone to the **same Wi-Fi** as your computer and run `pnpm dev:mobile`.
3. Scan the QR code in the terminal with Expo Go (Android) or the Camera app (iPhone).
   You can also open Expo Go → **Enter URL manually** → `exp://<your-computer-ip>:8081`.

Edits reload on the phone instantly. To get an **installable APK** instead, see
[Mobile app → Installable builds](#installable-builds-apk).

### On a phone's browser: web app

You can also use the web app in the phone's browser:

1. Connect the phone to the **same Wi-Fi** as your computer and run `pnpm dev:web`.
2. Open the **Network** URL that Next.js prints (e.g. `http://192.168.1.17:3000`) in Chrome on the phone.
3. Optional: Chrome menu → **Add to Home screen** to get an icon.

The dev config adds this machine's private network addresses to `allowedDevOrigins`
automatically, so live reload works on the phone too. If the phone can't connect, allow
Node.js through the computer's firewall for the current network. On Windows, a network
marked _Public_ blocks incoming connections unless a rule allows `node.exe`.

**Android emulator** (Android Studio): open `http://10.0.2.2:3000` in the emulator's Chrome.
`10.0.2.2` is the emulator's alias for the host machine's `localhost`.

**Debugging on the device:** enable USB debugging on the phone, connect it by USB, and open
`chrome://inspect` in desktop Chrome to get DevTools for the phone's tab. Port forwarding there
(`3000 → localhost:3000`) also lets the phone use `http://localhost:3000` without Wi-Fi.

### Environment variables (optional)

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env
```

Every variable is optional. Without Supabase, both apps run with honest empty states. See
[Supabase](#supabase), [`apps/web/.env.example`](apps/web/.env.example) and
[`apps/mobile/.env.example`](apps/mobile/.env.example).

## Scripts

Run these from the repository root.

| Command             | What it does                                                                              |
| ------------------- | ----------------------------------------------------------------------------------------- |
| `pnpm dev`          | Start every workspace's `dev` task (web app + token watcher)                              |
| `pnpm dev:web`      | Start only the web app (no Turborepo needed)                                              |
| `pnpm dev:mobile`   | Start the Expo dev server for the mobile app (scan with Expo Go)                          |
| `pnpm android`      | Build and run on a USB-connected Android device or emulator (needs the Android toolchain) |
| `pnpm build:apk`    | Build a standalone, installable APK (see [Installable builds](#installable-builds-apk))   |
| `pnpm build`        | Production build                                                                          |
| `pnpm start`        | Serve the production build                                                                |
| `pnpm typecheck`    | Type-check all workspaces (web runs `next typegen` first)                                 |
| `pnpm lint`         | ESLint, zero warnings allowed                                                             |
| `pnpm test`         | Unit tests (Vitest)                                                                       |
| `pnpm format`       | Format with Prettier (sorts Tailwind classes)                                             |
| `pnpm format:check` | Verify formatting                                                                         |
| `pnpm check`        | typecheck + lint + test + format check, the pre-PR gate                                   |
| `pnpm tokens`       | Regenerate `packages/tokens/generated/tokens.css` from the TS tokens                      |

To target one workspace, use `pnpm --filter <name> <script>`, e.g. `pnpm --filter @levelup/utils test`.

## Repository structure

```
.
├── apps/
│   └── web/                      Next.js web app (@levelup/web)
│       ├── src/app/              Routes (App Router)
│       │   ├── (app)/            Routes inside the app shell
│       │   │   ├── dashboard/    Dashboard (+ loading skeleton)
│       │   │   ├── today/ habits/ goals/ learning/ coach/   Module pages (planned)
│       │   │   ├── settings/     Theme, preferred name, backend status
│       │   │   └── design-system/  Live component & token reference
│       │   ├── layout.tsx        Root layout: fonts, metadata, no-flash theme script
│       │   ├── globals.css       Tailwind entry + token import + dialog motion
│       │   └── not-found.tsx
│       ├── src/components/
│       │   ├── ui/               Button, Card, Input, Modal, Progress, Badge, EmptyState, Skeleton
│       │   ├── navigation/       Sidebar, bottom tab bar, "More" sheet, nav config
│       │   ├── layout/           App shell, page header, logo, avatar
│       │   ├── dashboard/        Dashboard sections
│       │   ├── theme/            Theme store, init script, switcher
│       │   └── modules/ settings/ design-system/
│       ├── src/lib/              Supabase clients, viewer, env, dashboard data, hooks
│       └── src/proxy.ts          Refreshes Supabase sessions (Next 16 "proxy", formerly middleware)
│   └── mobile/                   Expo app for Android + iOS (@levelup/mobile)
│       ├── app.json / eas.json   App config (icons, splash, package id) and EAS build profiles
│       ├── assets/images/        App icon, adaptive icon, splash, favicon
│       └── src/
│           ├── app/              Routes (Expo Router)
│           │   ├── (tabs)/       Home (dashboard), Today, Habits, Goals, More
│           │   ├── learning, coach, settings   Pushed screens
│           │   └── _layout.tsx   Fonts, splash, providers, navigation theme
│           ├── components/       ui/ (Button, Card, TextField, Sheet, Progress…), dashboard/, layout/
│           ├── providers/        Preferences (theme, name) and viewer
│           ├── theme/            Fonts, typography and themes from @levelup/tokens
│           └── lib/              Supabase client, storage, env, clock
├── packages/
│   ├── tokens/                   @levelup/tokens: design tokens + generated Tailwind theme
│   ├── types/                    @levelup/types: shared domain types
│   ├── utils/                    @levelup/utils: pure helpers, shared copy and sample data
│   ├── supabase/                 @levelup/supabase: typed schema, config, client factory, queries
│   ├── typescript-config/        Shared tsconfig presets
│   └── eslint-config/            Shared ESLint flat configs
├── supabase/migrations/          SQL migrations
├── turbo.json
└── pnpm-workspace.yaml
```

## Architecture

### Platform-agnostic core

The shared packages (`tokens`, `types`, `utils`, `supabase`) contain **no DOM, Node or
React code**. Their TypeScript `lib` is plain `ES2022`, so accidental use of
`window`, `document` or Node APIs fails type checking. That's what lets the Expo app
use them as-is.

| Package             | Consumed by web as                       | Consumed by mobile as                                               |
| ------------------- | ---------------------------------------- | ------------------------------------------------------------------- |
| `@levelup/tokens`   | Generated CSS (`tokens.css`) + TS values | TS values → native typography, colours and `boxShadow` (`theme.ts`) |
| `@levelup/types`    | Types                                    | Types                                                               |
| `@levelup/utils`    | Functions, copy, sample data             | The same functions, copy and sample data, so the apps never drift   |
| `@levelup/supabase` | Schema types, config parsing, queries    | `createLevelUpClient()` with AsyncStorage session storage           |

UI components are **not** shared. Web uses DOM elements, mobile uses native primitives;
both build on the same tokens, types, logic and copy.

### Internal packages without a build step

Workspace packages export TypeScript source directly (`"exports": { ".": "./src/index.ts" }`).
Next.js compiles them through `transpilePackages`, and Metro (Expo) compiles them natively.
There's no watch/build pipeline to keep in sync, and go-to-definition lands on real source.

### Data flow (web)

```
Server Component (page)
  ├─ getViewer()             → Supabase session + profile, or the local preferred-name cookie
  └─ getDashboardSnapshot()  → DashboardSnapshot (empty live data, or labelled sample data)
        ↓ plain serialisable props
Client Components only where needed (greeting clock, weekly chart, theme, navigation state)
```

Anything that depends on the viewer's local time (greeting, date, current weekday) renders
on the client through `useCurrentTime()`, because the server can't know the viewer's time
zone. Locale-dependent formatting uses a fixed `APP_LOCALE` so server and client output match.

## Design system

The live reference is at **`/design-system`** (linked from Settings). It renders every
token and component in the current theme.

### Tokens (`packages/tokens`)

| File            | Contents                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------- |
| `palette.ts`    | Raw brand ramps: forest, lime, stone + status hues                                           |
| `colors.ts`     | **Semantic roles** (`surface`, `foreground-muted`, `primary`, …) for light and dark          |
| `typography.ts` | Manrope/Inter, type scale (`display`, `heading-1…3`, `body`, `label`, `caption`, `overline`) |
| `scales.ts`     | Spacing (4px grid), radii, breakpoints, layout dimensions, motion                            |
| `elevation.ts`  | Shadows defined structurally → CSS (`toCssShadow`) and native (`toNativeShadow`)             |
| `contrast.ts`   | WCAG contrast helpers                                                                        |
| `css.ts`        | Generates the Tailwind v4 theme                                                              |

**Brand anchors (light theme):** background `#F7F7F4`, primary `#183C32`, accent
`#C8F36A`, text `#202520`, surface `#FFFFFF`.

**Dark theme** is designed rather than auto-inverted. Forest `#183C32` is too dark to carry
buttons on a near-black canvas, so in dark mode **lime becomes the primary action colour**
and forest remains the brand surface (hero cards, active navigation).

**Accessibility is tested.** `tokens.test.ts` asserts WCAG AA contrast for every text and
background pairing the UI uses, in both themes. Changing a colour that breaks contrast fails CI.

### Using tokens on the web

Components use semantic utilities that work in both themes:

```tsx
<div className="rounded-2xl border-border bg-surface text-foreground shadow-card">
  <h2 className="font-display text-heading-3">Habits</h2>
  <p className="text-body-sm text-foreground-muted">2 of 4 done today</p>
</div>
```

Tailwind's default colour palette is **disabled** (`--color-*: initial`), so only design-system
colours are available. The brand ramps remain available for illustration (`bg-forest-700`, `stroke-lime-300`).

### Changing tokens

1. Edit `packages/tokens/src/*.ts`.
2. Run `pnpm tokens` to regenerate `packages/tokens/generated/tokens.css` (`pnpm dev` watches it automatically).
3. Commit both. A unit test fails if the generated CSS is out of date.

The generated CSS is committed on purpose: the web app, Prettier's Tailwind plugin and
editor IntelliSense all work straight after `pnpm install`, with no build step.

### Components (`apps/web/src/components/ui`)

| Component                                             | Notes                                                                             |
| ----------------------------------------------------- | --------------------------------------------------------------------------------- |
| `Button`, `ButtonLink`                                | 6 variants, 5 sizes, `loading`; links are type-checked routes                     |
| `Card` (+ `Header`, `Title`, `Description`, `Footer`) | `default`, `muted`, `outline`, `brand`                                            |
| `Input`, `Label`, `TextField`                         | Hint and error wired with `aria-describedby`                                      |
| `Modal`                                               | Native `<dialog>`: focus trap, Escape, backdrop close; `dialog` or bottom `sheet` |
| `ProgressBar`, `ProgressRing`                         | `role="progressbar"` with `aria-valuetext`                                        |
| `Badge`, `SampleBadge`                                | `SampleBadge` labels any surface showing sample data                              |
| `EmptyState`, `Skeleton`                              |                                                                                   |

## Web app

### Routes

| Route                                                | Purpose                                                              |
| ---------------------------------------------------- | -------------------------------------------------------------------- |
| `/`                                                  | Redirects to `/dashboard` (future: landing page / auth gate)         |
| `/dashboard`                                         | Dashboard                                                            |
| `/today`, `/habits`, `/goals`, `/learning`, `/coach` | Module pages: status, planned capabilities, link back                |
| `/settings`                                          | Theme, preferred name, backend connection status, design-system link |
| `/design-system`                                     | Live token and component reference                                   |

### Navigation

- **≥ 1024px:** fixed sidebar with all destinations, settings, a compact theme switcher and the viewer.
- **< 1024px:** sticky top bar and a thumb-reachable bottom tab bar (Home, Today, Habits, Goals, **More**).
  "More" opens a bottom sheet with Learning, AI Coach, Settings and the theme switcher.
- One config (`components/navigation/nav-items.ts`) drives all of it. With **typed routes**,
  a link to a page that doesn't exist fails type checking.
- Active state uses `aria-current="page"`. Includes a skip-to-content link and safe-area insets for notched phones.

### Dashboard

Sections: personalised greeting · today's progress · today's priorities · habits ·
active goals · learning · weekly activity · AI Coach preview.

**No fake numbers.** Each section has a designed empty state with one real next step. Until
the modules ship, the live dashboard is empty. Figures shown anywhere are **derived** from
underlying items (e.g. today's progress = completed priorities + completed habits due today),
never stored as free-floating percentages.

**Sample data preview.** "Preview with sample data" (`/dashboard?demo=1`) renders
illustrative data (`demoDashboard` in `@levelup/utils`, shared with mobile), with a banner and a `Sample` badge
on every card. It's enabled by default in development and disabled in production. Override
with `NEXT_PUBLIC_ENABLE_DEMO_DATA=true|false`.

**Personalisation.** The greeting uses the viewer's local time of day. The name comes from
the Supabase profile when signed in, otherwise from **Settings → Preferred name**, which a
Server Action saves in an HTTP-only cookie on the device.

### Theming

Light, dark or system, chosen in Settings, the sidebar or the mobile "More" sheet.
The preference is stored in `localStorage`. An inline script in `<head>` applies it **before
first paint** (no flash), and a small `useSyncExternalStore` store keeps the switchers and
open tabs in sync. No third-party theme dependency.

## Supabase

Supabase is optional during development. Without it, everything degrades to empty states.

### Setup

1. Create a project at <https://supabase.com>.
2. In `apps/web/.env.local`, set:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...   # legacy: NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
3. Apply the migrations in `supabase/migrations` (Supabase CLI: `supabase link` then `supabase db push`,
   or paste the SQL into the dashboard's SQL editor).
4. Restart the dev server. **Settings → Account & sync** shows the connection status.

> Never expose the **secret** (service-role) key with a `NEXT_PUBLIC_` prefix. It is reserved
> as `SUPABASE_SECRET_KEY` for future server-only tasks and is not used yet.

### Integration layer

| File                                                  | Role                                                                    |
| ----------------------------------------------------- | ----------------------------------------------------------------------- |
| `packages/supabase/src/config.ts`                     | Validates settings; returns `null` when unset/invalid (never throws)    |
| `packages/supabase/src/database.types.ts`             | Typed schema (mirrors migrations)                                       |
| `packages/supabase/src/client.ts`                     | `createLevelUpClient()`, for Expo and scripts                           |
| `packages/supabase/src/profiles.ts`                   | `fetchProfile()`, `mapProfileRow()` (snake_case → shared `UserProfile`) |
| `apps/web/src/lib/supabase/client.ts`                 | Browser client (`@supabase/ssr`, cookie sessions)                       |
| `apps/web/src/lib/supabase/server.ts`                 | Server client for Server Components / Actions (`server-only`)           |
| `apps/web/src/lib/supabase/proxy.ts` + `src/proxy.ts` | Session refresh on each request; forwards no-cache headers              |
| `apps/web/src/lib/viewer.ts`                          | Resolves the current viewer; tolerates Supabase outages                 |

### Schema

`20261110000000_create_profiles.sql` creates `public.profiles` (1:1 with `auth.users`) with
**row-level security** (users can read and update only their own row), an `updated_at`
trigger, and a trigger that creates a profile on sign-up.

`20261115000000_create_today_and_habits.sql` adds `priorities` (up to three per user per day),
`habits` (daily, specific weekdays, or N times a week; archived rather than deleted) and
`habit_checkins` (one row per habit per completed day). Every table has owner-only RLS, and a
composite foreign key stops a check-in from pointing at someone else's habit. **Run the migration
in the Supabase SQL editor** before using Today and Habits; until then both apps show a message
asking you to.

`20261116000000_create_goals_and_learning.sql` adds `goals` and `goal_milestones` (progress is
derived from milestones), `learning_items` (progress in lessons, chapters, pages or modules) and
`learning_sessions`. Same owner-only RLS and composite foreign keys. **Run it in the Supabase SQL
editor** before using Goals and Learning; until then those screens, and the dashboard's goals and
learning cards, say so instead of showing empty data.

To regenerate types after schema changes:

```bash
pnpm dlx supabase gen types typescript --linked > packages/supabase/src/database.types.ts
```

### Today & Habits

Priorities, habits and the live dashboard are saved to the signed-in account (web and mobile
read the same rows).

- **Priorities:** at most three per day. Unfinished ones from the last two weeks are offered
  under "Unfinished from earlier" and can be moved to today or removed.
- **Habits:** schedule is daily, specific weekdays, or N times a week. Streaks count only
  scheduled days (weeks that met the target for "N times a week"), and today never breaks a
  streak until the day has passed. The last seven days can be ticked or unticked. Archiving
  keeps history; archived habits can be restored.
- **"Today" is the viewer's own day.** The web app stores the browser's time zone in a cookie
  (`levelup-tz`) and refreshes at local midnight; the mobile app uses the device's date.
- **Dashboard:** priorities, habits, progress and weekly activity are real. Goals, learning
  and the coach stay empty until their modules exist. Sample data is still opt-in and labelled.
- **Logic lives in `@levelup/utils`** (dates, schedules, streaks, validation) and the queries in
  `@levelup/supabase`, so both apps share it and it is unit-tested.

### Goals & Learning

- **Goals:** a title, optional area and target date, and a status of active, paused or
  completed. Progress is milestones done out of total, never a typed-in percentage, up to 30
  milestones per goal. Target dates show days left or days overdue.
- **Learning:** a library of courses, books, skills and articles, each measured in lessons,
  chapters, pages or modules. Step progress up or down, log sessions (minutes plus an optional
  takeaway note), and see this week's minutes and your study streak. Items can be archived and
  restored.
- **Dashboard:** active goals (nearest target first) and in-progress learning are live. If they
  can't be loaded the dashboard says so rather than showing them as empty.
- **Not built yet:** linking habits and priorities to goals (listed under planned
  capabilities), and a notes library beyond session takeaways.
- **Logic** lives in `@levelup/utils` (`planning.ts`) and queries in `@levelup/supabase`
  (`goals.ts`, `learning.ts`), shared by both apps and unit-tested. The mobile target date is a
  `YYYY-MM-DD` text field, to avoid adding a native date-picker dependency.

### Accounts

When Supabase is configured, both apps require an account. Without Supabase they run with
no sign-in, and the greeting name is stored on the device.

| Flow            | Web route                                                    | Mobile screen                        |
| --------------- | ------------------------------------------------------------ | ------------------------------------ |
| Sign in         | `/sign-in` (returns you to `?next=` after)                   | `sign-in`                            |
| Sign up         | `/sign-up` → `/verify` (6-digit email code)                  | `sign-up` → `verify`                 |
| Forgot password | `/forgot-password` → `/reset-password` (code + new password) | `forgot-password` → `reset-password` |
| Sign out        | Sidebar and Settings                                         | Settings                             |

**Email codes, not links.** Confirmation and password-reset emails contain a one-time code
that's typed into the app. Codes work the same on web and phone, need no deep links, and work
when the email is opened on a different device. Supabase's default templates send links, so
**edit two templates** in the dashboard (**Authentication → Emails**) to include `{{ .Token }}`:

- **Confirm signup:** e.g. `Your LevelUp confirmation code is <strong>{{ .Token }}</strong>`
- **Reset password:** e.g. `Your LevelUp password reset code is <strong>{{ .Token }}</strong>`

**Protection, three layers deep:**

1. `src/proxy.ts` redirects signed-out visitors to sign-in (fast, cookie-based).
2. The `(app)` layout re-checks the session on the server.
3. Row-level security in Postgres guards the data itself.

On mobile, `Stack.Protected` in `src/app/_layout.tsx` swaps between the account screens and
the app based on the session.

Shared logic lives in `@levelup/supabase` (`auth.ts`): input validation (8–72 character
passwords), friendly error messages for every Supabase error code, and detection of sign-ups
with an already-registered email (Supabase hides those on purpose to prevent account
enumeration).

> Supabase's built-in email sender is for development: it's limited to a few emails per hour.
> Configure a custom SMTP provider (Authentication → Emails → SMTP) before inviting real users.

## Code quality

- **TypeScript strict** plus `noUncheckedIndexedAccess`, `noImplicitOverride`, `noImplicitReturns`.
- **Typed routes**: `next typegen` runs before `tsc`, so broken links fail type checking.
- **ESLint** (type-aware `typescript-eslint`, Next.js core-web-vitals, React Hooks, jsx-a11y,
  Turborepo env-var checks), run with `--max-warnings 0`.
- **Prettier** with `prettier-plugin-tailwindcss` for deterministic class order.
- **Tests**: token contrast and generated-CSS drift, date/greeting/progress/text utilities,
  Supabase config parsing and row mapping.

Run `pnpm check` before opening a PR.

### Conventions

- Shared packages stay platform-agnostic: no DOM, Node or React.
- Use semantic colour roles, never raw hex values, in components.
- Every list or section needs a designed empty state with one real next step.
- Never present sample data as real. Use `SampleBadge`, and keep sample data in
  `packages/utils/src/demo-dashboard.ts`, the single source for both apps.
- Copy that appears in both apps (module descriptions, labels) lives in `@levelup/utils`.
- No decorative controls: every button does something and every link resolves.
- Keep Server Components the default. Add `"use client"` only for interactivity, browser
  APIs or local time, and pass only serialisable props across the boundary (icons are components and
  can't be passed from server to client).

## Mobile app

`apps/mobile` is the native Android and iOS app, built with **Expo SDK 58**, **React Native 0.88**
(New Architecture, Hermes) and **Expo Router**. It has the same product surface as the web app:
dashboard, module screens, settings, light/dark/system theme and labelled sample data.

### Running it

| Goal                                 | How                                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Try it on your phone (fastest)       | `pnpm dev:mobile`, then scan the QR code with **Expo Go** (same Wi-Fi)                           |
| Install a standalone app (no server) | `pnpm build:apk`, then copy the APK to the phone and tap it ([details](#installable-builds-apk)) |
| Android emulator / USB device        | Set up the toolchain (below) or Android Studio, then `pnpm android`                              |
| Preview in a browser (layout checks) | `pnpm --filter @levelup/mobile web` (React Native Web; approximates native rendering)            |

Expo Go supports the latest SDK only. If it reports an incompatible SDK, update Expo Go
from the Play Store.

### Installable builds (APK)

`pnpm build:apk` builds a **standalone release APK** locally: the app's code is embedded
(Hermes bytecode), so it needs no Play Store, Expo Go or server. Copy it to a phone and tap it
to install.

**One-time setup (Windows)** installs a portable JDK 17 and Android SDK into
`%LOCALAPPDATA%\LevelUp\android-toolchain`. It needs no admin rights and makes no system
changes; delete the folder to remove it. It's about 2 GB to download, and on throttled
connections the parallel downloader is several times faster than `sdkmanager`. Running it
**accepts the Android SDK License Agreement**.

```bash
pnpm --filter @levelup/mobile setup:android   # one-time; safe to re-run (resumes)
pnpm build:apk                                # → apps/mobile/dist/LevelUp-<version>-arm64.apk
pnpm --filter @levelup/mobile build:apk --all # universal APK (32-bit phones, emulators)
```

On macOS/Linux, or if you already have Android Studio, set `JAVA_HOME` and `ANDROID_HOME`
and run `pnpm build:apk`.

**Installing on a phone:** copy the APK over (USB, Google Drive, email, etc.), tap it, and
allow "Install unknown apps" for the app you opened it from when Android asks. Newer builds
install over older ones and keep the app's data.

How it works ([`scripts/build-apk.mjs`](apps/mobile/scripts/build-apk.mjs)):

1. `expo prebuild` regenerates the native `android/` project from `app.json`. It's
   git-ignored: `app.json` and config plugins are the source of truth.
2. Gradle's `assembleRelease` compiles native code and embeds the JS bundle. The default
   target is 64-bit ARM (`arm64-v8a`), which covers practically every phone from the last ~7 years.
3. Test builds enable the clearly labelled sample-data preview. Set
   `EXPO_PUBLIC_ENABLE_DEMO_DATA=false` to turn it off.

**Building on Windows: the 260-character path limit.** React Native's C++ build (CMake +
Ninja) fails when file paths exceed 260 characters, which is the default on Windows. Three
settings keep paths short; keep them unless you've enabled long paths:

- `nodeLinker: hoisted` in `pnpm-workspace.yaml`: libraries live at `node_modules\<name>`
  instead of pnpm's deeply nested store.
- [`plugins/with-cmake-object-path-max.js`](apps/mobile/plugins/with-cmake-object-path-max.js)
  (Expo config plugin) sets `CMAKE_OBJECT_PATH_MAX=240`, so CMake hashes long object-file
  paths. CMake only does this automatically when _targeting_ Windows.
- `expo.autolinking.exclude` in `apps/mobile/package.json` skips native libraries that Expo
  Router pulls in but LevelUp doesn't use (`react-native-reanimated`, `react-native-worklets`,
  `react-native-gesture-handler`). This also makes builds faster and the APK smaller. Remove an
  entry if you start using that library.

> **Signing:** test APKs are signed with the project's debug keystore. That's fine for
> manual testing, but **not for the Play Store**. Store releases need a private upload key,
> or EAS Build's managed signing.

**Cloud alternative (EAS Build):** if you'd rather not install a toolchain, build in Expo's
cloud instead: `npx eas-cli build --platform android --profile preview` (needs an Expo account).
Profiles are in [`apps/mobile/eas.json`](apps/mobile/eas.json): `preview` makes an APK and
`production` makes a Play Store app bundle (`.aab`).

The Android package id is `app.levelup.mobile` (in `app.json`). Change it before the first
store release, because it can't be changed afterwards.

### How it's built

- **Navigation:** Expo Router with a bottom tab bar (Home, Today, Habits, Goals, More).
  Learning, AI Coach and Settings are pushed screens with a native header and back button.
- **Theme:** `src/theme/theme.ts` turns `@levelup/tokens` into native styles: per-weight
  font families (Android ignores `fontWeight` for custom fonts), px letter-spacing, and CSS
  `boxShadow` (supported natively on the New Architecture). The theme preference (light, dark
  or system) persists on the device.
- **Startup:** the splash screen stays up until fonts and saved preferences load, so the
  first frame has the right theme and typography.
- **Data:** the dashboard uses the same `emptyDashboard` / `demoDashboard` and
  `summarizeTodayProgress` as the web app. The preferred name is stored with AsyncStorage.
- **Supabase:** `src/lib/supabase.ts` creates the client with AsyncStorage session storage and
  refreshes tokens only while the app is in the foreground. Set `EXPO_PUBLIC_SUPABASE_URL` and
  `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `apps/mobile/.env`. `EXPO_PUBLIC_*` values are
  compiled into the app, so never put secrets there.
- **Accessibility:** native roles and states throughout (buttons, links, headers, radio group
  theme picker, progress bars with spoken values), 48dp touch targets, and a table view of
  the weekly chart.
- **Monorepo:** Expo configures Metro for pnpm workspaces automatically (SDK 52+), with no custom
  `watchFolders`. Run `pnpm --filter @levelup/mobile doctor` to validate dependencies.

### Verifying changes

```bash
pnpm --filter @levelup/mobile typecheck
pnpm --filter @levelup/mobile lint
pnpm --filter @levelup/mobile export:android   # compiles the real Android (Hermes) bundle
pnpm --filter @levelup/mobile doctor           # Expo's dependency and config checks
```

## Troubleshooting

| Symptom                                                                                                | Fix                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm dev`/`build` exits with `3221225781` or `0xC0000135` (Windows)                                   | Turborepo needs the VC++ runtime: `winget install Microsoft.VCRedist.2015+.x64`. Meanwhile use `pnpm dev:web` or `pnpm --filter @levelup/web build`.                                                   |
| `'pnpm' is not recognized` inside a script                                                             | Run `corepack enable` so the `pnpm` shim is on `PATH`.                                                                                                                                                 |
| Styles look unstyled after editing tokens                                                              | Run `pnpm tokens` (or keep `pnpm dev` running, which watches tokens).                                                                                                                                  |
| Hydration warning right after editing a component in dev                                               | Hot reload can serve a stale server render. Restart the dev server; if it persists, it's a real mismatch.                                                                                              |
| Port 3000 in use                                                                                       | `pnpm --filter @levelup/web exec next dev --port 3001`                                                                                                                                                 |
| "Not configured" under Settings → Account & sync                                                       | Supabase env vars are missing or malformed in `apps/web/.env.local` (or `apps/mobile/.env`); restart after editing.                                                                                    |
| Expo Go can't connect to the dev server                                                                | Phone and computer must be on the same Wi-Fi, and the firewall must allow Node.js (port 8081). On restrictive networks, try `npx expo start --tunnel` in `apps/mobile`.                                |
| Expo Go says the project's SDK is incompatible                                                         | Update Expo Go from the Play Store or App Store; it supports the latest SDK.                                                                                                                           |
| Android build: `Filename longer than 260 characters`, `build.ninja still dirty` or `mkdir(...)` errors | Windows path limit. Keep the three settings under [Installable builds](#installable-builds-apk). If you add a native library with very long paths, exclude it if unused, or enable Windows long paths. |
| Android build: `prebuild` fails with `EBUSY … android`                                                 | A process is holding the `android` folder (a terminal open inside it, or a Gradle daemon). Close it or run `apps/mobile/android/gradlew --stop`, then retry.                                           |
| Mobile app shows stale code or odd module errors                                                       | Clear Metro's cache: `pnpm --filter @levelup/mobile start --clear`.                                                                                                                                    |

## Roadmap

1. ✅ **Foundation & web experience**
2. ✅ **Mobile app foundation**: Expo app for Android and iOS on the shared packages
3. ✅ **Accounts**: Supabase Auth (email), profile editing synced to `profiles`, on both apps
4. ✅ **Today & Habits**: priorities, habit tracking, streaks; live dashboard data
5. ✅ **Goals & Learning**: milestones, library, sessions (linking habits to goals still to come)
6. AI Coach: insights and weekly reflection
7. Store release: EAS production builds, Play Store / App Store listings
