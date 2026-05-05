# CVForge — Product Roadmap

---

## 🧭 PHASE 0 — Product Definition & Technical Foundation

**Milestone: Approved architecture + ready-to-build repo**

### Epic: Product Scope & UX Definition
- Define user personas (job seekers, recruiters)
- Define core user flows: Create CV, Edit CV, Export CV, Import CV
- Define ATS compliance rules *(locked here — used by renderer, templates, and scoring)*
- Define template structure (3 templates: Minimal, Modern, Compact)
- Define mobile-first UX behavior (drag, touch, section-boundary snapping)

### Epic: CV JSON Schema Design *(moved from Phase 2)*
- Define JSON structure with a `version` field for future migrations:
  - Sections, Blocks, Content types (text, list, dates)
- Define section types: Personal Info, Experience, Education, Skills, Projects, Certifications, Languages, Custom, Spacer
- Define Zod schemas for all section types *(runtime validation — used by import, load, and form inputs)*
- Write a schema migration utility skeleton (`migrateSchema(v1 → v2)`)
- Define `uuid` generation convention for section and block IDs *(every section/block gets a stable UUID)*

### Epic: ATS Scoring Rules *(moved from Phase 7)*
- Define scoring dimensions:
  - Section completeness
  - Keyword density
  - Formatting compliance (no tables, no images, single-column default)
- Define warning thresholds and recommendation messages
- Lock rule set before any rendering work begins

### Epic: Accessibility (a11y) Standards
- Define a11y requirements:
  - ARIA labels on all interactive canvas elements
  - Keyboard navigation for drag-drop (`@dnd-kit` keyboard sensor)
  - Focus management for modals and panels
  - Screen-reader-friendly CV output (semantic HTML)
- Define logical CSS property convention (`margin-inline-start` not `margin-left`) for RTL-readiness

### Epic: Error Handling Strategy
- Define error categories:
  - localStorage quota exceeded
  - Failed PDF/DOCX export
  - Corrupt / invalid JSON import
  - Runtime component errors
- Define recovery UX per category (toast via `sonner`, modal, fallback UI)
- Agree on React error boundary placement (one per major panel: Sidebar, Canvas, Properties)

### Epic: Technical Architecture
- Define SPA architecture: Vite + React 18 + TypeScript + `@tanstack/react-router`
- Define state management: Zustand
- Define panel layout: shadcn `ResizablePanelGroup` / `ResizablePanel` (wraps `react-resizable-panels`) (Sidebar | Canvas | Properties)
- Define drag-drop architecture: `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/modifiers` for boundary snapping
- Define export pipeline: `jspdf` + `html2canvas` for PDF; `docx` (JSON→DOCX transformer) for DOCX; `file-saver` for download trigger
- Define multi-page PDF strategy: page-break CSS + `jspdf` multi-page API
- Define HTML code viewer/editor: `@uiw/react-codemirror` + `@codemirror/lang-html` *(live editable, not read-only)*
- Define i18n strategy: `react-i18next` + `date-fns` for locale-aware date formatting *(decided here, scaffolded in Phase 1)*
- Define DOCX approach: JSON→DOCX transformer using `docx` library *(not HTML→DOCX — no HTML parser needed)*

### Epic: Design System
- Define Tailwind theme (colors, spacing, typography) + `@tailwindcss/typography` for CV content prose
- Use logical CSS properties throughout for RTL readiness
- Define spacing scale (section-boundary snapping replaces pixel grid on the canvas)
- Define reusable shadcn component set: Button, Dialog, DropdownMenu, Popover, Select, Separator, Slider, Switch, Tabs, Tooltip, Toast (sonner)
- Define dark mode tokens; implementation uses shadcn's built-in dark mode support (class-based, no `next-themes` needed)

---

## 🏗️ PHASE 1 — Core App Scaffold

**Milestone: App runs with layout + navigation**

### Epic: Project Setup
- Initialize project: Vite + React 18 + TypeScript
- Configure Tailwind CSS v3 + `tailwindcss-animate` + `@tailwindcss/typography`
- Setup shadcn component library (full Radix UI primitive suite)
- Setup `@tanstack/react-router` for client-side routing
- Setup ESLint + Prettier
- Setup Vitest + `@testing-library/react` + `@testing-library/jest-dom` *(establish from day one)*
- Setup `@playwright/test` for E2E *(scaffold only — tests written in Phase 10)*
- Setup folder structure
- Setup `uuid` import convention for ID generation

### Epic: i18n Scaffolding *(moved from Phase 8)*
- Integrate `react-i18next`
- Setup translation file structure (`/locales/en.json`, `/locales/ar.json`, etc.)
- Wrap all UI strings in `t()` from the start — no hardcoded strings after this point
- Configure `dir` attribute switching (LTR/RTL) on `<html>` element
- Setup `date-fns` locale integration for locale-aware date formatting

### Epic: Error Handling Infrastructure *(new)*
- Implement React error boundaries (one per major panel: Sidebar, Canvas, Properties)
- Implement global error toast using `sonner`
- Implement localStorage quota check utility
- Implement Zod-based JSON schema validator (used by import and load in Phase 6)

### Epic: Layout System
- Build three-panel layout using shadcn `ResizablePanelGroup` / `ResizablePanel`: Left Sidebar | Canvas | Right Properties Panel
- Left sidebar: collapsible on mobile
- Right sidebar: collapsible on mobile
- Implement mobile bottom toolbar using `vaul` drawer
- Implement responsive breakpoint behavior

### Epic: Navigation & Core UI
- Navbar: Logo, New CV, Templates, View Code, Export, Preview Mode
- Global modal system using `@radix-ui/react-dialog`
- Toast notifications via `sonner`
- Empty state / onboarding screen with sample CV data preloaded on first run

---

## 🎨 PHASE 2 — CV Rendering Engine

**Milestone: CV renders dynamically from structured data**

> Schema (Zod) and section types are already defined in Phase 0. This phase builds the renderer.

### Epic: HTML Rendering Engine
- Convert CV JSON → semantic HTML (`h1`, `h2`, `p`, `ul`, `li`) using React components
- Apply `@tailwindcss/typography` prose styles to CV content
- Enforce ATS compliance rules from Phase 0 (no tables, no absolute positioning, single column by default)
- Build one renderer component per section type

### Epic: Template System
- Create 3 ATS templates: **Minimal**, **Modern**, **Compact**
  - Minimal: clean black/white, generous whitespace, system font
  - Modern: blue accent header, subtle dividers, slightly condensed
  - Compact: tighter spacing, two-column skills block (with ATS warning)
- Add template switcher (same JSON data → different visual styles)
- Validate all 3 templates against Phase 0 ATS rules

---

## 🧲 PHASE 3 — Drag & Drop Builder

**Milestone: Fully interactive drag-drop CV builder**

### Epic: Drag & Drop Core
- Implement draggable component palette (sidebar → canvas) using `@dnd-kit/core`
- Implement sortable section reordering using `@dnd-kit/sortable`
- Implement drop zones with section-boundary snapping using `@dnd-kit/modifiers` (`restrictToVerticalAxis`, `restrictToParentElement`)

### Epic: Advanced Interactions
- Alignment guides (Figma-style: top/bottom/left/right margin indicator lines while dragging)
- Snap-to-section-boundaries *(not pixel grid — pixel grid fights document flow in a single-column CV)*
- Collision detection tuning for overlapping drop targets

### Epic: Undo/Redo System *(moved from Phase 9)*
- Command stack: every state mutation dispatched through a command object
- `Ctrl+Z` / `Ctrl+Y` (Mac: `Cmd+Z` / `Cmd+Shift+Z`) support
- Max stack depth: 50 steps

### Epic: Touch Optimization
- Mobile drag gestures via `@dnd-kit` pointer/touch sensor
- Prevent scroll-drag conflicts on mobile canvas
- Optimize for 60fps on mid-range Android

### Epic: Element Controls
- Delete component (`Del` key + trash button)
- Duplicate component (`Ctrl+D`)
- Lock component (non-draggable toggle)
- Deselect on `Escape`
- Arrow key nudging for selected elements (8px per keypress)

### Epic: Keyboard & a11y *(new)*
- Wire up `@dnd-kit` keyboard sensor for full keyboard drag-drop
- ARIA roles and labels on all draggable/droppable elements
- Visible focus rings on canvas elements
- Announce drag start/drop state to screen readers via `aria-live`

---

## ✏️ PHASE 4 — Inline Editing System

**Milestone: Fully editable CV content**

### Epic: Text Editing
- Click-to-edit fields using `react-hook-form` with Zod validation per field
- ContentEditable for rich text fields; controlled inputs for structured fields (dates, URLs)
- Add/remove bullet point entries within sections
- Inline bold/italic formatting via toolbar or keyboard shortcuts

### Epic: Date Fields
- Date pickers using `react-day-picker` for start/end dates in Experience and Education
- `date-fns` for formatting dates according to active locale
- "Present" / "Current" toggle for ongoing roles

### Epic: Keyboard Shortcuts *(new)*
- `Del` → delete selected element
- `Ctrl+D` → duplicate element
- `Ctrl+S` → explicit save to localStorage
- `Escape` → deselect / close inline editor
- Arrow keys → nudge selected element
- `Cmd+K` → open command palette (`cmdk`) — search sections, actions, templates

### Epic: Command Palette *(new)*
- Integrate `cmdk` for a searchable command palette (`Cmd+K`)
- Actions: add section, switch template, export PDF, export DOCX, toggle preview, undo, redo
- Sections: jump to any section in the CV

### Epic: Section Management
- Add new sections (from palette or command palette)
- Rename section headings inline
- Reorder entries within a section (separate from section-level reorder)

### Epic: Properties Panel
- Font size controls (`@radix-ui/react-slider`)
- Spacing controls
- Color picker for section accent color
- Section visibility toggle (`@radix-ui/react-switch`)
- ATS tip per selected section (inline contextual hint)

---

## 📤 PHASE 5 — Export & Code Features

**Milestone: Export + HTML visibility complete**

### Epic: HTML Code Viewer / Editor
- Generate full HTML document (`<html>`, `<head>`, `<body>`, Tailwind CDN link) from current CV state
- Display in `@uiw/react-codemirror` with `@codemirror/lang-html` for syntax highlighting
- **Editable**: changes in the editor update the CV state live *(Phase 2 original requirement)*
- Copy-to-clipboard button

### Epic: PDF Export
- CSS `@media print` stylesheet as zero-dependency baseline
- `jspdf` + `html2canvas` for UI-triggered PDF download
- Multi-page handling: `html2canvas` captures full scrollHeight; `jspdf` slices into A4 pages
- Filename input before download

### Epic: DOCX Export
- JSON→DOCX transformer using `docx` library
- Map section types → DOCX elements: `Heading1`, `Heading2`, `Paragraph`, `UnorderedList`
- Preserve heading hierarchy for ATS parsers
- `file-saver` triggers download

### Epic: Print Styles
- `@media print` stylesheet hides editor chrome (sidebars, toolbar, guides)
- Page break rules (`break-before`, `break-after`) on section boundaries
- Test print preview in Chrome and Safari

---

## 💾 PHASE 6 — Persistence & CV Manager

**Milestone: Users can save/load/manage CVs**

### Epic: Auto-Save *(new)*
- Debounced auto-save to localStorage on every state change (500ms debounce)
- "Unsaved changes" dirty-state dot indicator in navbar
- Recovery prompt on app load if an unsaved session is detected

### Epic: Local Storage System
- Save CV JSON (validated against Zod schema) to localStorage
- Load CV with schema migration if version mismatch
- Delete CV
- Handle quota-exceeded error using utility from Phase 1

### Epic: CV Manager UI
- List saved CVs with name + last-modified timestamp
- Rename CV (inline edit)
- Duplicate CV
- Select / switch active CV
- Delete with confirmation (`@radix-ui/react-alert-dialog`)

### Epic: Import / Export CV Data
- Export CV as `.json` file via `file-saver`
- Import `.json` file → validate with Zod schema → load into builder
- Clear error message for invalid/corrupt files (via `sonner` toast)

---

## 🤖 PHASE 7 — ATS Intelligence System

**Milestone: Real-time scoring + recommendations**

> Scoring rules are locked in Phase 0. This phase implements the engine and UI.

### Epic: ATS Rule Engine
- Implement scoring algorithm from Phase 0 rule set
- Score output: 0–100 with per-dimension breakdown (completeness, keywords, formatting)

### Epic: Real-Time Analysis
- Parse CV state live on every edit with debounce (300ms) to avoid thrashing
- Calculate score and per-section issue flags
- Highlight sections with issues directly on canvas (red/orange border indicator)

### Epic: Score Visualization
- Radial score gauge using `recharts` RadialBarChart
- Per-dimension breakdown bars
- Color coding: 0–49 red, 50–74 amber, 75–100 green

### Epic: Recommendations Panel
- Show actionable warnings: too many columns, missing key sections, no action verbs, sparse content
- One-click apply for safe suggestions (e.g., "Add a Summary section")

---

## 🌍 PHASE 8 — Internationalization (i18n)

**Milestone: Multi-language CV support**

> i18n is scaffolded in Phase 1 and `date-fns` locale integration is already wired. This phase adds content and RTL.

### Epic: Multi-language UI
- Complete translation files for supported languages (English + Arabic minimum)
- Language switcher in settings panel

### Epic: Multi-language CV Content
- CV content fields accept any language input
- Section heading defaults per locale (e.g., "Experience" → "الخبرة")
- `date-fns` locale formats dates correctly per active locale

### Epic: RTL Support
- Arabic layout via `dir="rtl"` on `<html>` + logical CSS properties (already used from Phase 0)
- Canvas mirrors correctly in RTL
- Test PDF and DOCX export in RTL mode

---

## 🌙 PHASE 9 — Advanced UX & Polish

**Milestone: Production-grade UX**

### Epic: Preview Mode
- Full-screen CV view (hide all editor panels)
- Exit with `Escape` or button

### Epic: Dark Mode
- Theme toggle using shadcn's class-based dark mode (`dark` class on `<html>`)
- System preference detection via `prefers-color-scheme` media query
- Persist choice in localStorage

### Epic: Mobile Optimization
- Disable pinch-zoom on canvas element only (`touch-action: none`)
- Responsive canvas scaling (CSS `transform: scale()` to fit viewport width)
- Test on real iOS Safari 17 and Android Chrome 120

---

## 🧪 PHASE 10 — Testing & Performance

**Milestone: Stable, fast, production-ready app**

### Epic: Unit & Integration Tests
- Unit tests (Vitest + `@testing-library/react`): all section renderer components, Zod schemas, export utilities, ATS scoring algorithm
- Integration tests: drag-drop reorder, undo/redo stack, import/export round-trip
- Snapshot tests: HTML output from renderer for each template × section type

### Epic: E2E Tests
- Playwright test suite for critical flows:
  - Create CV → add sections → edit content → export PDF
  - Import JSON → verify loaded state
  - Template switch → verify ATS score updates
  - Undo/redo 5 steps

### Epic: a11y Tests
- `axe-core` integration in Vitest for canvas elements and modals
- Keyboard-only navigation test for full drag-drop flow

### Epic: Performance Optimization
- `React.memo`, `useMemo`, `useCallback` on expensive render paths
- Profile with React DevTools — identify and fix top re-render sources
- Debounce audit: confirm ATS scoring and auto-save are debounced correctly
- *(No virtualization — a CV has too few elements to ever need it)*

### Epic: Cross-Browser Testing
- Desktop: Chrome, Safari, Edge
- Mobile: iOS Safari 17, Android Chrome 120

---

## 🚀 PHASE 11 — Deployment

**Milestone: Live production app**

### Epic: Build & Optimization
- Production Vite build config
- Asset optimization (code splitting, tree shaking)
- Environment variable setup (no secrets — client-only app)

### Epic: CI/CD Pipeline *(new)*
- GitHub Actions workflow: lint → type-check → Vitest → Playwright → build on every PR
- Block merges on any failing check

### Epic: Deployment
- Deploy to Vercel (recommended — zero config for Vite SPAs)
- Alternative: Netlify

### Epic: Documentation & Monitoring
- README: `pnpm install && pnpm dev`, build steps, deploy instructions
- Usage guide (key shortcuts, export options, ATS tips)
- Error monitoring: Sentry free tier (source maps uploaded in CI)

---

## 📊 Final Milestones Summary

| # | Milestone |
|---|-----------|
| 1 | ✅ Architecture + Schema (Zod) + ATS Rules Approved |
| 2 | ✅ UI Shell (i18n scaffold + error handling + resizable panels) |
| 3 | ✅ CV Rendering Engine (3 templates) |
| 4 | ✅ Drag & Drop Builder (undo/redo + keyboard a11y) |
| 5 | ✅ Inline Editing (react-hook-form + date-fns + cmdk) |
| 6 | ✅ Export System (PDF + DOCX + Print + CodeMirror editor) |
| 7 | ✅ Persistence Layer (auto-save + CV manager) |
| 8 | ✅ ATS Scoring (recharts visualization) |
| 9 | ✅ i18n + RTL |
| 10 | ✅ Production Ready (Vitest + Playwright + axe-core) |
| 11 | ✅ Live Deployment (CI/CD + Sentry) |

---

## 🔮 Future Enhancements (Post-MVP)

### AI & Intelligence
- AI-generated CV content (OpenAI integration)
- Job description paste & match (CV vs JD keyword gap analysis)
- Auto keyword optimization

### Collaboration
- Share CV via link
- Real-time collaboration (like Google Docs)

### Advanced Templates
- Industry-specific templates
- Designer templates (still ATS-safe)

### Import
- PDF import & text extraction to pre-populate fields
- LinkedIn profile import

### Cloud Sync
- User accounts + cloud storage

### Versioning
- CV history timeline with restore

### Content Assistance
- Pre-written bullet point suggestions per job title
- Section snippet marketplace

### Privacy
- Privacy mode: blur PII on canvas for screenshots/screenshares

### Analytics
- Recruiter engagement tracking (if CV is shared)
