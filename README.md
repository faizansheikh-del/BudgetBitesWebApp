# Budget Bites — Save More on Groceries, Eat Better

Budget Bites is a smart grocery shopping companion that helps you compare prices across nearby stores, discover cheaper and healthier alternatives, track your spending, and stay within your budget.

## Features

- **Price Comparison** — Compare grocery prices across multiple stores in your area
- **Budget Tracking** — Set monthly budgets and track expenses by category
- **AI-Powered Insights** — Get personalized spending advice and saving tips
- **Community Prices** — Crowdsourced price reports with voting
- **Meal Planning** — Plan meals and generate shopping lists
- **Shared Lists** — Collaborate on shopping lists with family and friends
- **Weekly Deals** — Browse current deals and promotions
- **Receipt Scanning** — Track purchases by logging receipts
- **Loyalty Programs** — Manage store loyalty cards and rewards
- **Store Reviews** — Rate and review grocery stores

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- **AI**: Google Gemini for budget insights
- **3D**: React Three Fiber for logo animations

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd budget-bites

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React context providers (Auth, ShoppingList)
├── hooks/          # Custom React hooks
├── pages/          # Page-level components
├── integrations/   # Backend client configuration
└── assets/         # Static assets
```

## Environment Variables

Create a `.env` file with the following variables:

```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-key>
```

## License

MIT
