# Implementation Plan: Light Theme UI Transformation

This plan transforms the exam platform frontend from dark theme to a modern light theme with animations.

## Phase 1: Core Theme System (FEAT-001)

- [ ] 1. Update CSS variables in `src/app/globals.css` to light theme palette.
      Replace all :root CSS variables with light theme values: background becomes white (0 0% 100%), foreground becomes dark (222.2 84% 4.9%), primary becomes indigo-600 (221.2 83.2% 53.3%), secondary/muted/accent become slate-100 (210 40% 96.1%), border/input become slate-200 (214.3 31.8% 91.4%).
      Files: src/app/globals.css
      Verify: `npm run build` — TypeScript compiles with no errors.

- [ ] 2. Remove dark mode class from layout.
      Remove `className="dark"` from the `<html>` element in src/app/layout.tsx, keeping only `lang="en"`.
      Files: src/app/layout.tsx
      Verify: `npm run build` — successful compilation.

## Phase 2: Page Component Migration (FEAT-002)

- [ ] 3. Update landing page to light theme.
      In src/app/page.tsx: replace bg-[#0F172A] with bg-gradient-to-b from-slate-50 to-white, text-slate-50 with text-slate-900, border-slate-800 with border-slate-200, text-slate-300/400 with text-slate-700/600, bg-slate-800/50 with bg-white, hover:bg-slate-800 with hover:bg-slate-100. Keep indigo accent colors.
      Files: src/app/page.tsx
      Verify: `npm run build` — compiles successfully.

- [ ] 4. Update authentication pages to light theme.
      Apply to src/app/auth/login/page.tsx and src/app/auth/register/page.tsx: replace bg-[#0F172A] with bg-gradient-to-br from-indigo-50 via-white to-purple-50, bg-slate-900 with bg-white, border-slate-800 with border-slate-200, text-white with text-slate-900, text-slate-300 with text-slate-700, text-slate-400 with text-slate-600, bg-slate-800 with bg-slate-50, border-slate-700 with border-slate-300.
      Files: src/app/auth/login/page.tsx, src/app/auth/register/page.tsx
      Verify: `npm run build` — successful compilation.

- [ ] 5. Update dashboard, papers, and history pages to light theme.
      Apply to src/app/dashboard/page.tsx, src/app/papers/page.tsx, src/app/history/page.tsx: replace bg-[#0F172A] with bg-slate-50, text-slate-50 with text-slate-900, bg-slate-800/50 with bg-white, border-slate-700 with border-slate-200, text-white with text-slate-900, text-slate-400 with text-slate-600, hover:bg-slate-700/50 with hover:bg-slate-100.
      Files: src/app/dashboard/page.tsx, src/app/papers/page.tsx, src/app/history/page.tsx
      Verify: `npm run build` — compiles with no errors.

- [ ] 6. Update navbar and shared components to light theme.
      Update src/components/navbar.tsx: replace bg-slate-900/80 with bg-white/80, border-slate-800 with border-slate-200, text-slate-300 with text-slate-700, hover:bg-slate-800 with hover:bg-slate-100, text-white with text-slate-900. Update src/components/file-upload.tsx and src/components/ui/alert.tsx with same pattern.
      Files: src/components/navbar.tsx, src/components/file-upload.tsx, src/components/ui/alert.tsx
      Verify: `npm run build` — successful compilation.

## Phase 3: Animations and Polish (FEAT-003)

- [ ] 7. Install framer-motion for animations.
      Run `npm install framer-motion` from c:\examplatform\frontend directory.
      Files: package.json (modified by npm)
      Verify: `npm run build` — framer-motion installs and build succeeds.

- [ ] 8. Add entrance animations to landing page.
      In src/app/page.tsx: wrap hero h1/p in motion.div with fade-in from bottom animation (initial={{ opacity: 0, y: 20 }}, animate={{ opacity: 1, y: 0 }}), wrap feature cards with hover scale effect (whileHover={{ scale: 1.05 }}). Add rotating animation to Brain icon.
      Files: src/app/page.tsx
      Verify: `npm run build` then `npm run dev` — visual check animations work smoothly.

- [ ] 9. Add micro-interactions to dashboard and papers pages.
      In src/app/dashboard/page.tsx: wrap stat cards with staggered fade-in (delay: index * 0.1), add hover lift to list items (whileHover={{ y: -4 }}). In src/app/papers/page.tsx: wrap cards with scale and shadow on hover.
      Files: src/app/dashboard/page.tsx, src/app/papers/page.tsx
      Verify: `npm run build` then `npm run dev` — verify animations at /dashboard and /papers.

- [ ] 10. Add button animations to navbar.
      In src/components/navbar.tsx: wrap nav buttons in motion.div with whileHover={{ scale: 1.05 }}, whileTap={{ scale: 0.95 }}.
      Files: src/components/navbar.tsx
      Verify: `npm run build` then `npm run dev` — test navbar button interactions.

## Final Verification

Run `npm run build` to ensure all TypeScript compiles correctly. Start dev server with `npm run dev` and visually verify:
- Landing page (http://localhost:3000) has light theme with gradient background and animations
- Auth pages (/auth/login, /auth/register) have light gradient backgrounds
- Dashboard (/dashboard), Papers (/papers), History (/history) have light slate backgrounds with white cards
- Navbar has light theme across all pages
- All animations are smooth and performant
