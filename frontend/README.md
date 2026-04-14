# Wire Frontend

This directory contains the Version 2 (v2) frontend implementation for the Wire project.

## Tech Stack
- **Framework**: [Next.js](https://nextjs.org/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: Custom React Hooks
- **Icons**: [Lucide React](https://lucide.dev/)

## Project Structure
- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable UI components.
  - `ui/`: Base Shadcn components.
  - `views/`: Page-specific view components.
- `hooks/`: Custom React hooks for business logic and UI state.
- `lib/`: Utility functions and mock data.
- `public/`: Static assets (images, icons).
- `styles/`: Global CSS and Tailwind configurations.
- `types/`: TypeScript type definitions.

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
