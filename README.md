# Intrinsic Workcell Command Center

> A production-grade customer-facing dashboard prototype for monitoring Intrinsic-powered industrial workcells.

Built by **Parva Raval** as a Product Management Intern application artifact for [Intrinsic](https://intrinsic.ai) (Alphabet).

---

## What This Is

This prototype demonstrates the v1 customer-facing dashboard proposed in the accompanying PRD. It provides:

- **Real-time workcell health monitoring** with semantic status indicators (operational / degraded / stopped)
- **Production metrics** including OEE gauge, cycle time trends, throughput tracking, and cost savings
- **AI skill observability** with IVM confidence tracking, force profile visualization, simulated camera feed, and workcell schematic
- **Incident management** with contextual diagnostics, alert severity filtering, and remote reset capability

## Design Philosophy

- **Dark-mode industrial interface** designed for factory floor control rooms and ambient lighting
- **Glanceable comprehension** — workcell status visible in <2 seconds from any scroll position
- **Touch-friendly** sizing for tablet deployment alongside physical workcells
- **Simulated telemetry engine** provides realistic, dynamic data with configurable thresholds
- **Accessibility-first** — ARIA labels, focus rings, status icons (not color-only), keyboard shortcuts, `prefers-reduced-motion` support

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Charts | Recharts |
| Animation | Framer Motion |
| State | Zustand |
| Icons | Lucide React |
| Deployment | Vercel |

## Key Product Decisions

> See the accompanying PRD for full rationale

1. **Single workcell scope** for v1 — prove the telemetry pipeline before scaling to fleet view
2. **Shift Manager as primary persona** — largest user base, most urgent unmet need
3. **AI skill observability as differentiator** — no competitor offers this depth of insight into ML model performance on the factory floor
4. **Out of scope for v1**: 3D digital twin, predictive analytics, natural language query interface (all planned for v2/v3)

## Architecture

```
┌──────────────────────────────────────────────────┐
│                  Next.js App Router               │
│  ┌──────────────────────────────────────────────┐ │
│  │            DashboardShell (Layout)            │ │
│  │  ┌─────────┐ ┌───────────────────────────┐   │ │
│  │  │ Sidebar  │ │     Main Content Area     │   │ │
│  │  │         │ │  ┌─────────────────────┐  │   │ │
│  │  │ Nav     │ │  │ Workcell Health     │  │   │ │
│  │  │ Links   │ │  │ (sticky)            │  │   │ │
│  │  │         │ │  ├─────────────────────┤  │   │ │
│  │  │         │ │  │ Production Metrics  │  │   │ │
│  │  │         │ │  ├─────────────────────┤  │   │ │
│  │  │         │ │  │ AI Skill Observ.    │  │   │ │
│  │  │         │ │  ├─────────────────────┤  │   │ │
│  │  │         │ │  │ Incident Mgmt       │  │   │ │
│  │  │         │ │  └─────────────────────┘  │   │ │
│  │  └─────────┘ └───────────────────────────┘   │ │
│  └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘

Data Flow:
  SimulationBootstrap
       │
       ▼
  Zustand Store (telemetryStore)  ◄── Tick every 1s
       │                                  │
       ├── workcell state                 ├── OEE drift
       ├── production metrics             ├── cycle time sim
       ├── AI skill telemetry             ├── IVM confidence
       └── incident generation            └── force profile
              │
              ▼
       React Components (subscribe via selectors)
```

## Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features & Interactions

| Feature | Description |
|---------|-------------|
| **Sticky Health Strip** | Always-visible workcell status with animated metrics |
| **OEE Gauge** | SVG radial gauge with real-time breakdown |
| **Cycle Time Chart** | Live trend with outlier highlighting and threshold lines |
| **IVM Confidence Monitor** | ML model confidence with spark chart and threshold alerts |
| **Force Profile** | Real-time force/torque visualization with safety bounds |
| **Camera Feed** | Simulated camera with animated bounding boxes and HUD |
| **Workcell Schematic** | SVG top-down layout with animated robot arm |
| **Alert Feed** | Severity-filtered incidents with expand/collapse details |
| **Remote Reset** | Confirmation modal with workcell stop and recovery simulation |
| **Keyboard Shortcuts** | `S` sidebar, `1-4` sections, `A` acknowledge, `?` help |
| **Settings Panel** | Configurable thresholds that affect simulation triggers |
| **Toast Notifications** | Bottom-right stack with auto-dismiss and types |
| **Debug Panel** | Live telemetry inspector for development |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `S` | Toggle sidebar |
| `1` | Scroll to Health section |
| `2` | Scroll to Production section |
| `3` | Scroll to AI Skills section |
| `4` | Scroll to Incidents section |
| `A` | Acknowledge latest alert |
| `Esc` | Close settings/panels |
| `?` | Show shortcuts help |

## Deployment to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and sign up (free tier)
3. Click **"Add New Project"** and import your GitHub repo
4. Vercel auto-detects Next.js — click **Deploy**
5. Your dashboard will be live at `your-project.vercel.app`

Optional: Add a custom domain in Vercel's project settings under Domains.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with fonts & metadata
│   ├── page.tsx            # Main dashboard page
│   ├── globals.css         # Design system & animations
│   └── icon.svg            # Favicon
├── components/
│   ├── layout/
│   │   ├── DashboardShell.tsx
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── SettingsPanel.tsx
│   ├── modules/
│   │   ├── WorkcellHealth/
│   │   ├── ProductionMetrics/
│   │   ├── AISkillObservability/
│   │   └── IncidentManagement/
│   ├── ui/
│   │   ├── AnimatedNumber.tsx
│   │   ├── MotionWrapper.tsx
│   │   ├── StatusTransition.tsx
│   │   ├── Toast.tsx
│   │   ├── KeyboardShortcuts.tsx
│   │   └── ...
│   └── SimulationBootstrap.tsx
├── store/
│   ├── telemetryStore.ts   # Simulation engine & state
│   └── settingsStore.ts    # User preferences
└── lib/
    └── types.ts            # Shared TypeScript types
```

## Author

**Parva Raval** — Duke MEM '26

---

*Intrinsic Workcell Command Center v1.0 — Prototype for PM Intern Application · All data is simulated*
