# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Installation
`npm install`

### Development Server
`npm run dev`

### Local CI Checks
- **Basic checks (TypeScript + Tests):** `npm run ci:basic` (~5 seconds)
- **Quick checks (Basic + Security Audit):** `npm run ci:quick` (~10 seconds)
- **Pre-commit checks (Basic + Code Quality):** `npm run ci:pre-commit` (~8 seconds)
- **Pre-push checks (Full check):** `npm run ci:pre-push` (~15 seconds)
- **Local full check (simulates CI/CD):** `npm run ci:local` (~20 seconds)

### Code Quality Tools
- **Auto-fix ESLint issues:** `npm run lint:fix`
- **Auto-format code:** `npm run format-fix`
- **Run ESLint:** `npm run lint`
- **Run TypeScript check:** `npm run type-check`
- **Run tests:** `npm test`

### Environment Variables
Refer to `.env.example` for required environment variables, including Supabase settings and optional HuggingFace API key.

## High-Level Code Architecture and Structure

This project is a modern blog website built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

### Application Structure (`app/`)
- **`(public)/`**: Contains public-facing pages like About, Blog, Privacy, Terms, and Login.
- **`(admin)/`**: Contains administrative backend pages for managing Dashboard, Posts, Categories, Sub-categories, and Tags.
- **`api/`**: Houses API routes for various functionalities, including AI image generation, CRUD operations for categories, posts, sub-categories, and tags, and slug validation.
- **`layout.tsx`**: Root layout for the entire application.
- **`page.tsx`**: Homepage.
- **`providers.tsx`**: Global providers for context, themes, etc.
- **`robots.ts` and `sitemap.ts`**: For SEO optimization.

### Components (`components/`)
Organized into subdirectories based on their function:
- **`ui/`**: Basic UI components (e.g., button, input, dialog).
- **`blog/`**: Components specific to blog features (e.g., `ArticleToc.tsx`, `BlogCard.tsx`).
- **`post/`**: Components related to post management (e.g., `PostEditor.tsx`, `PostForm.tsx`).
- **`category/`, `sub-category/`, `tag/`**: Components for managing categories, sub-categories, and tags.
- **`layout/`**: Contains `public` and `admin` layout components (`Header.tsx`, `Footer.tsx`, `PublicLayout.tsx`, `AdminLayout.tsx`).

### Libraries and Utilities (`lib/`)
- **`utils.ts`**: General utility functions.
- **`constants.ts`**: Constant definitions.
- **`auth.ts` and `server-auth.ts`**: Authentication-related functionalities.
- **`supabase.ts`**: Supabase configuration.
- **`prisma.ts`**: Prisma ORM configuration.

### Database (`prisma/`)
- **`schema.prisma`**: Defines the database schema.
- **`migrations/`**: Contains database migration files.

### Public Assets (`public/`)
Static assets like images and favicons.

### Styles (`styles/`)
Global CSS styles.

### Testing (`tests/`)
Unit tests using Jest (e.g., `category.test.ts`).
