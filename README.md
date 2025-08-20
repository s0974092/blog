[<img src="https://img.shields.io/badge/English-blue" />](./README.md) [<img src="https://img.shields.io/badge/繁體中文-blue" />](./README.zh-TW.md) [<img src="https://img.shields.io/badge/简体中文-blue" />](./README.zh-CN.md)

# YJ's Tech & Life Notes - Blog Website

[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)
[![Dependency Check](https://github.com/s0974092/blog/actions/workflows/dependency-check.yml/badge.svg)](https://github.com/s0974092/blog/actions/workflows/dependency-check.yml)
[![Security Audit](https://github.com/s0974092/blog/actions/workflows/security.yml/badge.svg)](https://github.com/s0974092/blog/actions/workflows/security.yml)
[![Tests](https://github.com/s0974092/blog/actions/workflows/tests.yml/badge.svg)](https://github.com/s0974092/blog/actions/workflows/tests.yml)
[![Build & Deploy](https://github.com/s0974092/blog/actions/workflows/ci.yml/badge.svg)](https://github.com/s0974092/blog/actions/workflows/ci.yml)
[![Deploy to Vercel](https://img.shields.io/badge/deploy%20to-Vercel-black.svg)](https://yj-jason-blog.vercel.app)

A modern blog website built with Next.js 15, TypeScript, Tailwind CSS, and Supabase for a **fast and low-cost** professional blog setup. It features a static frontend, a private backend, allowing you to focus on content creation and manage it with ease.

You can also quickly set up a blog system like [YJ's Tech & Life Notes](https://yj-jason-blog.vercel.app).

![Preview](blog_screenshot.png)

![Frontend Demo](frontend_demo.gif)

![Backend Demo](backend_demo.gif)

⭐ If you find this project helpful, please give us a Star!

## 🚀 Features

- 📝 Rich Text Editor (based on Slate.js)
- 🎨 Modern and Responsive Design
- 🔍 Full-Text Search
- 📱 Mobile-Optimized
- 🔐 Secure Authentication
- 📊 Content Management System

## 🛠️ Tech Stack

- **Frontend Framework**: Next.js 15 (React 19)
- **Programming Language**: TypeScript
- **Styling Framework**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Editor**: Slate.js + Yoopta
- **UI Components**: Radix UI
- **Animation**: Framer Motion
- **Form Handling**: React Hook Form + Zod

## 📦 Open Source License

This project is licensed under the **MIT License**, which means:

✅ **You can freely use it** - for personal or commercial projects
✅ **You can modify it** - adjust the code to your needs
✅ **You can distribute it** - share it with others
✅ **You can use it for commercial purposes** - without paying any license fees

The only condition is to retain the original copyright and license notices.

For a more detailed analysis of the license, please refer to the [Open Source License Analysis Report](docs/license_analysis.md).


## 🔧 Installation and Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Vercel account

### Video Tutorial

- **Full Version (Installation + Demo):** [Watch on YouTube](https://youtu.be/LG7CuhAfsUc)
- **Installation Only:** [Watch on YouTube](https://youtu.be/XxWxfSJusfY)
- **Demo Only:** [Watch on YouTube](https://youtu.be/KfCgdcI2RrU)

### Installation Steps

```bash
# Clone the project
git clone https://github.com/s0974092/blog.git
cd blog

# Install dependencies
npm install

# Note: `npm install` will automatically run `npx prisma generate` to generate the Prisma Client. If you manually modify the `prisma/schema.prisma` file, remember to run `npx prisma generate` to update the Client.

# Set up environment variables
# Please refer to the `.env.example` file to set up your environment variables. Copy this file to `.env.local` and fill in your settings.
cp .env.example .env.local
# Edit the .env.local file and fill in your Supabase settings.
# When deploying to Vercel or other similar platforms in the future, you will need to enter the corresponding environment variables and values.

# Run the development server
npm run dev
```

### Database Setup

For detailed instructions on database initialization, migration, seeding, and RLS (Row-Level Security) setup, please refer to the [Database Setup Guide](docs/database-setup-guide.md).

### Local CI Checks

Before pushing your code to GitHub, you can run checks locally to ensure that the CI/CD pipeline will pass smoothly. For more details, please refer to the [Local Development Troubleshooting Guide](docs/local-dev-troubleshooting.md).

### More Documentation

Here are links to other important documents in the project, providing more in-depth technical details and development guides:

*   [Backend Features](docs/backend-features.md)
*   [Frontend Features](docs/frontend-features.md)
*   [Next.js Caching Strategies](docs/nextjs-caching-strategies.md)

## 📁 Project Structure

```
blog/
├── app/                         # Next.js App Router
│   ├── (public)/                # Public page route group
│   │   ├── about/               # About me page
│   │   │   ├── layout.tsx       # Page layout
│   │   │   └── page.tsx         # Page content
│   │   ├── blog/                # Blog page
│   │   ├── privacy/             # Privacy policy page
│   │   │   ├── layout.tsx       # Page layout
│   │   │   └── page.tsx         # Page content
│   │   ├── terms/               # Terms of use page
│   │   │   ├── layout.tsx       # Page layout
│   │   │   └── page.tsx         # Page content
│   │   └── login/               # Login page
│   ├── (admin)/                 # Admin backend route group
│   │   ├── dashboard/           # Dashboard
│   │   ├── posts/               # Post management
│   │   ├── categories/          # Category management
│   │   ├── sub-categories/      # Sub-category management
│   │   ├── tags/                # Tag management
│   │   └── layout.tsx           # Admin backend layout
│   ├── api/                     # API routes
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── providers.tsx            # Global providers
│   ├── robots.ts                # SEO
│   └── sitemap.ts               # Sitemap
├── components/                  # React components
│   ├── ui/                      # Base UI components
│   ├── blog/                    # Blog-related components
│   ├── post/                    # Post-related components
│   ├── category/                # Category-related components
│   ├── sub-category/            # Sub-category-related components
│   ├── tag/                     # Tag-related components
│   └── layout/                  # Layout components
│       ├── public/              # Public page layout
│       │   ├── Header.tsx       # Page header
│       │   ├── Footer.tsx       # Page footer
│       │   └── PublicLayout.tsx # Public page layout
│       └── admin/               # Admin backend layout
├── lib/                         # Utility functions and settings
│   ├── utils.ts                 # Common utility functions
│   ├── constants.ts             # Constant definitions
│   ├── auth.ts                  # Authentication-related
│   ├── server-auth.ts           # Server-side authentication
│   ├── supabase.ts              # Supabase settings
│   └── prisma.ts                # Prisma settings
├── prisma/                      # Database-related
│   ├── schema.prisma            # Database schema definition
│   └── migrations/              # Database migration files
├── public/                      # Static assets
│   ├── images/                  # Image assets
│   └── yj-brand-logo.png        # Brand logo
├── LICENSE                      # MIT License
├── README.md                    # Project documentation
└── package.json                 # Project dependency configuration
```

## 🤝 Contribution Guide

We welcome community contributions! Please refer to the [Contribution Guide](CONTRIBUTING.md) for more details on how to get started.

## 📜 Code of Conduct

We expect all contributors to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please take the time to read it before participating in this project.

## 📄 License Details

This project uses the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact Information

- **Email**: s0974092@gmail.com
- **GitHub**: [@s0974092](https://github.com/s0974092)
- **Project Address**: [YJ's Tech & Life Notes](https://github.com/s0974092/blog)

## 🙏 Acknowledgements

Thanks to all the contributors of open source projects, especially:

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://www.radix-ui.com/) - UI component library
- [Slate.js](https://docs.slatejs.org/) - Rich text editor framework
