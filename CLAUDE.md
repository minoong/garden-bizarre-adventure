# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Garden Bizarre Adventure** is a Next.js 15 social media platform using the App Router with TypeScript, React 19, MUI v7, and Tailwind CSS v4. The project follows Feature-Sliced Design (FSD) architecture and uses Supabase for backend services and Firebase Storage for file uploads.

## Development Commands

### Basic Commands

```bash
pnpm dev              # Start development server with Turbopack
pnpm build            # Build for production with Turbopack
pnpm start            # Start production server
pnpm lint             # Run ESLint
```

### Storybook

```bash
pnpm storybook        # Start Storybook dev server on port 6006
pnpm build-storybook  # Build Storybook for production
```

### Release Management

```bash
pnpm release          # Create a new release using semantic-release
pnpm release:dry      # Dry-run to preview the next release
```

### Git Hooks

- Husky is configured for pre-commit hooks
- Commitlint enforces conventional commit messages (Korean support enabled)
- Lint-staged runs ESLint and Prettier on staged files

## Architecture

### Feature-Sliced Design (FSD)

The project follows FSD methodology with these layers:

```
src/
├── app/              # Next.js App Router pages and layouts
│   └── providers/    # React context providers (auth, layout, etc.)
├── widgets/          # Large UI compositions (header, footer, hero sections)
├── features/         # Business logic features (auth, tabs, etc.)
│   └── [feature]/
│       ├── ui/       # Feature-specific UI components
│       ├── model/    # State management
│       └── lib/      # Feature utilities
├── entities/         # Business entities
├── shared/           # Shared utilities and components
│   ├── ui/           # Reusable UI components (dropzone, container, etc.)
│   ├── lib/          # Shared libraries (supabase, firbase, utils)
│   ├── api/          # API utilities
│   └── config/       # Configuration files
└── pages/            # Page compositions (FSD layer)
```

**Important**: New features should follow this structure. Place utilities in `shared/lib/`, reusable components in `shared/ui/`, and feature-specific code in `features/[feature-name]/`.

### Key Design Patterns

1. **Index-based exports**: Each module has an `index.ts` that exports public API
2. **Type imports**: Use `import type` for type-only imports (enforced by ESLint)
3. **Path aliases**: Use `@/` for absolute imports from `src/`

## Technology Stack

### Frontend

- **Next.js 15** with App Router and Turbopack
- **React 19** with React DOM 19
- **MUI v7** (Material-UI) - Component library
  - **IMPORTANT**: MUI v7 does NOT have `Grid2`. Use regular `Grid` component with `item` and `xs`/`sm` props
  - Example: `<Grid container><Grid item xs={12} sm={6}>...</Grid></Grid>`
- **Tailwind CSS v4** - Utility-first CSS
- **Motion** (Framer Motion) - Animations
- **TanStack Query** - Server state management

### Backend & Services

- **Supabase** - Database, authentication, and backend services
  - Client: `src/shared/lib/supabase/client.ts`
  - Migrations: `supabase/migrations/`
  - Schema reference: `supabase/schema.sql`
- **Firebase Storage** - File uploads
  - Client: `src/shared/lib/firbase/client.ts` (note: typo "firbase" is intentional in folder name)
  - Upload utility: `src/shared/lib/firbase/upload.ts`
  - Supports parallel uploads with progress tracking

### Development Tools

- **Storybook** - Component development and documentation
- **Vitest** - Testing framework with Playwright browser testing
- **ESLint** - Code linting with custom rules
- **Prettier** - Code formatting with Tailwind plugin
- **Husky** - Git hooks
- **lint-staged** - Pre-commit linting
- **commitlint** - Commit message validation
- **semantic-release** - Automated versioning and changelog

## Environment Setup

Create `.env.local` based on `.env.local.example`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Firebase (add these)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Code Standards

### Import Ordering (enforced by ESLint)

```typescript
// 1. Built-in modules
import { useState } from 'react';

// 2. External modules
import { Button } from '@mui/material';

// 3. Internal modules (@/ alias)
import { Dropzone } from '@/shared/ui/dropzone';

// 4. Relative imports
import { useAuth } from './hooks';
```

### TypeScript

- Strict mode enabled
- Use `type` imports: `import type { MyType } from './types'`
- Unused vars starting with `_` are allowed

### Commit Messages (Korean Support)

Uses Conventional Commits with Korean descriptions:

```bash
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 변경
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가/수정
chore: 빌드 태스크 업데이트
perf: 성능 개선
ci: CI 관련 설정
build: 빌드 시스템 변경
revert: 커밋 되돌리기
```

- Subject max length: 100 characters
- Body max line length: 200 characters
- Commits with `[skip ci]` are ignored

## Supabase Development

### Local Supabase Setup

```bash
supabase start        # Start local Supabase (ports: API=54321, DB=54322, Studio=54323)
supabase stop         # Stop local instance
supabase status       # Check service status
```

### Database Migrations

- Apply migrations through Supabase MCP tools or CLI
- Schema is defined in `supabase/schema.sql` (reference only)
- Current schema includes social media tables: profiles, posts, comments, likes, follows, etc.

### Database Schema Overview

The database implements a full social media platform with:

- User profiles and authentication
- Posts with images and tagging
- Comments with nested replies
- Likes on posts and comments
- Bookmarks and follows
- Full-text search on posts
- Row Level Security (RLS) policies on all tables

## Firebase Storage

### File Upload Utility

Located at `src/shared/lib/firbase/upload.ts`:

```typescript
import { uploadFiles } from '@/shared/lib/firbase';

// Upload multiple files in parallel
const results = await uploadFiles(files, {
  path: 'images/',
  onProgress: (progress) => {
    // Track upload progress
    console.log(progress);
  },
  fileNameGenerator: (file) => `custom-${file.name}`,
});
```

Features:

- Parallel uploads with `Promise.allSettled`
- Individual file failure handling
- Progress tracking per file
- Returns `getDownloadURL` on success
- Statuses: `pending`, `uploading`, `success`, `error`

## CI/CD

### GitHub Actions Workflows

1. **CI** (`.github/workflows/ci.yml`)
   - Runs on PRs
   - Validates commit messages
   - Runs ESLint
   - Builds the project

2. **Release** (`.github/workflows/release.yml`)
   - Automated releases with semantic-release
   - Updates CHANGELOG.md
   - Creates GitHub releases
   - Updates package.json version

3. **Storybook** (`.github/workflows/storybook.yml`)
   - Deploys Storybook to GitHub Pages

## Common Patterns

### MUI Components

```typescript
// Correct Grid usage (v7 does NOT have Grid2)
<Grid container spacing={2}>
  <Grid item xs={12} sm={6}>
    <Card>...</Card>
  </Grid>
</Grid>

// Avoid: Grid2 (does not exist in MUI v7)
```

### File Upload with Progress

See `/upload/playground` page for a complete example of:

- File selection with Dropzone
- Upload progress tracking
- Result display with MUI components

### Supabase Client Usage

```typescript
import { supabase } from '@/shared/lib/supabase/client';

// Example query
const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
```

## Important Notes

1. **Firebase folder naming**: The folder is named `firbase` (not `firebase`) - this is intentional
2. **MUI Grid2**: Does not exist in MUI v7 - use regular `Grid` component
3. **Import style**: Always use type imports for TypeScript types
4. **Korean commits**: Commit messages in Korean are supported and encouraged
5. **Turbopack**: Both dev and build use Turbopack for faster builds
