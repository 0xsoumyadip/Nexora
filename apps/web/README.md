# Docly web

The Next.js UI for Docly, a collaborative-document workspace. This phase is intentionally UI-only: authentication, document data, editor content, and collaboration are represented by mock interfaces and local UI state.

## Run

From the repository root, run `pnpm --filter web dev`. The app is available at `http://localhost:3000`.

## Structure

- `app/` contains App Router routes and layouts.
- `features/` owns the marketing site, authentication screens, application shell, document browser, and editor UI.
- `lib/data/` is the mock data-access boundary. UI components must not import mock data directly.
- `types/` contains domain types shared between pages and features.

## Integration points

- Replace `lib/data/documents.ts` with API calls when document endpoints are available.
- Replace mock auth UI behavior with `@nexora/auth` once the Better Auth endpoint is configured.
- The editor toolbar and surface are kept separate so a Tiptap controller can replace the UI mock.
- Sync and collaborator display are UI-only today; connect them to a Yjs provider when realtime collaboration is introduced.

## Verification

`next typegen`, TypeScript, ESLint, and `next build` pass from this package directory.
