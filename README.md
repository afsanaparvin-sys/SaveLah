# Savelah 💰

A collaborative savings management web app that helps users set goals, automate transfers, and track progress together.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: OutSystems (low-code backend & scheduled jobs)
- **Auth**: OutSystems built-in user management

## Project Structure

```
frontend/
├── app/
│   ├── ActivityPage/        # Transaction history view
│   ├── GoalDetailsPage/     # Individual goal progress & members
│   ├── GoalsPage/           # All goals overview
│   ├── Login/               # Auth pages
│   ├── PaymentsPage/        # Payment gateway & round-up settings
│   ├── ProfilePage/         # User profile management
│   ├── TransfersPage/       # Auto-transfer setup
│   └── WithdrawPage/        # Withdrawal flow
├── components/
│   ├── Dashboard/           # Dashboard widgets
│   ├── Forms/               # Reusable form components
│   ├── Goals/               # Goal cards, progress bars
│   ├── Layout/              # Sidebar, Topbar, DashboardLayout
│   └── ui/                  # Base UI primitives (buttons, inputs, etc)
├── hooks/                   # Custom React hooks
└── lib/                     # API clients, helpers, constants
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/your-org/savelah.git
cd savelah/frontend
npm install
npm run dev
```

App runs at `http://localhost:3000`

### Environment Variables

Create a `.env.local` file in `/frontend`:

```
NEXT_PUBLIC_API_BASE_URL=<OutSystems backend URL>
```

## Key Features

| Feature | Description |
|---|---|
| Automatic Monthly Transfers | Scheduled auto-debit from linked bank account to savings goal |
| Collaborative Goals | Multiple users contribute to a shared goal with defined roles (Owner, Admin, Invitee) |
| Goal Progress Tracker | Visual breakdown of each member's contribution vs target |
| Round-up Savings | Rounds up payment transactions and splits remainder across goals |
| Withdrawal | Owner-initiated withdrawal with ledger balance checks |

## Development Guidelines

- **Branching**: `feature/<your-name>/<feature-name>` — e.g. `feature/zhengwei/goal-progress`
- **PRs**: Always PR into `main`, get at least 1 review before merging
- **Components**: Keep components in their relevant folder; don't dump everything in `ui/`
- **API Calls**: All OutSystems API calls go through `lib/` — don't call fetch directly in components
- **TypeScript**: No `any` types — define proper interfaces in `lib/types.ts`

## Team

| Name | Role |
|---|---|
| [Your name] | ... |

A few things to **fill in before sharing**: the actual GitHub URL, your OutSystems backend URL, and the team table. You may also want to add a `CONTRIBUTING.md` if the team is larger, but for a small group this README is enough to get everyone oriented.
