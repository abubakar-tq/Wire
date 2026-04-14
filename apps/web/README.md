# WireFluid Web App

This workspace contains the player/admin frontend for WireFluid Fantasy Arena. It lives under `apps/web` so it can share the monorepo with the contracts package and Ponder indexer.

## Tech Stack
- **Framework**: [Next.js](https://nextjs.org/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Wallet/Contract Client**: [wagmi](https://wagmi.sh/) + [viem](https://viem.sh/)
- **Wallet UI**: [RainbowKit](https://www.rainbowkit.com/)
- **State Management**: Custom React Hooks
- **Icons**: [Lucide React](https://lucide.dev/)

## Project Structure
- `app/`: Next.js App Router pages, layouts, and API routes.
- `components/`: Reusable UI components.
  - `ui/`: Base Shadcn components.
  - `views/`: Page-specific view components.
- `hooks/`: Custom React hooks for business logic and UI state.
- `lib/`: Utility functions and mock data.
- `public/`: Static assets (images, icons).
- `src/`: Web3 client, SIWE helpers, indexer client, and contract config adapters.
- `styles/`: Global CSS and Tailwind configurations.
- `types/`: TypeScript type definitions.

## Getting Started

From the repository root, install dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm dev:web
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
