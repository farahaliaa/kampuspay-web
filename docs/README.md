# KampusPay Frontend
Next.js frontend for Kai, the AI financial agent.

## Setup Instructions
1. Install dependencies: `npm install`
2. Environment variables (`.env.local`): `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. Run development server: `npm run dev`
4. Open `http://localhost:3000` in your browser.

## Pages
- `/dashboard`: Overview of balances and spending.
- `/chat`: Conversational AI interface with Kai.
- `/simulator`: FX risk calculation.
- `/audit`: Live log of all AI decisions.