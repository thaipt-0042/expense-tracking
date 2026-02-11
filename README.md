# Expense Tracker

A Next.js application for tracking personal expenses built with TypeScript, Supabase, and Tailwind CSS.

## Features

- 💰 Track income and expenses
- 📊 Dashboard with financial overview
- 🏷️ Custom categories
- 📅 Period-based filtering (day/week/month)
- 📤 CSV export
- 🔐 Authentication with Google & GitHub OAuth

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 18+, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL 15+)
- **Authentication**: Supabase Auth with OAuth
- **Testing**: Vitest, React Testing Library, Playwright
- **Deployment**: Vercel (primary), Cloudflare Workers (secondary)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker (for local Supabase)
- Supabase CLI

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd expense_tracker
```

2. Install dependencies:

```bash
npm install
```

3. Start local Supabase:

```bash
npx supabase start
```

4. Copy environment variables:

```bash
cp .env.example .env.local
```

5. Update `.env.local` with your Supabase credentials from `npx supabase status`

6. Run the development server:

```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
expense_tracker/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard pages
│   ├── login/             # Authentication pages
│   └── api/               # API routes
├── lib/                   # Shared utilities
│   └── supabase/          # Supabase clients
├── types/                 # TypeScript type definitions
├── supabase/              # Supabase migrations and config
└── specs/                 # Feature specifications
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## Testing

```bash
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
```

## Database

The application uses Supabase (PostgreSQL) with the following tables:

- `users` - User profiles (managed by Supabase Auth)
- `categories` - Expense/income categories
- `transactions` - Financial transactions

Row Level Security (RLS) policies ensure users can only access their own data.

## License

MIT
