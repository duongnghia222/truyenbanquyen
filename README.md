## Project Structure

This project follows the Next.js App Router architecture. Below is a detailed breakdown of the project structure:

### Root Directory

```
/
├── .next/               # Next.js build output
├── .git/                # Git repository
├── .vscode/             # VS Code configuration
├── node_modules/        # Dependencies
├── public/              # Static assets
├── scripts/             # Build and deployment scripts
├── src/                 # Source code
├── mongodb-csv-export/  # Database export files
├── .env                 # Environment variables
├── .env.production      # Production environment variables
├── .gitignore           # Git ignore file
├── ecosystem.config.js  # PM2 configuration
├── next.config.js       # Next.js configuration
├── package.json         # Project dependencies and scripts
├── postcss.config.mjs   # PostCSS configuration
├── tailwind.config.ts   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── vercel.json          # Vercel deployment configuration
```

### Source Code Structure (`/src`)

```
src/
├── app/                 # Next.js App Router pages and routes
│   ├── api/             # API routes
│   ├── auth/            # Authentication pages
│   ├── novels/          # Novel related pages
│   ├── profile/         # User profile pages
│   ├── reading-history/ # Reading history pages
│   ├── my-novels/       # User's novel management
│   ├── novel-list/      # Novel listing pages
│   ├── bookmark/        # Bookmarks functionality
│   ├── notifications/   # User notifications
│   ├── globals.css      # Global CSS
│   ├── layout.tsx       # Root layout component
│   ├── page.tsx         # Homepage
│   └── metadata.ts      # SEO metadata
│
├── components/          # Reusable UI components
│   ├── analytics/       # Analytics components
│   ├── common/          # Common UI elements
│   ├── features/        # Feature-specific components
│   ├── layout/          # Layout components
│   ├── providers/       # Context providers
│   └── ui/              # UI component library
│
├── lib/                 # Utility functions and shared libraries
├── models/              # Database models
├── types/               # TypeScript type definitions
├── config/              # Application configuration
├── migrations/          # Database migrations
├── seeders/             # Database seed data
└── middleware.ts        # Next.js middleware
```

### API Structure (`/src/app/api`)

```
api/
├── auth/                # Authentication endpoints
├── chapter-comments/    # Chapter comments API
├── comments/            # General comments API
├── cron/                # Scheduled tasks
├── debug/               # Debugging endpoints
├── novels/              # Novel management endpoints
└── user/                # User management endpoints
```

This structure follows Next.js best practices with the App Router architecture, organizing code by feature while maintaining clear separation of concerns. The application uses TypeScript for type safety and includes configuration for various tools like Tailwind CSS and PostCSS for styling.
