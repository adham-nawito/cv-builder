# CVForge

A browser-based CV builder that lets you compose, edit, and export a professional resume entirely in the browser — no account or server required. Everything is stored in `localStorage`.

![CVForge screenshot](public/screenshot.png)

## Features

### Editor
- **Drag-and-drop section palette** — add Personal Info, Summary, Experience, Education, Skills, Projects, Certifications, Languages, or a custom HTML block from the side panel
- **Inline editing** — click any section on the canvas to edit it in place; changes are reflected immediately in the preview
- **Undo / redo** — full history stack (keyboard shortcuts `Ctrl+Z` / `Ctrl+Shift+Z`)
- **Section reordering** — drag sections up and down on the canvas
- **Lock / hide sections** — prevent accidental edits or hide a section without deleting it
- **Per-section font size and spacing overrides** — fine-tune spacing without touching the template

### Templates
Five built-in visual templates:

| Template | Style |
|---|---|
| Classic | Clean, traditional two-column header |
| Modern | Accent-color sidebar |
| Minimal | White space, no decorations |
| Executive | Bold headings, serif feel |
| Creative | Coloured header band |

Switch templates live — the same content re-renders instantly.

### ATS Score
A real-time ATS (Applicant Tracking System) score panel grades your CV from F to A+ across six categories:

- **Personal Info** (contact completeness, job title)
- **Summary** (length, power-verb usage)
- **Experience** (bullet count, quantified achievements, power verbs)
- **Education** (degree, institution)
- **Skills** (category count, skill count)
- **Languages** (items with proficiency level)

The panel highlights which sections need attention and shows actionable tips sorted by severity (critical → warning → suggestion).

### Export
- **PDF** — high-resolution A4 via `html2canvas` + `jsPDF`
- **HTML** — self-contained single-file HTML you can host anywhere
- **DOCX** — Word-compatible document via `docx`

### Import
- **JSON file** — re-import a previously exported CVForge JSON
- **LinkedIn PDF** — paste or upload a LinkedIn PDF export; the parser extracts name, headline, experience, education, and skills

### Internationalisation
The entire UI is available in **7 languages**: English, French, German, Spanish, Arabic (RTL), Chinese, Japanese. Switch language from the Navbar; CV date strings (e.g. "Jan 2021", "2018-05") are re-formatted with the active locale automatically.

### Multiple CVs & session recovery
- Save and manage multiple named CVs from the Manage panel
- Duplicate an existing CV as a starting point
- If you close the tab mid-edit, a recovery prompt offers to restore the unsaved draft on next visit

### Dark mode
Full dark-mode support for the editor UI. The CV canvas itself always renders in light mode so the exported output matches what employers see.

## Tech stack

| Layer | Library |
|---|---|
| UI framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| State management | React Context + `useReducer` |
| Schema validation | Zod |
| PDF export | html2canvas + jsPDF |
| DOCX export | docx |
| Date formatting | date-fns |
| Testing | Vitest + Testing Library + jest-axe |
| E2E testing | Playwright |

## Getting started

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

```bash
pnpm build        # production build → dist/
pnpm test         # unit + component tests (Vitest)
pnpm test:e2e     # end-to-end tests (Playwright)
```

## Project structure

```
src/
├── components/
│   ├── cv/           # Editor panels, canvas, section renderers
│   └── ui/           # shadcn/ui primitives
├── lib/
│   ├── storage.ts    # localStorage persistence
│   ├── dateFormat.ts # locale-aware CV date formatting
│   └── translations.ts
├── schemas/
│   └── cv.ts         # Zod schemas + validateCVData()
├── types/
│   └── cv.ts         # TypeScript interfaces
├── utils/
│   ├── atsScore.ts   # ATS scoring engine
│   ├── exportUtils.ts / exportDocx.ts / generateHTML.ts
│   ├── linkedinParser.ts
│   └── migrateSchema.ts
└── test/             # Vitest unit + component + a11y tests
e2e/                  # Playwright end-to-end tests
```

## Storage

All CV data is persisted in the browser's `localStorage` under two keys:

| Key | Contents |
|---|---|
| `cvforge:cvs` | Array of all saved CVs (JSON) |
| `cvforge:active` | ID of the last active CV |

Each item is validated against the Zod schema on load and silently dropped if it fails, protecting against corrupted or legacy data. A schema migration layer (`migrateSchema`) handles version upgrades automatically.

## Accessibility

All section renderers are tested with `jest-axe` (axe-core) to ensure zero WCAG violations out of the box.

## License

MIT
