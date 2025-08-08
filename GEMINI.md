# GEMINI.md

This file provides a comprehensive overview of the project, its structure, and how to work with it. It is intended to be a living document that is updated as the project evolves.

## Project Overview

This is a modern blog website built with Next.js 15, TypeScript, Tailwind CSS, and Supabase. It features a rich text editor, full-text search, and a content management system. The project is designed to be easily deployable on Vercel.

## Key Technologies

*   **Framework:** Next.js 15 (with React 19)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **Database:** Supabase (PostgreSQL)
*   **ORM:** Prisma
*   **Rich Text Editor:** Slate.js with Yoopta
*   **UI Components:** Radix UI
*   **State Management:** React Query
*   **Form Handling:** React Hook Form with Zod
*   **Testing:** Jest with React Testing Library

## Project Structure

The project follows the standard Next.js App Router structure.

```
blog/
├── app/                         # Next.js App Router
│   ├── (public)/                # Public-facing pages
│   ├── (admin)/                 # Admin dashboard pages
│   ├── api/                     # API routes
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/                  # React components
│   ├── ui/                      # Basic UI components
│   └── ...                      # Other component groups
├── lib/                         # Utility functions and configurations
├── prisma/                      # Database schema and migrations
├── public/                      # Static assets
├── styles/                      # Global styles
├── tests/                       # Jest tests
└── ...                          # Other configuration files
```

## Getting Started

### Prerequisites

*   Node.js 18+
*   npm or yarn
*   A Supabase account

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/s0974092/blog.git
    cd blog
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file by copying the example file:
    ```bash
    cp .env.example .env.local
    ```
    Then, fill in the required values in `.env.local`.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

## Available Scripts

*   `npm run dev`: Starts the development server.
*   `npm run build`: Builds the application for production.
*   `npm run start`: Starts the production server.
*   `npm run lint`: Lints the codebase using ESLint.
*   `npm run test`: Runs the Jest test suite.
*   `npm run format-fix`: Formats the code using Prettier.
*   `npm run ci:local`: Runs all checks locally to simulate the CI/CD pipeline.

## Development Conventions

*   **Coding Style:** The project uses ESLint and Prettier to enforce a consistent coding style. Please run `npm run lint` and `npm run format-fix` before committing your changes.
*   **Testing:** Unit tests are written with Jest and React Testing Library. All new features should be accompanied by corresponding tests.
*   **Commit Messages:** Commit messages should follow the Conventional Commits specification.
*   **Branching:** New features should be developed in a separate branch and then merged into `main` via a pull request.
