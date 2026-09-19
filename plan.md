# Frontend Implementation Plan: Collaborative Document Platform (`apps/web`)

> Product name is a placeholder: **"Docly"**. Keep it in a single constant (`lib/constants.ts`) so renaming is a one-line change.
> Scope: UI only. No auth, DB, WebSockets, Yjs, Tiptap, or real API calls. Everything runs on mock data and local UI state.

---

## Table of Contents

1. [Guiding Architectural Decisions](#1-guiding-architectural-decisions)
2. [Route Map & Layouts](#2-route-map--layouts)
3. [Folder Structure](#3-folder-structure)
4. [Component Architecture](#4-component-architecture)
5. [shadcn/ui Component Inventory](#5-shadcnui-component-inventory)
6. [Mock Data Architecture](#6-mock-data-architecture)
7. [Design System](#7-design-system)
8. [Page Specifications](#8-page-specifications)
9. [Responsive / Mobile Strategy](#9-responsive--mobile-strategy)
10. [UI States Matrix](#10-ui-states-matrix)
11. [UX Behavior & State Transitions](#11-ux-behavior--state-transitions)
12. [Future Backend Compatibility](#12-future-backend-compatibility)
13. [Implementation Phases](#13-implementation-phases)
14. [Single Recommended Sequential Plan](#14-single-recommended-sequential-plan)

---

## 1. Guiding Architectural Decisions

These decisions shape everything else. Each one has a reason.

| # | Decision | Why |
|---|----------|-----|
| 1 | **Feature-based folders** (`features/auth`, `features/documents`, `features/editor`, `features/marketing`) instead of one flat `components/` folder. | The editor will grow (Tiptap, Yjs, comments, presence). Feature folders keep that growth contained and make deletion/replacement easy. |
| 2 | **A data-access layer between UI and mock data.** Components never import mock files. They call functions such as `listDocuments(query)` from `lib/data/`. | This is the most important decoupling. Today those functions return Promises resolved from mock data with simulated latency. Later the same signatures call `fetch`. UI code doesn't change. |
| 3 | **URL is the state for dashboard search/filter/sort/view.** (`?q=&type=&owner=&sort=&view=`) | Shareable, survives refresh, back/forward works, and it maps 1:1 to future server-side query params. |
| 4 | **Three route groups, three layouts:** `(marketing)`, `(auth)`, `(app)`. The editor gets its own full-screen layout (no sidebar). | Each area has a different chrome. Route groups keep layouts clean without affecting URLs. |
| 5 | **The editor sits behind a boundary.** The toolbar talks to an `EditorController` interface (state + commands), not to a specific engine. | The mock implements it now. Tiptap implements it later. The toolbar and top bar never change. |
| 6 | **Collaboration/sync state is a provider**, `DocumentSessionProvider`, exposing `syncStatus`, `collaborators` (presence), and `connection`. | Yjs awareness and provider events map directly onto it later. No prop drilling. |
| 7 | **Mock content uses the Tiptap/ProseMirror JSON shape.** | When Tiptap arrives, stored/mock content loads with zero conversion. |
| 8 | **Server Components by default; `"use client"` only where interaction is needed** (forms, dropdowns, editor, filters). | Smaller bundles, and initial data fetching works the same way it will with a real API. |
| 9 | **No global state library.** Use `useState`/`useReducer`, URL params, React context (session only), and React Hook Form + Zod for forms. | Avoids over-engineering. Add TanStack Query only when the real API arrives. |
| 10 | **Reuse one `DocumentBrowser` for six routes** (dashboard, documents, recent, starred, shared, trash) via a `scope` prop. | Avoids six near-duplicate pages. Only the header text, empty state, and available actions differ per scope. |
| 11 | **Design tokens live in CSS variables** (shadcn convention). Components use semantic classes (`bg-background`, `text-muted-foreground`), never raw colors. | Theming, dark mode, and later brand tweaks happen in one file. |

---

## 2. Route Map & Layouts

```text
/                          Landing                    (marketing layout)
/login                     Login                      (auth layout)
/register                  Register                   (auth layout)
/dashboard                 Home: greeting, recent, all docs   (app layout)
/documents                 All documents / My Files           (app layout)
/recent                    Recently opened                    (app layout)
/starred                   Starred                            (app layout)
/shared                    Shared with me                     (app layout)
/trash                     Trash                              (app layout)
/settings                  Settings (tabbed stub)             (app layout)
/documents/new             New blank document                 (app layout, no browser)
/documents/[documentId]    Editor                             (editor layout, full-screen)
```

### Layout responsibilities

| Layout | Contains | Notes |
|--------|----------|-------|
| `app/layout.tsx` (root) | Fonts, `ThemeProvider`, `Toaster` (Sonner), `<html>` setup | Only global providers live here. |
| `(marketing)/layout.tsx` | `MarketingNavbar`, `MarketingFooter` | Public pages. |
| `(auth)/layout.tsx` | Split layout: form on one side, brand/quote panel on the other (hidden below `lg`) | Shared by login and register. |
| `(app)/layout.tsx` | `SidebarProvider`, `AppSidebar`, `AppHeader`, main content slot | Later: this layout is where the session check lives. |
| `(editor)/layout.tsx` | Bare full-height shell | Editor manages its own top bar and toolbar. It lives in a **separate route group** so it doesn't inherit the sidebar. |

> **Note:** `/documents/new` and `/documents/[documentId]` share a URL prefix but sit in different route groups. `/documents/new` is a *static* segment so it always wins over `[documentId]`.

> **Next.js note:** In current versions of the App Router, `params` and `searchParams` are **Promises** in server components. Use `await params` / `await searchParams`.

---

## 3. Folder Structure

```text
apps/web/
├─ app/
│  ├─ layout.tsx                        # Root: fonts, ThemeProvider, Toaster
│  ├─ globals.css                       # Tailwind + design tokens + .doc-prose styles
│  ├─ not-found.tsx
│  ├─ error.tsx                         # Global error boundary
│  │
│  ├─ (marketing)/
│  │  ├─ layout.tsx                     # Navbar + Footer
│  │  └─ page.tsx                       # Landing: composes sections only
│  │
│  ├─ (auth)/
│  │  ├─ layout.tsx                     # Split auth layout
│  │  ├─ login/page.tsx
│  │  └─ register/page.tsx
│  │
│  ├─ (app)/
│  │  ├─ layout.tsx                     # SidebarProvider + AppSidebar + AppHeader
│  │  ├─ dashboard/
│  │  │  ├─ page.tsx
│  │  │  └─ loading.tsx                 # Skeleton
│  │  ├─ documents/
│  │  │  ├─ page.tsx                    # scope="all"
│  │  │  ├─ loading.tsx
│  │  │  └─ new/page.tsx                # New blank document
│  │  ├─ recent/page.tsx                # scope="recent"
│  │  ├─ starred/page.tsx               # scope="starred"
│  │  ├─ shared/page.tsx                # scope="shared"
│  │  ├─ trash/page.tsx                 # scope="trash"
│  │  └─ settings/page.tsx
│  │
│  └─ (editor)/
│     └─ documents/[documentId]/
│        ├─ layout.tsx                  # Full-screen shell
│        ├─ page.tsx                    # Loads doc, renders <EditorShell />
│        ├─ loading.tsx                 # Editor skeleton
│        └─ error.tsx                   # Editor-specific error UI
│
├─ components/                          # ONLY global + shadcn
│  ├─ ui/                               # shadcn/ui primitives (generated, lightly customized)
│  ├─ layout/
│  │  ├─ logo.tsx
│  │  ├─ theme-toggle.tsx
│  │  ├─ user-menu.tsx                  # Avatar + dropdown (used in app header and editor)
│  │  ├─ page-header.tsx                # Title + description + actions slot
│  │  └─ container.tsx                  # max-width + horizontal padding
│  ├─ feedback/
│  │  ├─ empty-state.tsx                # Icon + title + description + action
│  │  ├─ error-state.tsx                # Icon + message + retry
│  │  └─ confirm-dialog.tsx             # Wrapper over AlertDialog
│  └─ providers/
│     └─ theme-provider.tsx
│
├─ features/
│  ├─ marketing/
│  │  ├─ components/
│  │  │  ├─ navbar.tsx
│  │  │  ├─ mobile-nav.tsx              # Sheet-based
│  │  │  ├─ footer.tsx
│  │  │  ├─ hero.tsx
│  │  │  ├─ product-preview.tsx         # Static editor mockup (pure JSX, not the real editor)
│  │  │  ├─ features-grid.tsx
│  │  │  ├─ feature-spotlight.tsx       # Reusable image+text row (collab / docs / realtime)
│  │  │  ├─ security-section.tsx
│  │  │  ├─ how-it-works.tsx
│  │  │  ├─ cta-section.tsx
│  │  │  └─ section.tsx                 # Section wrapper (spacing, eyebrow, heading)
│  │  └─ content.ts                     # Copy, feature lists, nav links (data, not JSX)
│  │
│  ├─ auth/
│  │  ├─ components/
│  │  │  ├─ auth-card.tsx               # Heading + subheading + children + footer link
│  │  │  ├─ login-form.tsx
│  │  │  ├─ register-form.tsx
│  │  │  ├─ password-input.tsx          # Show/hide toggle
│  │  │  ├─ password-strength.tsx
│  │  │  ├─ social-buttons.tsx          # Placeholder Google / GitHub
│  │  │  ├─ form-alert.tsx              # Form-level error/success
│  │  │  └─ auth-brand-panel.tsx        # Right-side panel on desktop
│  │  ├─ schemas.ts                     # Zod: loginSchema, registerSchema
│  │  ├─ password-strength.ts           # Pure scoring function
│  │  └─ auth-client.ts                 # MOCK auth calls (signIn/signUp) behind an interface
│  │
│  ├─ documents/                        # Dashboard + doc list domain
│  │  ├─ components/
│  │  │  ├─ document-browser.tsx        # Client: orchestrates toolbar + list + states
│  │  │  ├─ browser-toolbar.tsx         # Search + filters + sort + view toggle
│  │  │  ├─ search-input.tsx            # Debounced, writes ?q=
│  │  │  ├─ filter-controls.tsx         # Type + owner filters
│  │  │  ├─ sort-select.tsx
│  │  │  ├─ view-toggle.tsx
│  │  │  ├─ document-grid.tsx
│  │  │  ├─ document-list.tsx           # Table-style rows
│  │  │  ├─ document-card.tsx
│  │  │  ├─ document-row.tsx
│  │  │  ├─ document-actions-menu.tsx   # DropdownMenu + ContextMenu content, shared
│  │  │  ├─ document-icon.tsx           # Icon + color by document type
│  │  │  ├─ collaborator-stack.tsx      # Overlapping avatars, "+N"
│  │  │  ├─ recent-documents.tsx        # Horizontal strip on the dashboard
│  │  │  ├─ rename-dialog.tsx
│  │  │  ├─ documents-skeleton.tsx
│  │  │  ├─ documents-empty.tsx         # Per-scope empty states
│  │  │  └─ no-results.tsx
│  │  ├─ hooks/
│  │  │  ├─ use-document-query-params.ts   # Read/write URL state
│  │  │  └─ use-local-documents.ts         # Local optimistic state (star/rename/trash)
│  │  ├─ scopes.ts                      # Scope config: title, empty copy, allowed actions
│  │  ├─ new-document/
│  │  │  ├─ new-document-card.tsx
│  │  │  └─ template-option.tsx         # Disabled "coming soon" placeholders (optional)
│  │  └─ share/
│  │     └─ share-dialog.tsx            # Used from both dashboard menu and editor
│  │
│  ├─ app-shell/
│  │  ├─ app-sidebar.tsx
│  │  ├─ sidebar-nav.tsx                # Data-driven from nav config
│  │  ├─ sidebar-user.tsx
│  │  ├─ app-header.tsx                 # Mobile trigger + breadcrumb/title + search trigger
│  │  ├─ command-menu.tsx               # Cmd/Ctrl+K palette
│  │  ├─ new-file-button.tsx
│  │  └─ nav-config.ts
│  │
│  └─ editor/
│     ├─ components/
│     │  ├─ editor-shell.tsx            # Composes everything; provides contexts
│     │  ├─ editor-top-bar.tsx
│     │  ├─ document-title-input.tsx    # Inline-editable title
│     │  ├─ sync-status.tsx             # Badge: Saved / Saving / Syncing / Offline / Error
│     │  ├─ presence-avatars.tsx        # Collaborator avatars with colored rings
│     │  ├─ editor-more-menu.tsx
│     │  ├─ editor-toolbar.tsx          # Composes groups
│     │  ├─ toolbar-button.tsx          # Toggle + Tooltip + aria-pressed
│     │  ├─ toolbar-group.tsx
│     │  ├─ block-type-select.tsx       # Paragraph / H1 / H2 / H3
│     │  ├─ link-popover.tsx
│     │  ├─ editor-surface.tsx          # THE swap point for Tiptap
│     │  ├─ mock-content-renderer.tsx   # Renders JSON content as styled HTML
│     │  ├─ page-canvas.tsx             # Page-like white sheet + width constraint
│     │  ├─ editor-skeleton.tsx
│     │  └─ editor-error.tsx
│     ├─ engine/
│     │  ├─ types.ts                    # EditorController, EditorState, EditorCommands
│     │  ├─ mock-controller.ts          # useMockEditorController() hook
│     │  └─ editor-context.tsx          # Provider + useEditorController()
│     └─ session/
│        ├─ types.ts                    # SyncStatus, Presence, ConnectionState
│        ├─ document-session-provider.tsx
│        ├─ mock-session-driver.ts      # Simulates saving → saved, fake presence
│        └─ dev-status-switcher.tsx     # Dev-only: force any sync state to test UI
│
├─ lib/
│  ├─ constants.ts                      # APP_NAME, route paths, limits
│  ├─ routes.ts                         # Typed route helpers: routes.document(id)
│  ├─ utils.ts                          # cn() (shadcn)
│  ├─ format.ts                         # formatRelativeTime, formatFileSize, initials
│  ├─ session.ts                        # getCurrentUser(): MOCK now, Better Auth later
│  ├─ data/                             # ★ Data-access layer (UI talks ONLY to this)
│  │  ├─ documents.ts                   # listDocuments, getDocument, createDocument, ...
│  │  ├─ workspaces.ts
│  │  ├─ users.ts
│  │  ├─ collaborators.ts
│  │  └─ delay.ts                       # simulateLatency(), simulateScenario()
│  └─ mock/                             # ★ Mock DB. Only lib/data imports from here.
│     ├─ users.ts
│     ├─ workspace.ts
│     ├─ documents.ts                   # ~20-30 realistic documents
│     ├─ document-content.ts            # Tiptap-JSON sample content
│     └─ index.ts
│
├─ hooks/                               # Generic hooks only
│  ├─ use-debounce.ts
│  ├─ use-media-query.ts
│  └─ use-mounted.ts
│
├─ types/                               # Domain types shared across features
│  ├─ user.ts
│  ├─ workspace.ts
│  ├─ document.ts
│  ├─ collaborator.ts
│  └─ api.ts                            # ListResponse<T>, ApiError
│
├─ config/
│  └─ site.ts                           # Metadata, social links
│
├─ public/
│  ├─ og-image.png
│  └─ images/                           # Landing illustrations if needed
│
├─ components.json                      # shadcn config
├─ next.config.ts
├─ tsconfig.json
└─ package.json
```

### Directory responsibilities

| Directory | Responsibility | Rule |
|-----------|----------------|------|
| `app/` | Routing, layouts, and thin `page.tsx` files that fetch data and compose feature components. | Pages contain no significant JSX beyond composition. |
| `components/ui/` | shadcn primitives. | Don't put app-specific logic here. |
| `components/layout`, `feedback` | Global components used by 2+ features. | If only one feature uses it, move it into that feature. |
| `features/*` | Everything domain-specific: components, hooks, schemas, config. | Features may import from `components/`, `lib/`, `types/`. **Features must not import from each other**, except `documents/share` used by `editor` (an allowed exception; if it grows, promote to `components/`). |
| `lib/data/` | Data-access layer, the only place that knows where data comes from. | UI imports from here, never from `lib/mock/`. |
| `lib/mock/` | Static mock DB. | Deleted when the real API arrives. |
| `types/` | Domain types shaped like future API responses. | Single source of truth for data shapes. |
| `hooks/` | Generic, feature-agnostic hooks. | Feature hooks live in their feature. |

---

## 4. Component Architecture

### 4.1 Global (used across features)

`Logo`, `ThemeToggle`, `UserMenu`, `PageHeader`, `Container`, `EmptyState`, `ErrorState`, `ConfirmDialog`, and the whole `components/ui/*` set.

### 4.2 Authentication (`features/auth`)

- **Reusable within auth:** `AuthCard`, `PasswordInput`, `SocialButtons`, `FormAlert`.
- **Page-specific:** `LoginForm`, `RegisterForm`, `PasswordStrength` (register only).
- **Non-UI logic:** `schemas.ts` (Zod), `password-strength.ts` (pure function, unit-testable), `auth-client.ts` (mock now).

### 4.3 Dashboard / Documents (`features/documents` + `features/app-shell`)

- **Reusable:** `DocumentIcon`, `CollaboratorStack`, `DocumentActionsMenu`, `ShareDialog`, `RenameDialog`.
- **Composed:** `DocumentCard` and `DocumentRow` both render the same data with different layouts, and both use `DocumentActionsMenu`.
- **Orchestrator:** `DocumentBrowser` (client) reads URL params, applies filtering/sorting/searching to server-provided data, and renders grid/list/skeleton/empty/no-results/error.
- **Page-specific:** `RecentDocuments` strip (dashboard only), greeting header (dashboard only).

### 4.4 Editor (`features/editor`)

- **Shell:** `EditorShell` composes providers → `EditorTopBar` → `EditorToolbar` → `PageCanvas` → `EditorSurface`.
- **Swap point:** `EditorSurface`. Today it renders `MockContentRenderer`. Later it renders `<EditorContent editor={editor} />`.
- **Independent of engine:** `EditorToolbar`, `ToolbarButton`, `BlockTypeSelect`, `LinkPopover` (all consume `useEditorController()`).
- **Independent of collab layer:** `SyncStatus`, `PresenceAvatars` (all consume `useDocumentSession()`).

### 4.5 Composition rules

1. `page.tsx` files fetch data and compose. They should be ≤ ~40 lines.
2. A component over ~150 lines is a signal to split it.
3. Compose using `children`/slots (`PageHeader` has `actions`, `AuthCard` has `footer`) instead of long prop lists.
4. Data-driven repetition: nav items, features, footer links, and toolbar groups are config arrays mapped into components, never copy-pasted JSX.

---

## 5. shadcn/ui Component Inventory

Install with `pnpm dlx shadcn@latest add <name>` from inside `apps/web`.

| Component | Used for |
|-----------|----------|
| `button` | Everywhere. Variants: `default`, `secondary`, `outline`, `ghost`, `destructive`, `link`. |
| `input`, `label`, `textarea` | Auth forms, search, share dialog, rename. |
| `form` (react-hook-form integration) | Login/register forms with Zod. |
| `checkbox` | Remember me, terms. |
| `card` | Document cards, auth card, feature cards, new-document card. |
| `dialog` | Share dialog, rename dialog. |
| `alert-dialog` | Confirm delete / delete permanently / empty trash. |
| `dropdown-menu` | Document actions, user menu, editor "more" menu, filter menus. |
| `context-menu` | Right-click on document cards/rows (same content as dropdown). |
| `sheet` | Marketing mobile nav, mobile filter panel. (Sidebar uses it internally on mobile.) |
| `sidebar` | App shell sidebar, with collapse-to-icons, mobile sheet, and keyboard shortcut built in. |
| `avatar` | Users, collaborators. |
| `badge` | File type, sync status, role labels. |
| `tooltip` | Toolbar buttons, collapsed sidebar icons, avatars. |
| `separator` | Toolbar groups, menus, footer. |
| `tabs` | Settings sections. |
| `skeleton` | All loading states. |
| `select` | Sort, block type, share role, general access. |
| `toggle`, `toggle-group` | Toolbar buttons, alignment group, grid/list toggle. |
| `command` | Command palette (Cmd/Ctrl+K). |
| `breadcrumb` | App header breadcrumb, editor top bar (optional). |
| `alert` | Form-level errors, offline banner, dashboard error. |
| `sonner` | Toasts (copy link, moved to trash, etc.). |
| `scroll-area` | Share dialog people list, command palette, mobile toolbar. |
| `popover` | Link editor popover, filter popover. |
| `progress` | Optional for password strength, or use a custom 4-segment bar (see below). |
| `switch` | Settings stubs. |
| `collapsible` | Optional: sidebar sections. |
| `table` | Optional: list view. A CSS-grid row list is often better for responsive. |

### Where a custom component is better

- **Password strength bar:** a 4-segment custom bar is simpler and clearer than `Progress`.
- **Document list rows / cards:** custom composition over `Card` and plain elements.
- **Sync status pill:** custom small component using `Badge` styles plus an icon, since it needs animated icon states.
- **Collaborator stack:** custom overlapping layout with `Avatar` children.
- **Editor page canvas:** plain `div` with Tailwind, and no shadcn equivalent.
- **Landing sections:** plain semantic HTML plus Tailwind.

---

## 6. Mock Data Architecture

### 6.1 Principles

1. **Types first.** Define types in `types/` shaped like realistic API JSON: string IDs, ISO date strings (not `Date` objects), no UI-only fields.
2. **Mock DB in `lib/mock/`.** Static arrays and objects. Nothing outside `lib/data/` imports it.
3. **Data layer in `lib/data/`.** Async functions with the exact signatures the real API layer will have. Add simulated latency and scenario switches.
4. **Dates as ISO strings.** Format at the edge with `formatRelativeTime()`. Server → client serialization is then trivial.
5. **Derived fields are computed in UI, not stored.** Example: "Starred" is a boolean on the document (from the user's perspective), but `isOwnedByMe` is derived by comparing `ownerId` to the current user.

### 6.2 Type definitions

```ts
// types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;          // avatar URL
  createdAt: string;             // ISO
}

// types/workspace.ts
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: "free" | "pro" | "team";
  memberCount: number;
}

// types/collaborator.ts
export type CollaboratorRole = "owner" | "editor" | "commenter" | "viewer";

export interface Collaborator {
  userId: string;
  name: string;
  email: string;
  image: string | null;
  role: CollaboratorRole;
  color: string;                 // cursor/presence color (used by Yjs awareness later)
}

// types/document.ts
export type DocumentType = "document" | "note" | "spec" | "meeting" | "wiki";  // "file type" shown in UI

export interface DocumentFileMeta {
  type: DocumentType;
  wordCount: number;
  sizeBytes: number;
  version: number;
}

export interface DocumentSummary {          // what LISTS return (lightweight)
  id: string;
  title: string;
  workspaceId: string;
  ownerId: string;
  owner: Pick<User, "id" | "name" | "image">;
  collaborators: Collaborator[];            // may be truncated by the API (with a count)
  collaboratorCount: number;
  meta: DocumentFileMeta;
  isStarred: boolean;                       // per-user
  visibility: "private" | "shared" | "workspace";
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string | null;              // per-user; powers "Recent"
  trashedAt: string | null;                 // non-null = in trash
}

export interface DocumentDetail extends DocumentSummary {   // what GET by id returns
  content: TiptapJSON;                                      // { type: "doc", content: [...] }
  currentUserRole: CollaboratorRole;
}

// types/api.ts
export interface ListResponse<T> {
  items: T[];
  total: number;
  nextCursor: string | null;                // ready for pagination later
}

export interface DocumentListQuery {
  scope: "all" | "recent" | "starred" | "shared" | "trash";
  q?: string;
  type?: DocumentType | "all";
  owner?: "me" | "others" | "all";
  sort?: "modified-desc" | "modified-asc" | "name-asc" | "name-desc" | "created-desc";
  limit?: number;
  cursor?: string;
}
```

**Mapping to the requested shapes:**

| Requested | Type |
|-----------|------|
| User | `User` |
| Workspace | `Workspace` |
| Document | `DocumentSummary` / `DocumentDetail` |
| Collaborator | `Collaborator` |
| Recent document | Not a separate type. It's a `DocumentSummary` with `lastOpenedAt` set, sorted by that field. Fewer types, and it mirrors how a backend would implement it. |
| File metadata | `DocumentFileMeta` |

### 6.3 Data layer signatures (these stay stable when the API arrives)

```ts
// lib/data/documents.ts
listDocuments(query: DocumentListQuery): Promise<ListResponse<DocumentSummary>>
getDocument(id: string): Promise<DocumentDetail | null>
createDocument(input: { title?: string; workspaceId: string }): Promise<DocumentSummary>
renameDocument(id: string, title: string): Promise<void>
setStarred(id: string, starred: boolean): Promise<void>
trashDocument(id: string): Promise<void>
restoreDocument(id: string): Promise<void>
deleteDocumentForever(id: string): Promise<void>

// lib/session.ts
getCurrentUser(): Promise<User>
getCurrentWorkspace(): Promise<Workspace>
```

### 6.4 Simulating states without a backend

`lib/data/delay.ts` provides `simulateLatency(ms)` and reads a **dev-only scenario** from a search param or cookie:

- `?mock=slow` adds 2s latency, so you can see skeletons.
- `?mock=empty` returns zero documents.
- `?mock=error` throws from `listDocuments`.

This lets you visually test every dashboard state without editing mock files. Gate it with `process.env.NODE_ENV !== "production"`.

### 6.5 Handling mutations in a mock world

The mock DB is static, and server module state is unreliable across requests, so:

- **Initial data:** fetched in server components via `lib/data`.
- **Mutations** (star, rename, trash, restore): held in **client-side local state** in `useLocalDocuments()`, initialized from server props. Each action also calls the async `lib/data` function (which today just resolves after a delay) and shows a toast.
- When the real API arrives, those same calls hit the server, and the local state becomes an optimistic update layer (`useOptimistic` or TanStack Query). The UI is unchanged.
- **New document:** `createDocument` returns a mock ID (`doc_<random>`). The editor route treats an unknown-but-well-formed ID as a blank document, so the flow works end to end.

### 6.6 Realistic mock content

- Current user: "Alex Morgan".
- ~6 other users with varied avatars (initials fallback) and presence colors.
- 20 to 30 documents: product specs, meeting notes, engineering RFCs, onboarding wiki, roadmap, etc. Varied dates (minutes ago → months ago), some starred, a few shared with me, a couple in trash, varying collaborator counts (0–6).
- 2 to 3 documents with rich Tiptap-JSON content (headings, paragraphs, bullet/ordered lists, blockquote, code block, link). One with empty content.
- Include edge cases: a very long title (tests truncation), a doc with no collaborators, a doc with 8 collaborators (tests "+N").

---

## 7. Design System

Feel: **modern developer/productivity SaaS**. Calm, neutral, high legibility, one accent color. Similar in spirit to Linear/Notion/Vercel. No decorative gradients (at most one very subtle hero backdrop), no bouncy animations.

### 7.1 Color tokens

Use shadcn's CSS-variable convention in `globals.css` with a **neutral (zinc/slate) base** and an **indigo/blue-violet primary**. Provide light and dark values.

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--background` | white / zinc-50 | zinc-950 | App page background |
| `--foreground` | zinc-950 | zinc-50 | Primary text |
| `--card` | white | zinc-900 | Surfaces: cards, popovers, canvas |
| `--muted` | zinc-100 | zinc-800 | Subtle fills, skeletons, hover |
| `--muted-foreground` | zinc-500 | zinc-400 | Secondary text, metadata |
| `--border` | zinc-200 | zinc-800 | Borders, dividers |
| `--input` | zinc-200 | zinc-800 | Input borders |
| `--ring` | primary at ~40% | same | Focus rings |
| `--primary` | indigo-600 | indigo-500 | Primary actions, links, active nav |
| `--primary-foreground` | white | white | Text on primary |
| `--secondary` | zinc-100 | zinc-800 | Secondary buttons |
| `--accent` | zinc-100 | zinc-800 | Hover state for menu items/sidebar |
| `--destructive` | red-600 | red-500 | Destructive actions, errors |
| `--success` (custom) | emerald-600 | emerald-500 | Saved, success |
| `--warning` (custom) | amber-600 | amber-500 | Offline, syncing warnings |
| `--sidebar-*` | Slightly off-background surface | Slightly off-background surface | Sidebar surface and borders |

- **App background** is `zinc-50` (light) so white cards/canvas lift visibly. The editor "page" is `bg-card` on a `bg-muted/40` desk.
- **Document type colors** (icons only, low saturation, always paired with an icon for accessibility): document = blue, note = amber, spec = violet, meeting = emerald, wiki = rose.
- **Collaborator/presence colors:** a fixed palette of 8 distinguishable colors, stored on `Collaborator.color` and used for avatar ring and (later) Yjs cursors.
- Verify contrast (WCAG AA) for `muted-foreground` on `background`.

### 7.2 Text hierarchy

| Level | Classes | Use |
|-------|---------|-----|
| Display | `text-5xl md:text-6xl font-semibold tracking-tight` | Landing hero only |
| H1 | `text-3xl font-semibold tracking-tight` | Landing section titles, page titles |
| H2 | `text-2xl font-semibold tracking-tight` | Section headings |
| Page title (app) | `text-2xl font-semibold tracking-tight` | Dashboard headers |
| H3 | `text-lg font-medium` | Card titles, dialog titles |
| Body | `text-sm` (app) / `text-base` (marketing) | Default |
| Secondary | `text-sm text-muted-foreground` | Descriptions |
| Caption | `text-xs text-muted-foreground` | Metadata, timestamps |

### 7.3 Typography

- **UI font:** Geist Sans (via `next/font`; Inter is an acceptable alternative). Variable weight.
- **Mono font:** Geist Mono for code and code blocks.
- **Editor body:** same sans font at `text-base`/`text-[17px]`, `leading-7`/`leading-relaxed`, max width ~`720px`. An optional serif toggle can be a later enhancement.
- Enable `font-feature-settings` for tabular numbers on dates/counts (`tabular-nums`).

### 7.4 Spacing, radius, shadows

| Aspect | Rule |
|--------|------|
| Spacing scale | Tailwind default 4px grid. Prefer `gap-2/3/4/6`, `p-4/6`. Section spacing on marketing: `py-20 md:py-28`. |
| Content max-width | Marketing: `max-w-6xl`. App main: `max-w-7xl`. Editor page: `max-w-[760px]`. Auth form: `max-w-sm`. |
| Radius | `--radius: 0.5rem`. Buttons/inputs `rounded-md`, cards `rounded-lg`/`rounded-xl`, avatars `rounded-full`, editor canvas `rounded-lg` on desktop and `rounded-none` on mobile. |
| Shadows | Mostly borders, not shadows. `shadow-xs`/`shadow-sm` on cards at rest. `shadow-md` on hover for document cards. `shadow-lg` for popovers/dialogs. Editor canvas: `shadow-sm` + border. |
| Borders | 1px `border-border` everywhere. |

### 7.5 Icons & buttons

| Item | Rule |
|------|------|
| Icon library | Lucide React, `strokeWidth` default (1.5–2). |
| Sizes | 14px (`size-3.5`) in badges/compact; **16px (`size-4`) default** in buttons, menus, toolbar; 20px (`size-5`) sidebar nav and empty-state secondary; 32–40px empty-state hero icons. |
| Button sizes | `sm` h-8 (toolbar, table actions), `default` h-9, `lg` h-11 (marketing CTAs, auth submit). Icon buttons: `size-8`/`size-9`. |
| Touch targets | ≥ 40px on mobile for primary controls (add `min-h-10` on mobile variants if needed). |
| Primary actions | `Button` default (indigo). Secondary: `outline` or `secondary`. Tertiary: `ghost`. Only **one** primary button per view. |
| Focus | Visible ring on every interactive element; never remove outlines without replacement. |

### 7.6 Semantic states

| State | Treatment |
|-------|-----------|
| Success | Emerald icon/text, `Alert` with success styling, or Sonner toast |
| Warning | Amber, e.g. offline banner |
| Error | `text-destructive`, `border-destructive` on fields, `Alert variant="destructive"` |
| Info | Muted with icon |

### 7.7 Motion

- Transitions: `transition-colors` / `duration-150` on hover states. Sidebar collapse: shadcn default.
- Only two "expressive" animations: skeleton pulse and the syncing spinner icon.
- Respect `prefers-reduced-motion` (Tailwind `motion-reduce:` variants).

### 7.8 Dark mode

Set up the `ThemeProvider` (next-themes) with `class` strategy from Phase 1 even if dark polish comes later. Using semantic tokens everywhere means dark mode largely works for free. Landing may launch light-first, with dark verified in Phase 10.

### 7.9 Editor prose styles

Create a `.doc-prose` class (in `globals.css`, or via `@tailwindcss/typography`) that styles `h1–h3`, `p`, `ul/ol`, `blockquote`, `code`, `pre`, `a`, and `hr`. **Reuse this same class later on Tiptap's `.ProseMirror` element** so mock and real content look identical.

---

## 8. Page Specifications

### 8.1 Landing Page (`/`)

Page composes sections only:

```tsx
<Hero /> <ProductPreview /> <FeaturesGrid /> <FeatureSpotlight ×3 /> <SecuritySection /> <HowItWorks /> <CtaSection />
```
(Navbar/Footer come from the layout.)

| Section | Content | Notes |
|---------|---------|-------|
| **Navbar** | Logo, links (Features, How it works, Security, Pricing*), Login (ghost), **Get started** (primary) | Sticky, `backdrop-blur`, border-bottom on scroll. Mobile: hamburger → `Sheet`. *Pricing can be an anchor to a future section or omitted. |
| **Hero** | Small eyebrow badge ("Real-time collaboration, built in"), H1 headline, subhead (1–2 lines), primary CTA "Get started free" → `/register`, secondary CTA "See how it works" (scroll anchor) or "Log in" | Very subtle background (radial fade or grid), no heavy gradient. Center-aligned. Include a trust line ("No credit card required"). |
| **Product preview** | A **static** mockup of the editor (pure JSX, not the real editor component) framed in a browser-like window, with floating collaborator cursors/labels and a sync badge | Use the same `.doc-prose` styles. Slight border and shadow. On mobile, crop/scale gracefully with no overflow. |
| **Features grid** | 6 cards: Real-time editing, Rich text, Sharing & permissions, Version history*, Search, Offline-ready* | Icon + title + 1-line description. (*Labeled as roadmap-consistent features; don't make false promises in copy.) |
| **Feature spotlights** | 3 alternating rows: **Collaboration** (presence, cursors, comments), **Document management** (folders/search/star), **Real-time editing** (instant sync, conflict-free) | Each: eyebrow, heading, paragraph, 3 bullet points, small illustrative mock UI (pure JSX). |
| **Security/privacy** | 3–4 items: Encryption in transit/at rest, granular permissions, private by default, your data stays yours | Icon list on a muted background band. Keep claims honest and generic. |
| **How it works** | 3 numbered steps: Create → Invite → Write together | Horizontal on desktop, vertical on mobile. |
| **Final CTA** | Heading, sub-copy, primary button | Contrasting band (primary or foreground background). |
| **Footer** | Logo + tagline, 3–4 link columns (Product, Company, Legal), copyright | Collapses to stacked on mobile. |

Also add metadata (title, description, OG image) via `config/site.ts`.

### 8.2 Login (`/login`)

- **Layout:** centered card (`max-w-sm`) on left; brand panel on right at `lg+`.
- **Fields:** Email, Password (with `PasswordInput` show/hide toggle), "Remember me" checkbox, "Forgot password?" link (→ `#` or a stub route).
- **Actions:** "Log in" (full width, loading spinner, disabled during submit), divider "or continue with", `SocialButtons` (Google, GitHub; non-functional, show a toast "Coming soon" on click), "Don't have an account? Sign up".
- **Validation (Zod + RHF, `mode: "onTouched"`):** email format, password required. Show inline messages under fields with `aria-describedby` and `aria-invalid`.
- **Mock behavior via `auth-client.ts`:**
  - `fail@example.com` → returns "Invalid email or password" (form-level `Alert`).
  - `error@example.com` → simulates network error.
  - Anything else → success: show a brief success state (button check icon / toast) then `router.push("/dashboard")`.
- **States:** idle, validating, submitting (spinner, inputs disabled), invalid-credentials, network-error, success.

### 8.3 Register (`/register`)

- **Fields:** Name, Email, Password (+ strength indicator), Confirm password, Terms checkbox ("I agree to the Terms and Privacy Policy").
- **Password strength:** pure function `getPasswordStrength(pw)` → `{ score: 0–4, label, suggestions[] }`. Score by length (≥8, ≥12), mixed case, digits, symbols; penalize common patterns. UI: 4-segment bar + label ("Weak / Fair / Good / Strong") + short hint list. Announce via `aria-live="polite"`.
- **Validation:** name required (≥ 2 chars), email format, password ≥ 8 chars, confirm must match, terms must be checked. Register button is disabled until the terms are checked (or shows an error on submit, with your preference for one consistent approach across the app).
- **Mock:** `taken@example.com` → "An account with this email already exists" (field-level error on email). Otherwise → success → redirect to `/dashboard` (later: email verification step).
- **Social:** same `SocialButtons` component (`mode="register"` changes label text).

### 8.4 Dashboard shell (`(app)` layout)

**Sidebar (`AppSidebar`, built on shadcn `Sidebar`):**

| Section | Items |
|---------|-------|
| Header | Logo + product name; workspace name (optional switcher stub) |
| Primary | **New file** button (primary), then nav: Home (`/dashboard`), My Files (`/documents`), Recent (`/recent`), Starred (`/starred`), Shared with me (`/shared`) |
| Secondary | Trash (`/trash`), Settings (`/settings`) |
| Footer | `SidebarUser`: avatar, name, email, dropdown (Profile, Settings, Theme, Log out → `/login` mock) |

- **Collapse:** `collapsible="icon"`, toggled by a `SidebarTrigger` and `Cmd/Ctrl+B`. Collapsed state shows icons with tooltips. Persist via the cookie mechanism shadcn's sidebar already provides.
- **Active state:** driven by `usePathname()`, using `isActive`.
- **Mobile:** sidebar becomes an off-canvas `Sheet` opened from the header trigger.

**Header (`AppHeader`):** sidebar trigger, breadcrumb or page title, a search trigger that opens the command palette (on mobile, an icon button), and `ThemeToggle`. The user menu lives in the sidebar footer (desktop). On mobile, show a small avatar in the header.

**Command palette (`CommandMenu`, `Cmd/Ctrl+K`):** search across mock documents by title, plus actions ("New document", "Go to Trash", "Toggle theme"). Selecting a document navigates to it.

### 8.5 Dashboard content (`/dashboard`)

Top to bottom:

1. **Greeting header:** "Good morning, Alex" (time-based, computed client-side to avoid hydration mismatch, or default to a neutral greeting server-side), sub-line: "You have N documents · M shared with you".
2. **Primary actions:** `New file` button (right of header).
3. **Recent documents strip:** horizontal row of 4 compact cards (2 on mobile, horizontally scrollable). "View all" link → `/recent`.
4. **Browser toolbar:** search input, type filter, owner filter, sort select, grid/list toggle.
5. **All documents:** grid or list based on `?view=`.

Other scopes (`/documents`, `/recent`, `/starred`, `/shared`, `/trash`) use the same toolbar + list without the greeting/recent strip. `scopes.ts` provides per-scope title, description, empty-state copy, and allowed actions:

| Scope | Available actions | Notes |
|-------|-------------------|-------|
| all / recent / starred | Open, Rename, Star/Unstar, Share, Duplicate*, Download*, Move to trash | *Placeholder items shown disabled or toast "Coming soon". |
| shared | Open, Star, Make a copy*, Remove from my list* | No Rename/Trash for docs you don't own. |
| trash | Restore, Delete forever | Header shows "Items in trash are deleted after 30 days" `Alert` + "Empty trash" button (with confirm). |

**Document card/row content:**

| Field | Card | Row (list view) |
|-------|------|-----------------|
| Icon (type-colored) | Top-left, in a tinted square | Left |
| Name | Title (truncate 2 lines) | Truncate 1 line |
| Type | `Badge` | Column (hidden on mobile) |
| Last modified | "Edited 2h ago" | Column |
| Owner | Avatar + name ("You" if current user) | Column (hidden < `md`) |
| Collaborators | `CollaboratorStack` (max 3 + "+N") | Column (hidden < `lg`) |
| Star | Icon toggle (filled if starred) | Same |
| Actions | `⋯` dropdown; also right-click via `ContextMenu` | Same |

Card preview area: optionally show a faint "text lines" placeholder or the first paragraph snippet at the top of the card for visual richness (from `meta`, or a mock `excerpt` field). Keep it subtle.

### 8.6 New Document page (`/documents/new`)

- **Header:** "← Back to dashboard" link (`Button variant="ghost"` with ArrowLeft) + Breadcrumb ("Home / New document").
- **Heading:** "Create a new document" + one-line description.
- **Content:** a grid designed for growth: first cell is the **Blank document** card (large `Card`, `FileText` icon in a tinted square, title "Blank document", description "Start with an empty page and write freely", **Create** button). Below, an optional muted "More options coming soon" row with 2 disabled placeholders ("Start from template", "Import file"), so the layout is obviously extensible.
- **Behavior:**
  1. Click the card or the button → button shows spinner, disabled, "Creating…".
  2. Call `createDocument()` (mock, ~600ms).
  3. `router.push(routes.document(newId))`.
  4. If it errors (dev scenario), show an inline `Alert` + toast and re-enable.
- Keyboard: pressing Enter on the focused card triggers creation. The whole card is a single button/link for a large hit area.

### 8.7 Document Editor (`/documents/[documentId]`)

**Layout (top → bottom, full viewport height, no sidebar):**

```text
┌────────────────────────────────────────────────────────────────────┐
│ ← │ 📄 Title (inline edit)   [Saved ✓]      👤👤👤+2  [Share]  ⋯  (Avatar) │  Top bar (h-14)
├────────────────────────────────────────────────────────────────────┤
│ ↶ ↷ │ Paragraph ▾ │ B I U S │ • 1. ❝ │ </> {} │ 🔗 🖼 │ ≡ ≡ ≡        │  Toolbar (sticky)
├────────────────────────────────────────────────────────────────────┤
│                     ┌──────────────────────┐                       │
│   (muted "desk")    │   PAGE (white sheet) │                       │  Scrollable area
│                     │   max-w ~760px       │                       │
│                     └──────────────────────┘                       │
└────────────────────────────────────────────────────────────────────┘
```

**Top bar (`EditorTopBar`):**

| Element | Details |
|---------|---------|
| Back | `ArrowLeft` icon button with tooltip, → `/dashboard` (or previous page via `router.back()` if the referrer is in-app; fallback to `/dashboard`). |
| Icon + Title | `DocumentTitleInput`: looks like plain text, becomes an input on focus/hover, `Enter` blurs, `Escape` reverts. Empty → "Untitled document". Triggers `saving` state on change (debounced). |
| Sync status | `SyncStatus` badge right after the title (see states in §10). |
| Presence | `PresenceAvatars`: up to 3–4 avatars with colored rings + "+N" popover listing everyone. Tooltip with name. |
| Share | Primary/outline `Button` "Share" → opens `ShareDialog`. |
| More menu | `DropdownMenu`: Rename, Make a copy*, Download*, Version history*, Move to trash, Print*, etc. |
| User | `UserMenu` (avatar). |

**Toolbar (`EditorToolbar`), groups separated by `Separator`:**

| Group | Controls |
|-------|----------|
| History | Undo, Redo |
| Block type | `Select`: Paragraph, Heading 1, 2, 3 |
| Marks | Bold, Italic, Underline, Strikethrough, Inline code |
| Lists & blocks | Bullet list, Ordered list, Blockquote, Code block |
| Insert | Link (popover with URL input + Apply/Remove), Image (placeholder → toast/dialog "Image upload coming soon") |
| Alignment | Left, Center, Right, via `ToggleGroup` (single) |

- Each button is `ToolbarButton` = `Toggle` + `Tooltip` (with shortcut hint, e.g. "Bold ⌘B") + `aria-pressed` + `aria-label`.
- Buttons read `editor.state.isActive.bold` etc. and call `editor.commands.toggleBold()`. The mock controller holds this in local state (toggles only *visually*, plus wraps a "selection" to demonstrate). See §12.
- Disabled when the doc is read-only (viewer role) or offline error.

**Editor surface:**

- `PageCanvas`: outer scroll area with `bg-muted/40`; inner sheet `bg-card border shadow-sm rounded-lg`, `mx-auto max-w-[760px]`, generous padding (`px-6 sm:px-12 py-10 sm:py-16`), min-height so short docs still look like a page.
- `EditorSurface` renders `MockContentRenderer` with `.doc-prose`. It shows: a large title area (optional, since the top bar owns the title; skip duplicating), headings, paragraphs, bullet + ordered lists, a blockquote, an inline code sample, a fenced code block (mono, muted background, optional language label), and a link.
- **Placeholder for empty docs:** "Start writing, or press `/` for commands". The `/` command is future functionality, so only show it if it's real; otherwise, "Start writing…".
- A `contentEditable` region is **optional** for the mock (gives the feeling of a caret). If used, keep it minimal, mark it clearly as a mock, and don't try to make the toolbar functional through `execCommand` (deprecated, and it won't carry over).

**Editor states:** loading (skeleton), empty document, saving, saved, syncing, offline, error. See §10.

### 8.8 Settings (`/settings`)

A minimal stub with `Tabs` (Profile, Appearance, Notifications). Only Appearance's theme selector needs to work. It exists so the sidebar link isn't dead.

### 8.9 Share dialog (used from dashboard menu and editor)

UI-only, `Dialog`:

1. Email `Input` + role `Select` (Editor / Commenter / Viewer) + "Invite" button.
2. "People with access" list (`ScrollArea`): avatar, name, email, role `Select` (owner shown static).
3. "General access" `Select`: Restricted / Anyone in workspace / Anyone with the link, with a role sub-select.
4. Footer: "Copy link" button (copies `window.location.href` and toasts "Link copied").

This is the natural home for permissions later. The component takes `documentId` and reads `Collaborator[]` from props, so it's already shaped for API data.

---

## 9. Responsive / Mobile Strategy

Breakpoints (Tailwind defaults): mobile `< 640`, tablet `md 768–1023`, laptop `lg 1024–1279`, desktop `xl ≥ 1280`.

**Principle:** mobile is a *separately designed* experience: different navigation, denser lists, touch-first controls, and no hover-dependent UI.

### 9.1 Landing

| Element | Desktop | Mobile |
|---------|---------|--------|
| Navbar | Inline links + buttons | Logo + hamburger → `Sheet` with links and stacked CTAs |
| Hero | 2 CTAs side by side | CTAs stacked, full width; smaller display type (`text-4xl`) |
| Product preview | Full mockup with floating cursors | Simplified/cropped mockup; floating labels hidden; fixed aspect container so nothing overflows |
| Feature spotlights | Alternating 2-column | Single column, text first then visual |
| How it works | 3 horizontal steps | Vertical with connecting line |
| Footer | 4 columns | 2 columns then stacked |

### 9.2 Auth

- `< lg`: brand panel hidden, and the form is vertically centered with `px-4`.
- Inputs `h-11` on mobile to avoid iOS zoom (font-size ≥ 16px on inputs).
- Social buttons stack full width.

### 9.3 Dashboard

| Aspect | Desktop/Laptop | Tablet | Mobile |
|--------|----------------|--------|--------|
| Sidebar | Expanded (260px) on `xl`, icon-collapsed by default on `md`–`lg` | Collapsed rail or sheet | Off-canvas `Sheet` from the header hamburger |
| Header | Title + search + actions | Same | Hamburger, page title, search icon (opens command palette), avatar |
| **New file** | Button in page header + sidebar | Same | **Floating action button** (bottom-right) *and/or* header button. Choose the FAB for thumb reach. |
| Browser toolbar | Single row (search, filters, sort, view) | Wraps to 2 rows | Search full-width on row 1; filters + sort collapse into a single "Filters" button opening a bottom `Sheet`; view toggle stays visible |
| Document grid | 3–4 columns | 2–3 columns | 1 column (or 2 compact) |
| Default view | Grid | Grid | **List** (denser, easier to scan). Still URL-driven, so the user can switch. |
| Recent strip | 4 cards | 3 | Horizontal scroll-snap, 2 cards visible |
| List row columns | All columns | Hide collaborators | Icon + title + "edited X ago" + `⋯` only; owner/type in a second line of small text |
| Context menu | Right-click + `⋯` | Same | **`⋯` button only** (right-click isn't discoverable; long-press is unreliable) |

### 9.4 New document page

Single column; blank card fills width; the Create button is full width and pinned to the bottom of the card. Back link stays at the top.

### 9.5 Editor

| Aspect | Desktop | Tablet | Mobile |
|--------|---------|--------|--------|
| Top bar | Everything visible | Hide "Share" label (icon only), avatars limited to 3 | Back, truncated title, sync status **icon only**, Share (icon), and `⋯` menu (user menu, avatars list, and other actions move *into* the overflow menu or a bottom sheet) |
| Toolbar | Wraps or fits one row | Horizontally scrollable | **Single row, horizontally scrollable, scroll-snap, edge fade**, with the most-used tools first (undo/redo, bold, italic, lists, heading). Optionally pinned to the bottom above the keyboard. Decide during Phase 8. |
| Page canvas | Centered sheet with shadow on a muted desk | Sheet with smaller margins | **Full-bleed**: no card border/shadow/radius, `px-4`, so text uses the full width |
| Typography | 17px body | 17px | 16px, slightly reduced heading sizes |
| Popovers (link) | `Popover` | `Popover` | `Popover` or bottom `Sheet`. Make sure it isn't cut off by the keyboard |
| Share dialog | Centered `Dialog` | Same | Full-height bottom `Sheet` (or `Dialog` at near full-screen) |

**Hard rules:** no horizontal page scroll anywhere. Only intentional scroll containers (toolbar, tabs, recent strip) may scroll horizontally, and they must be visibly scrollable. Test at 320px, 375px, 768px, 1024px, 1440px. Use `min-w-0` and `truncate` on flex children. Code blocks scroll inside their own container (`overflow-x-auto`). Use `dvh` units for full-height layouts on mobile to handle browser chrome.

---

## 10. UI States Matrix

### 10.1 Dashboard / document lists

| State | Trigger (mock) | UI |
|-------|----------------|----|
| **Loading** | `loading.tsx` / `?mock=slow` / client filter in transition | `DocumentsSkeleton`: skeleton greeting, 4 recent-card skeletons, 8 card (or row) skeletons matching the current `view`. Skeletons match real layout dimensions to avoid layout shift. |
| **Normal** | Default | Grid/list of documents |
| **Empty (no docs at all)** | `?mock=empty` | `EmptyState`: `FilePlus` icon, "No documents yet", "Create your first document to get started", primary "New document". Per-scope copy: Starred → "Star documents to find them quickly here"; Shared → "Documents others share with you appear here"; Trash → "Trash is empty"; Recent → "Documents you open will appear here". |
| **No search results** | `q`/filters match nothing | `NoResults`: `SearchX` icon, `No results for "query"`, suggestion, and "Clear search/filters" button. Distinct from empty: the toolbar remains visible. |
| **Error** | `?mock=error` or `error.tsx` | `ErrorState`: `AlertTriangle`, "Couldn't load your documents", brief description, "Try again" (calls `router.refresh()` / `reset()`). Use `Alert` inline if the page shell still renders. |
| **Action feedback** | Star/rename/trash | Sonner toast; "Moved to trash" includes an **Undo** action. |

### 10.2 Document editor

| State | UI in the top bar (`SyncStatus`) | Behavior |
|-------|----------------------------------|----------|
| **Loading** | n/a: `EditorSkeleton` (top bar skeleton, toolbar skeleton, page with paragraph skeleton lines) | Shown by `loading.tsx` |
| **Empty document** | Normal | Sheet shows placeholder text; focus ring on the first line |
| **Saved** | `Check` (emerald) + "Saved" | Default resting state |
| **Saving** | `Loader2` spinner + "Saving…" | Triggered by title/content change; auto-transitions to Saved after ~800ms in mock |
| **Syncing** | `RefreshCw` spinner + "Syncing…" | Represents Yjs syncing; `Tooltip`: "Syncing changes with collaborators" |
| **Offline** | `CloudOff` (amber) + "Offline" | `Alert` banner under the top bar: "You're offline. Changes will sync when you reconnect." Editing remains enabled. |
| **Error** | `AlertCircle` (red) + "Not saved" | Click → retry; toast on transition; banner with "Retry" button. Editing stays enabled with a warning. |
| **Read-only** (future) | "View only" badge | Toolbar disabled |
| **Document not found** | `not-found`/`editor-error` | "Document not found or you don't have access" + back to dashboard |

`DevStatusSwitcher` (dev-only, hidden in production) lets you force any status from a small floating menu, so every state can be visually verified.

### 10.3 Authentication

| State | UI |
|-------|----|
| **Validation errors** | Inline error text under each field (destructive color, `aria-invalid`), first invalid field focused on submit |
| **Invalid credentials** | Form-level `Alert variant="destructive"` at top of form: "Invalid email or password"; inputs remain filled (password cleared optionally) |
| **Network error** | Form-level alert: "Something went wrong. Please try again." |
| **Loading** | Submit button shows spinner + "Signing in…", disabled; all inputs and social buttons disabled |
| **Success** | Short success feedback (check icon on button or success `Alert`/toast), then redirect |
| **Disabled buttons** | Submit disabled while submitting (and on register until terms accepted, if that approach is chosen); disabled states have reduced opacity and `cursor-not-allowed` |
| **Password strength** | 4-segment bar colored red → amber → lime/green |

---

## 11. UX Behavior & State Transitions

### 11.1 Creating a new file

1. User clicks **New file** (sidebar button, dashboard header, mobile FAB, command palette, or empty state).
2. Navigate to `/documents/new`.
3. User sees the Blank document card and clicks **Create**.
4. Button → "Creating…" (spinner, disabled). Mock `createDocument()` resolves in ~600ms with a new ID.
5. `router.push('/documents/<newId>')`.
6. Editor loads (skeleton → empty document, title "Untitled document", cursor in the title, or body).
7. On first title/content change: Saving → Saved.

*Shortcut option (later):* skip the intermediate page from the sidebar button and create + open directly. The `/documents/new` page remains as the picker for templates.

### 11.2 Opening a document

- Click a card/row (whole card is a `<Link>`, with the star and menu buttons stopping propagation) → `/documents/<id>`.
- `loading.tsx` shows `EditorSkeleton` while `getDocument` resolves.
- Cmd/Ctrl+click and middle-click open in a new tab (because they're real links).
- Unknown ID that's not in mock data and not a "new" ID → `notFound()`.

### 11.3 Navigation model

- **Sidebar** is the primary navigation in the app.
- **Editor** is a deliberate "focus mode" with no sidebar. Back button returns to the previous list (dashboard, starred, etc.).
- **Return to dashboard:** back arrow in the editor top bar, the logo in the top bar (optional link), or the browser back button.
- **Breadcrumb** in the app header shows the current section (e.g. "Documents"). Sub-levels exist only for `/documents/new`.
- **Command palette** provides fast navigation everywhere.

### 11.4 Search

- A **debounced (250ms)** input writes `?q=` via `router.replace` (not `push`, to avoid history spam).
- Case-insensitive match on title (and optionally owner name). Matched substring is highlighted in the card title (optional polish).
- Search runs in the data layer (`listDocuments({ q })`), so the client → server contract is already there. While updating, dim the list slightly (`useTransition`) instead of flashing a full skeleton.
- `Esc` or the "×" clears the search. `/` focuses the search input (optional shortcut, when no input is focused).
- The global search icon in the header opens the command palette (quick jump), which is distinct from the on-page filter search.

### 11.5 Filtering

- **Type:** All / Document / Note / Spec / Meeting / Wiki (single select via `Select` or `DropdownMenu` with radio items).
- **Owner:** Anyone / Owned by me / Not owned by me.
- Active filters show as removable chips (`Badge` with ×) below the toolbar, plus a "Clear all" link. A count appears on the mobile "Filters" button.
- URL-driven: `?type=spec&owner=me`.

### 11.6 Sorting

- `Select` options: Last modified (newest), Last modified (oldest), Name A–Z, Name Z–A, Date created.
- Default: Last modified (newest). In the `recent` scope, default to last opened.
- URL: `?sort=name-asc`. In **list view**, column headers may also toggle sorting (optional polish).

### 11.7 View toggle

- `ToggleGroup` (Grid / List), URL `?view=list`, default `grid` on desktop, `list` on mobile (apply default if no explicit param, using CSS/`useMediaQuery` carefully to avoid hydration mismatch. A safe approach is rendering both with `hidden`/`block` classes, or defaulting server-side to grid and switching after mount only when there's no explicit param).
- Persist the user's last choice in `localStorage` (client-only convenience, with the URL taking priority).

### 11.8 Document actions (context menu / `⋯`)

| Action | Behavior (mock) |
|--------|-----------------|
| Open | Navigate |
| Open in new tab | `window.open` |
| Rename | `RenameDialog` with input prefilled; Enter to save; updates local state; toast |
| Star / Unstar | Instant toggle (optimistic), toast optional |
| Share | Opens `ShareDialog` |
| Copy link | Copies URL; toast "Link copied" |
| Make a copy | Placeholder, toast "Coming soon" |
| Download | Placeholder, toast "Coming soon" |
| Move to trash | Removes from list immediately (optimistic); toast with **Undo** |
| Restore (trash scope) | Removes from trash list, toast |
| Delete forever (trash scope) | `ConfirmDialog` (destructive), then remove |

Menu content is defined **once** in `DocumentActionsMenu` and rendered inside both `DropdownMenu` and `ContextMenu` to avoid duplication.

### 11.9 Sharing (eventually)

- **Entry points:** editor top bar **Share** button; dashboard action menu → Share; (later) right-click.
- Modal (`Dialog`) as specified in §8.9. Real behavior later: invite by email → API; role changes → API; real-time collaborators refreshed via the session provider.
- Presence avatars in the top bar and the share dialog's "People with access" list both use the `Collaborator` type, so the two stay consistent.

### 11.10 Collaboration / presence indicators (where they go)

| Indicator | Location | Source (mock → real) |
|-----------|----------|----------------------|
| Who's here now | Top bar `PresenceAvatars` | `useDocumentSession().collaborators` (fake list → Yjs awareness) |
| Live cursors + name labels | Inside editor surface | Not now (Tiptap collaboration-cursor extension later). Reserve the `relative` positioned canvas and use `Collaborator.color` |
| Collaborators on doc cards | `CollaboratorStack` in dashboard | `DocumentSummary.collaborators` |
| Who has access | Share dialog | `Collaborator[]` |

### 11.11 Sync status placement

- **Editor:** directly beside the document title in the top bar (Google Docs-style). Offline/error also show a banner beneath the top bar.
- **Dashboard:** no sync indicator now. (Later: a small "Offline" chip in the app header if the WebSocket connection drops.)

---

## 12. Future Backend Compatibility

### 12.1 The boundaries

```text
┌─────────────────────────────────────────────────────────────────┐
│                          UI components                          │
│    (features/*/components, components/*)  ← only render + emit  │
└───────┬──────────────┬─────────────────┬────────────────┬───────┘
        │              │                 │                │
   Local UI state   lib/data/*      lib/session.ts    DocumentSession
   (useState, URL)  (async fns)     (getCurrentUser)  + EditorController
        │              │                 │                │
        │        ┌─────┴─────┐      ┌────┴─────┐    ┌─────┴──────┐
        │        │ mock now  │      │ mock now │    │  mock now  │
        │        │ REST later│      │Better Auth│   │Yjs+Tiptap  │
        │        └───────────┘      └──────────┘    └────────────┘
```

| Boundary | UI depends on | Today | Later |
|----------|---------------|-------|-------|
| **Server data** (lists, detail, CRUD) | `lib/data/*` async functions + `types/` | Mock DB + `simulateLatency` | `fetch` to Node REST API (change bodies inside `lib/data/*`) |
| **Auth / session** | `getCurrentUser()` + `useSession()` shim in `lib/session.ts`; forms call `authClient.signIn/signUp` from `features/auth/auth-client.ts` | Returns "Alex Morgan"; accepts fake credentials | Wire to `packages/auth` (Better Auth client). Replace the internals, keep the signatures. Route protection via Next middleware (`proxy.ts` in newer versions) and a check in `(app)/layout.tsx` |
| **Collaboration state** | `useDocumentSession()` → `{ syncStatus, collaborators, connection }` | `MockSessionDriver` with timers | `YjsSessionDriver`: `HocuspocusProvider`/`y-websocket` status events → `syncStatus`, awareness → `collaborators` |
| **Editor engine** | `useEditorController()` → `{ state, commands }` | `useMockEditorController()` local state | `useTiptapController(editor)` maps `editor.isActive('bold')`, `editor.chain().focus().toggleBold().run()` |
| **Local UI state** | `useState`, URL params, React context | Same | Same |

### 12.2 Rules to avoid coupling to mock data

1. **Never import from `lib/mock/*` outside `lib/data/*`.** Enforce with an ESLint `no-restricted-imports` rule, so mistakes are caught immediately.
2. **Components accept domain types as props** (`DocumentSummary`), and never reach for globals.
3. **No mock-specific fields** in types (no `_mock`, no pre-formatted strings such as `"2 hours ago"` in data). Format in the UI.
4. **Async everywhere.** Even though mock data is instant, all data functions return Promises with simulated latency. This forces loading states to exist from day one.
5. **IDs are opaque strings.** No assumptions about numeric IDs or ordering.
6. **Routes come from `lib/routes.ts`**, never hard-coded strings.
7. **Errors have a type.** `ApiError { code, message }` so real errors flow into the same error states.
8. **Server/client split is already correct.** Pages fetch via `lib/data` in server components and pass props into client components. Real API calls will slot into the same places (server components may call the Node API directly; client mutations may use server actions or `fetch`).
9. **Content format = Tiptap JSON.** Persist/transport format won't change when Tiptap lands. (Yjs will later become the source of truth for live content, with JSON as a snapshot.)

### 12.3 Interface sketches (for reference; implement in Phases 2/7)

```ts
// features/editor/engine/types.ts
export interface EditorState {
  isActive: { bold: boolean; italic: boolean; underline: boolean; strike: boolean;
              code: boolean; bulletList: boolean; orderedList: boolean;
              blockquote: boolean; codeBlock: boolean; link: boolean };
  blockType: "paragraph" | "h1" | "h2" | "h3";
  align: "left" | "center" | "right";
  canUndo: boolean;
  canRedo: boolean;
  isEditable: boolean;
}
export interface EditorCommands {
  toggleBold(): void; toggleItalic(): void; toggleUnderline(): void; toggleStrike(): void;
  toggleCode(): void; toggleBulletList(): void; toggleOrderedList(): void;
  toggleBlockquote(): void; toggleCodeBlock(): void;
  setBlockType(t: EditorState["blockType"]): void;
  setAlign(a: EditorState["align"]): void;
  setLink(url: string | null): void;
  insertImagePlaceholder(): void;
  undo(): void; redo(): void;
}
export interface EditorController { state: EditorState; commands: EditorCommands; }

// features/editor/session/types.ts
export type SyncStatus = "saved" | "saving" | "syncing" | "offline" | "error";
export type ConnectionState = "connected" | "connecting" | "disconnected";
export interface Presence extends Collaborator { isYou: boolean; isActive: boolean; }
export interface DocumentSession {
  syncStatus: SyncStatus;
  connection: ConnectionState;
  collaborators: Presence[];
  retry(): void;
  markDirty(): void;           // called on title/content change → triggers "saving"
}
```

---

## 13. Implementation Phases

### Phase 1 — Setup & Design System

| | |
|---|---|
| **Goal** | A running `apps/web` with tooling, tokens, fonts, theme, and shadcn initialized so every later phase builds on one consistent foundation. |
| **Build** | Project config (`tsconfig` paths `@/*`, ESLint incl. `no-restricted-imports` for `lib/mock`), Tailwind setup, `globals.css` tokens (light + dark), fonts via `next/font`, `ThemeProvider`, `Toaster`, `lib/utils.ts`, `lib/constants.ts`, `lib/routes.ts`, `lib/format.ts`, `types/*`, empty route groups with placeholder pages, `.doc-prose` styles, `config/site.ts`. |
| **Pages affected** | All (root layout, empty route group layouts). |
| **shadcn** | `pnpm dlx shadcn@latest init`, then add: `button`, `input`, `label`, `card`, `badge`, `separator`, `skeleton`, `sonner`, `tooltip`, `avatar`. |
| **Key details** | Verify how the workspace handles `packages/*` imports (`transpilePackages` in `next.config.ts` if needed later for `packages/auth`). Set `--radius`, colors, and the custom `--success`/`--warning` tokens. Add a temporary `/design` (dev-only) page showing buttons/inputs/badges/colors/typography in light and dark. Delete or hide it at the end. |
| **Depends on** | None. |
| **Definition of done** | `pnpm dev` runs. Theme toggles between light/dark. A dev "kitchen sink" page renders tokens correctly. Lint and typecheck pass. Folder skeleton exists. |

### Phase 2 — Shared Components & Mock Data Layer

| | |
|---|---|
| **Goal** | Build the reusable pieces and the data-access layer, so feature pages are quick compositions. |
| **Build** | `Logo`, `ThemeToggle`, `UserMenu` (no auth), `PageHeader`, `Container`, `EmptyState`, `ErrorState`, `ConfirmDialog`. Types finalized. `lib/mock/*` (users, workspace, ~25 documents, Tiptap JSON content). `lib/data/*` with `simulateLatency` + `?mock=` scenarios. `lib/session.ts` mock. `DocumentIcon`, `CollaboratorStack` (used by several features, so build now). |
| **Pages affected** | None visible (verify on the dev kitchen-sink page). |
| **shadcn** | `dropdown-menu`, `alert`, `alert-dialog`, `dialog`, `select`, `checkbox`, `textarea`, `scroll-area`, `toggle`, `toggle-group`, `popover`. |
| **Key details** | Dates are ISO strings. Add unit-testable helpers (`formatRelativeTime`, `initials`). Make `listDocuments` implement scope, search, type/owner filters, and sort *so the UI just passes params*. |
| **Depends on** | Phase 1. |
| **Definition of done** | Every shared component renders in the kitchen-sink page in light/dark. `listDocuments({scope:'all', q:'spec', sort:'name-asc'})` returns correct filtered data. No file outside `lib/data` imports `lib/mock`. |

### Phase 3 — Landing Page

| | |
|---|---|
| **Goal** | A production-feeling marketing site. |
| **Build** | `Navbar`, `MobileNav`, `Footer`, `Section`, `Hero`, `ProductPreview` (static JSX mockup), `FeaturesGrid`, `FeatureSpotlight` ×3, `SecuritySection`, `HowItWorks`, `CtaSection`, `content.ts` with all copy. |
| **Pages affected** | `/` |
| **shadcn** | `button`, `badge`, `card`, `sheet`, `separator`. |
| **Key details** | Write real, specific copy (no "Lorem ipsum" and no "Feature 1"). Anchor links + `scroll-mt` for the sticky nav offset. Semantic HTML (`header`, `main`, `section` with `aria-labelledby`, `footer`). `ProductPreview` reuses `.doc-prose` and `DocumentIcon`/`CollaboratorStack`. Add page metadata + OG image. Lighthouse-friendly: use `next/image` for any real images, and avoid layout shift. |
| **Depends on** | Phases 1–2. |
| **Definition of done** | All required sections are present. Navbar links scroll to sections. CTAs route to `/register` and `/login`. Looks right at 375 / 768 / 1440 in light mode (dark checked in Phase 10). No horizontal overflow. |

### Phase 4 — Authentication Pages

| | |
|---|---|
| **Goal** | Polished login and register flows with full validation and state coverage (mocked). |
| **Build** | `(auth)` layout + `AuthBrandPanel`, `AuthCard`, `PasswordInput`, `PasswordStrength` + `getPasswordStrength()`, `SocialButtons`, `FormAlert`, `LoginForm`, `RegisterForm`, Zod schemas, `auth-client.ts` mock. |
| **Pages affected** | `/login`, `/register` |
| **shadcn** | `form`, `input`, `label`, `checkbox`, `button`, `alert`, `separator`, `sonner`. Also install `react-hook-form`, `zod`, `@hookform/resolvers`. |
| **Key details** | `mode: "onTouched"`. Focus first invalid field. `autocomplete` attributes (`email`, `current-password`, `new-password`, `name`). `PasswordInput` toggle has `aria-label` + `aria-pressed`, and must not steal form submit (`type="button"`). Mock triggers documented in a comment (`fail@example.com`, `error@example.com`, `taken@example.com`). Redirect on success with `router.push('/dashboard')`. Keep `auth-client.ts` API shaped like Better Auth (`signIn.email({ email, password })` → `{ data, error }`) so swapping is trivial. |
| **Depends on** | Phases 1–2 (and the landing CTAs for links). |
| **Definition of done** | Every state in §10.3 can be triggered and looks right. Keyboard-only usage works. Mobile layout OK. Success redirects to `/dashboard` (placeholder page acceptable until Phase 5). |

### Phase 5 — Dashboard

| | |
|---|---|
| **Goal** | The complete app shell and document browsing experience. |
| **Build** | `(app)` layout, `AppSidebar`, `SidebarNav` (+ `nav-config.ts`), `SidebarUser`, `AppHeader`, `NewFileButton`, `CommandMenu`; `DocumentBrowser`, `BrowserToolbar`, `SearchInput`, `FilterControls`, `SortSelect`, `ViewToggle`, `DocumentGrid`, `DocumentList`, `DocumentCard`, `DocumentRow`, `DocumentActionsMenu`, `RecentDocuments`, `RenameDialog`, `ShareDialog` (UI), `scopes.ts`, `useDocumentQueryParams`, `useLocalDocuments`. Pages for `/dashboard`, `/documents`, `/recent`, `/starred`, `/shared`, `/trash`, `/settings` (stub). |
| **Pages affected** | All `(app)` routes. |
| **shadcn** | `sidebar`, `dropdown-menu`, `context-menu`, `command`, `breadcrumb`, `select`, `toggle-group`, `dialog`, `alert-dialog`, `popover`, `tabs`, `switch`, `scroll-area`. |
| **Key details** | Server component page → `await searchParams` → `listDocuments` → pass to client `DocumentBrowser`. URL params are the single source of truth for `q/type/owner/sort/view`. Use `useTransition` on param changes. Card is a `Link` with nested buttons (stopPropagation + `relative z-10`), or use the "stretched link" pattern (`after:absolute after:inset-0`) to keep valid HTML. Star/trash actions are optimistic in `useLocalDocuments`. Trash scope has its own header alert + "Empty trash". Greeting computed safely against hydration mismatch. |
| **Depends on** | Phases 1, 2 (data layer, `DocumentIcon`, `CollaboratorStack`), 4 (login redirect target). |
| **Definition of done** | All sidebar routes work with correct active state. Search/filter/sort/view work via the URL and survive refresh. Every action in §11.8 works (mock). Cmd+K opens a working palette. Sidebar collapses (`Cmd/Ctrl+B`). Logic is correct at desktop widths (fine mobile polish comes in Phase 8, but nothing is broken). |

### Phase 6 — New Document Page

| | |
|---|---|
| **Goal** | The blank-document creation flow, with a layout that can later hold templates/import. |
| **Build** | `NewDocumentPage` composition, `NewDocumentCard`, disabled `TemplateOption` placeholders (optional), wire all "New file" entry points to `/documents/new`. |
| **Pages affected** | `/documents/new` |
| **shadcn** | `card`, `button`, `breadcrumb`, `alert`, `sonner`. |
| **Key details** | `createDocument()` mock → `router.push(routes.document(id))`. Loading state on the button. Error state via a dev scenario. The whole card is keyboard-activatable. `Back to dashboard` link. |
| **Depends on** | Phases 2, 5 (shell). Editor route from Phase 7 (a temporary placeholder page for `[documentId]` is fine to test navigation). |
| **Definition of done** | Clicking Create shows the loading state, then navigates to `/documents/<id>`. Back link works. Layout looks intentional with only one option. |

### Phase 7 — Document Editor

| | |
|---|---|
| **Goal** | The editor UI, complete with toolbar, canvas, sync status, and presence, structured so Tiptap and Yjs can be dropped in. |
| **Build** | `(editor)` layout, `page.tsx` (fetch via `getDocument`), `loading.tsx`, `error.tsx`, `EditorShell`; `engine/` (types, `useMockEditorController`, `EditorProvider`); `session/` (types, `DocumentSessionProvider`, `MockSessionDriver`, `DevStatusSwitcher`); `EditorTopBar`, `DocumentTitleInput`, `SyncStatus`, `PresenceAvatars`, `EditorMoreMenu`; `EditorToolbar` + `ToolbarButton`, `ToolbarGroup`, `BlockTypeSelect`, `LinkPopover`; `PageCanvas`, `EditorSurface`, `MockContentRenderer`. Wire `ShareDialog` from Phase 5. |
| **Pages affected** | `/documents/[documentId]` |
| **shadcn** | `toggle`, `toggle-group`, `tooltip`, `select`, `popover`, `dropdown-menu`, `avatar`, `badge`, `separator`, `dialog`, `alert`, `skeleton`, `scroll-area`. |
| **Key details** | Toolbar reads/writes **only** through `useEditorController()`. `SyncStatus` and `PresenceAvatars` read **only** from `useDocumentSession()`. `EditorSurface` is the only file that knows the content is mock. Mock controller holds active-mark booleans, and `canUndo/canRedo` toggle sensibly, so the toolbar *feels* alive without pretending to edit. Title edits trigger `markDirty()` → saving → saved. `.doc-prose` provides the typography. Tooltips list shortcut hints. Render mock content from Tiptap JSON with a small switch over node types (`heading`, `paragraph`, `bulletList`, `orderedList`, `listItem`, `blockquote`, `codeBlock`, text marks). Unknown/blank ID → blank doc; missing → `notFound()`. |
| **Depends on** | Phases 1, 2, 5 (`ShareDialog`, `UserMenu`), 6 (creation flow lands here). |
| **Definition of done** | All toolbar controls are present, accessible (labels, `aria-pressed`, tooltips), and visually respond. All 6 sync states can be forced with `DevStatusSwitcher`. Title edit works. Share dialog opens. Presence avatars + "+N" popover work. Page looks like a document. Swapping `EditorSurface` + controller is documented in a short `README` in `features/editor/`. |

### Phase 8 — Responsive / Mobile UI

| | |
|---|---|
| **Goal** | Treat mobile as a first-class, separately designed experience. |
| **Build** | Mobile variants and behaviors per §9: mobile filter `Sheet`, FAB, list-default logic, compact rows, scroll-snap recent strip, mobile editor top bar (overflow consolidation), scrollable toolbar w/ edge fade (and optional bottom-docked toolbar), full-bleed canvas, `ShareDialog` as bottom sheet, mobile marketing nav polish, `dvh` layout fixes. |
| **Pages affected** | All. |
| **shadcn** | `sheet`, `dropdown-menu`, `scroll-area`, and (optional) `drawer` (vaul) for bottom sheets. |
| **Key details** | Test at 320, 375, 414, 768, 1024, 1280, 1440. Check both portrait/landscape. Ensure ≥ 40px touch targets, and no hover-only controls. Inputs use ≥ 16px font to prevent iOS zoom. `min-w-0`/`truncate` audit on flex layouts. Verify sidebar sheet focus trap and close-on-navigate. Use browser devtools device emulation, plus a real phone if possible. |
| **Depends on** | Phases 3–7. |
| **Definition of done** | No horizontal overflow at any tested width. All primary flows (login → dashboard → create → edit → back) completable on a 375px viewport with one hand. Editor toolbar is usable on mobile. |

### Phase 9 — Loading / Error / Empty States

| | |
|---|---|
| **Goal** | Every state in §10 is real, tested, and consistent. |
| **Build** | `loading.tsx` for dashboard routes and editor with skeletons matching real layouts; `error.tsx` for `(app)` and editor; `not-found.tsx` (global + document-specific); per-scope `DocumentsEmpty`; `NoResults`; offline `Alert` banner + error banner in editor; toasts for actions incl. Undo; disabled states audit; auth error states. |
| **Pages affected** | All. |
| **shadcn** | `skeleton`, `alert`, `sonner`. |
| **Key details** | Use `?mock=slow|empty|error` to verify. Skeleton sizes = real element sizes (no layout shift). Error boundaries must offer a way out (Retry + Go to dashboard). Verify `aria-live` regions announce status changes (sync status, form errors, strength). Add a state checklist to the PR description. |
| **Depends on** | Phases 4–8. |
| **Definition of done** | Every row in the §10 tables is reachable and visually verified in light and dark, on desktop and mobile. |

### Phase 10 — UI Polish & Hardening

| | |
|---|---|
| **Goal** | Production-quality finish. |
| **Build/Do** | Dark mode pass on every page. Focus-ring and keyboard navigation audit. Contrast audit (AA). Consistent spacing/typography audit vs. §7. Hover/active/disabled states. Reduced-motion support. Favicon, metadata, OG image, `robots`. 404 polish. Remove `/design` page and dev-only tools from prod builds (or guard them). Bundle check (dynamic-import `CommandMenu`/`ShareDialog` if heavy). Lighthouse pass on landing (perf/a11y/SEO). Final README for `apps/web` (structure, how to swap in real API / auth / Tiptap / Yjs). Fix leftover TODOs. |
| **Pages affected** | All. |
| **shadcn** | n/a. |
| **Key details** | Test with screen reader basics (VoiceOver/NVDA on key flows). Check tab order in the editor. Confirm `pnpm build` passes with no type errors, and no console errors/hydration warnings. |
| **Depends on** | All previous. |
| **Definition of done** | `pnpm build && pnpm lint && pnpm typecheck` clean. Lighthouse a11y ≥ 95 on landing/login. No console errors. Light/dark both polished. README documents the integration points for backend, auth, Tiptap, and Yjs. |

---

## 14. Single Recommended Sequential Plan

Follow this in order. Each step is small enough to finish and commit on its own.

### Stage A: Foundation (Phase 1–2)

1. Confirm `apps/web` runs in the pnpm workspace; set up path alias `@/*`.
2. Initialize shadcn (`components.json`), and add the initial primitives from Phase 1.
3. Write design tokens in `globals.css` (light + dark), set up fonts, `ThemeProvider`, `Toaster`.
4. Add `lib/constants.ts`, `lib/routes.ts`, `lib/format.ts`, `lib/utils.ts`.
5. Create the route-group skeleton with placeholder pages and layouts (`(marketing)`, `(auth)`, `(app)`, `(editor)`).
6. Write `types/*` exactly as in §6.2.
7. Build `lib/mock/*` (users, workspace, documents, sample Tiptap JSON), then `lib/data/*` with latency and `?mock=` scenarios.
8. Add ESLint restriction: nothing outside `lib/data` imports `lib/mock`.
9. Build global components: `Logo`, `ThemeToggle`, `PageHeader`, `Container`, `EmptyState`, `ErrorState`, `ConfirmDialog`, `UserMenu`, `DocumentIcon`, `CollaboratorStack`.
10. Create the `/design` dev page to verify all of the above in light + dark. ✅ **Checkpoint 1.**

### Stage B: Public site & auth (Phase 3–4)

11. Landing: `Section` wrapper + `content.ts` → Navbar/MobileNav/Footer (layout) → Hero → ProductPreview → FeaturesGrid → three FeatureSpotlights → Security → HowItWorks → CTA. Check responsiveness as you go.
12. Auth: `(auth)` layout + `AuthCard` + `AuthBrandPanel`, then `PasswordInput`, `SocialButtons`, `FormAlert`.
13. Zod schemas + `auth-client.ts` mock; `LoginForm`; then `PasswordStrength` + `RegisterForm`. ✅ **Checkpoint 2:** landing → register → login → redirect to `/dashboard` works.

### Stage C: App (Phase 5–6)

14. Install `sidebar`, `command`, `context-menu`, `breadcrumb`, etc. Build `(app)` layout with `AppSidebar`, `AppHeader`, `nav-config.ts`.
15. Build document display components: `DocumentCard`, `DocumentRow`, `DocumentActionsMenu`, `DocumentGrid`, `DocumentList`.
16. Build `useDocumentQueryParams`, `BrowserToolbar` (search, filters, sort, view toggle) and `DocumentBrowser`.
17. Compose `/dashboard` (greeting + `RecentDocuments` + browser), then the other scopes via `scopes.ts`.
18. Add `useLocalDocuments` actions: star, rename, trash + undo, restore, delete forever. Add `RenameDialog` and `ShareDialog`.
19. Add `CommandMenu` (Cmd/Ctrl+K). Settings stub page.
20. Build `/documents/new` and wire every "New file" entry point. ✅ **Checkpoint 3:** full dashboard works on desktop.

### Stage D: Editor (Phase 7)

21. Define `engine/types.ts` and `session/types.ts` first. Build providers and mock implementations.
22. Build `(editor)` layout, `EditorShell`, `PageCanvas`, `MockContentRenderer`, `EditorSurface`, `.doc-prose`. (You should now see a document rendered.)
23. Build `SyncStatus` + `DevStatusSwitcher`, `PresenceAvatars`, `DocumentTitleInput`, `EditorMoreMenu`, `EditorTopBar`.
24. Build `ToolbarButton`, `ToolbarGroup`, `BlockTypeSelect`, `LinkPopover`, `EditorToolbar`.
25. Hook up `ShareDialog`, back navigation, blank-document handling, `notFound`. Write `features/editor/README.md` describing the Tiptap/Yjs swap. ✅ **Checkpoint 4:** create → open → edit-UI → share → back loop is complete.

### Stage E: Quality (Phase 8–10)

26. Mobile pass: dashboard first (sheet sidebar, filters sheet, FAB, list default), then editor (top bar, toolbar, full-bleed canvas), then landing and auth. Test at 320/375/768/1024/1440.
27. States pass: add/verify all `loading.tsx`, `error.tsx`, `not-found.tsx`, empty and no-results states, offline/error banners, toasts with Undo.
28. Polish: dark mode audit, a11y/keyboard audit, contrast, reduced motion, metadata/OG, remove dev-only pages, README, final lint/typecheck/build. ✅ **Checkpoint 5: Frontend complete.**

### After the frontend is done (out of scope now, for orientation only)

- **Auth:** replace `auth-client.ts` and `lib/session.ts` internals with `packages/auth` (Better Auth); add middleware/proxy protection for `(app)` and `(editor)`.
- **API:** replace bodies in `lib/data/*` with `fetch` to the Node server; delete `lib/mock/`. Consider TanStack Query for client-side caching/mutations.
- **Editor:** implement `useTiptapController(editor)`; replace `EditorSurface` internals with `EditorContent`; apply `.doc-prose` to `.ProseMirror`.
- **Collaboration:** implement a Yjs-based session driver behind `useDocumentSession()`; add the Tiptap collaboration + cursor extensions.

---

### Key principles to remember while building

1. **Pages compose; features implement.** Keep `page.tsx` thin.
2. **UI never imports mock data.** It calls `lib/data`.
3. **URL owns list state.** Search, filter, sort, and view live in query params.
4. **Editor UI talks to interfaces**: `EditorController` and `DocumentSession`.
5. **Semantic tokens only**: no raw colors in components.
6. **Every async thing has loading, empty, and error states from day one.**
7. **Design mobile deliberately**, not by shrinking desktop.
8. **Don't over-build**: no global store, no premature abstractions, and no real functionality beyond the UI.