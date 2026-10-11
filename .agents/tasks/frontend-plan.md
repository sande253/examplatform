# Frontend Implementation Plan

This plan completes the exam platform frontend. The project uses Next.js 14, TypeScript, Tailwind CSS, shadcn/ui components, and follows a dark theme (bg-[#0F172A]/bg-slate-900, indigo-600 primary, emerald success, yellow warning, red error).

## Project Context

**Already Complete:**
- API client (c:\examplatform\frontend\src\lib\api.ts) with full backend integration
- Type definitions (c:\examplatform\frontend\src\lib\types.ts)
- Auth context with login/register/logout (c:\examplatform\frontend\src\lib\auth-context.tsx)
- Landing page (c:\examplatform\frontend\src\app\page.tsx)
- Login page (c:\examplatform\frontend\src\app\auth\login\page.tsx)
- Register page (c:\examplatform\frontend\src\app\auth\register\page.tsx)
- Dashboard page (c:\examplatform\frontend\src\app\dashboard\page.tsx)
- Papers browse page (c:\examplatform\frontend\src\app\papers\page.tsx)
- Paper detail page (c:\examplatform\frontend\src\app\papers\[id]\page.tsx)
- Test-taking page (c:\examplatform\frontend\src\app\test\[attemptId]\page.tsx) - fully functional
- Test results page (c:\examplatform\frontend\src\app\test\[attemptId]\results\page.tsx) - basic version
- Admin documents page (c:\examplatform\frontend\src\app\admin\documents\page.tsx)
- Admin users page (c:\examplatform\frontend\src\app\admin\users\page.tsx)
- Navbar component (c:\examplatform\frontend\src\components\navbar.tsx)
- Existing UI components: alert.tsx, badge.tsx, button.tsx, card.tsx, dialog.tsx, input.tsx, label.tsx, progress.tsx, select.tsx, separator.tsx, skeleton.tsx, tabs.tsx, textarea.tsx

**Build & Test Commands:**
- Build: `npm run build` (in frontend directory)
- Dev: `npm run dev` (starts Next.js dev server on port 3000)
- Lint: `npm run lint`

**Dependencies Already Installed:**
- @radix-ui/react-toast, @radix-ui/react-dropdown-menu, @radix-ui/react-avatar, @radix-ui/react-alert-dialog
- recharts (for analytics charts)
- react-hook-form, zod (for forms)
- All shadcn/ui dependencies

**UI Component Pattern:**
All shadcn/ui components follow this pattern:
- Use React.forwardRef for ref forwarding
- Use cn() utility from @/lib/utils for className merging
- Export named components with displayName
- Follow dark theme: bg-slate-800/900, border-slate-700, text-white/slate-300

---

## Implementation Plan

### Phase 1: Missing UI Components (Foundation)

- [ ] 1. Create toast notification system components.
      Files: 
      - c:\examplatform\frontend\src\components\ui\toast.tsx
      - c:\examplatform\frontend\src\components\ui\toaster.tsx
      - c:\examplatform\frontend\src\components\ui\use-toast.ts
      Following the shadcn/ui toast pattern using @radix-ui/react-toast. The toast component includes Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport. The use-toast hook manages toast state with toast(), dismiss(), and toasts array. Toaster component wraps ToastProvider and renders all toasts in a ToastViewport.
      Verify: Run `npm run build` in frontend directory. Build should succeed without TypeScript errors related to toast imports.

- [ ] 2. Create dropdown menu component.
      Files: c:\examplatform\frontend\src\components\ui\dropdown-menu.tsx
      Wrapper around @radix-ui/react-dropdown-menu with DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup. Dark theme styling: bg-slate-900 content, border-slate-700, text-white items with hover:bg-slate-800.
      Verify: Run `npm run build` in frontend directory. Build should succeed.

- [ ] 3. Create avatar component.
      Files: c:\examplatform\frontend\src\components\ui\avatar.tsx
      Wrapper around @radix-ui/react-avatar with Avatar, AvatarImage, AvatarFallback. Uses cn() utility, supports size variants, dark theme compatible.
      Verify: Run `npm run build` in frontend directory. Build should succeed.

- [ ] 4. Create alert dialog component.
      Files: c:\examplatform\frontend\src\components\ui\alert-dialog.tsx
      Wrapper around @radix-ui/react-alert-dialog with AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel. Dark theme: bg-slate-900 content, border-slate-700.
      Verify: Run `npm run build` in frontend directory. Build should succeed.

### Phase 2: Application-Specific Components

- [ ] 5. Create file upload component with drag-and-drop.
      Files: c:\examplatform\frontend\src\components\file-upload.tsx
      Drag-and-drop zone for PDF uploads with progress bar (uses Progress component). Shows file name, size, and upload progress percentage. Uses state for dragOver, uploading, progress. Accepts onUpload callback prop that receives File object. Dark theme: border-dashed border-slate-600, hover:border-indigo-500, bg-slate-800/50.
      Dependencies: Progress component (already exists), Upload icon from lucide-react.
      Verify: Run `npm run build` in frontend directory. Build should succeed.

- [ ] 6. Enhance test results page with complete features.
      Files: c:\examplatform\frontend\src\app\test\[attemptId]\results\page.tsx (modify existing)
      Add topic performance bar chart using recharts (if result.topic_performance exists), add detailed question-by-question review section below charts showing each question with user's answer, correct answer, explanation (if available), and correctness indicator. Use Card components for each question. Add "Retry Test" button linking back to paper detail page.
      Dependencies: Uses existing recharts, Card, Badge, Button components.
      Verify: Start backend (`cd c:\examplatform\backend && uvicorn app.main:app --reload`), start frontend (`cd c:\examplatform\frontend && npm run dev`), login, take a test, submit it, verify results page shows all sections including topic performance and question review.

### Phase 3: Missing Pages

- [ ] 7. Create pricing page.
      Files: c:\examplatform\frontend\src\app\pricing\page.tsx
      Create directory c:\examplatform\frontend\src\app\pricing first. Two-column comparison layout (FREE vs PREMIUM ₹199/mo) using Card components. List features with CheckCircle/XCircle icons: free papers (both), premium papers (premium only), tests per month (5 vs unlimited), full analytics (premium only), detailed explanations (premium only). Premium column has "Upgrade Now" button (links to /api/v1/subscriptions/checkout from subscriptionsAPI). FAQ section below with common questions in Accordion-style (use manual expand/collapse with state). Dark theme, indigo-600 CTA button, emerald-500 checkmarks.
      Dependencies: Navbar, Card, Button, Badge from existing components. CheckCircle, XCircle from lucide-react.
      Verify: Run `npm run dev`, navigate to http://localhost:3000/pricing, verify layout matches design, both columns render, CTA button exists.

- [ ] 8. Create test history page.
      Files: c:\examplatform\frontend\src\app\history\page.tsx
      Create directory c:\examplatform\frontend\src\app\history first. Fetches test history using testsAPI.getHistory(). Table/card layout showing: test date (format with date-fns), paper title (if available from result data), score percentage with color coding (emerald ≥70%, yellow ≥40%, red <40%), correct/incorrect/skipped counts, time taken, "View Results" link to /test/{id}/results. Sort by date descending. Empty state with BookOpen icon and "No tests taken yet" message. Uses Navbar, loading with Skeleton, filters by date range (optional).
      Dependencies: testsAPI, Navbar, Card, Badge, Button, Skeleton, format from date-fns, lucide-react icons.
      Verify: Run `npm run dev`, login, navigate to http://localhost:3000/history, verify history list renders with previous test attempts (if any exist from testing).

- [ ] 9. Create admin analytics dashboard page.
      Files: c:\examplatform\frontend\src\app\admin\analytics\page.tsx
      Fetches adminAPI.getAdminAnalytics(). Display stats cards at top (total_users, total_papers, total_questions, total_tests_taken, premium_subscribers with icons). Below, render charts using recharts: Line chart for registrations over time (if time-series data exists), Bar chart for tests per day (if available), Area chart for score distribution. Use ResponsiveContainer from recharts. Dark theme colors for charts: indigo-500 for lines/bars. Mock data structure if backend doesn't return time-series yet.
      Dependencies: adminAPI, Card, Skeleton, recharts (LineChart, BarChart, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer).
      Verify: Run `npm run dev`, login as admin (admin@examplatform.com / Admin@123), navigate to http://localhost:3000/admin/analytics, verify stats cards and at least one chart renders.

- [ ] 10. Enhance admin documents review page.
      Files: c:\examplatform\frontend\src\app\admin\documents\[id]\review\page.tsx (read existing, enhance if incomplete)
      Fetches adminAPI.getDocumentQuestions(id) to get extracted questions. Display questions in editable Card components with: question text (editable textarea), options (editable inputs), correct answer indicator, subject/topic/difficulty dropdowns, approve/reject buttons per question. Bulk approve button at top to approve all visible questions (calls adminAPI.bulkApprove with all question IDs). Individual approve calls adminAPI.approveQuestion(qId), reject calls adminAPI.rejectQuestion(qId). Show approval status badges. Use state to track editing.
      Dependencies: adminAPI methods (createQuestion, updateQuestion, approveQuestion, rejectQuestion, bulkApprove), Card, Button, Badge, Input, Textarea, Select.
      Verify: Run `npm run dev`, login as admin, upload and process a document (or use existing REVIEW_REQUIRED document), navigate to review page, verify questions display, click approve on one question, verify API call succeeds (check network tab).

- [ ] 11. Enhance admin papers management page.
      Files: c:\examplatform\frontend\src\app\admin\papers\page.tsx (read existing, enhance if incomplete)
      List existing papers from adminAPI.listAdminPapers() with title, subject, exam, questions_count, access_type, status. Each row has "Edit" and "Publish" buttons (if draft). "Create New Paper" button at top links to /admin/papers/new. Table shows paper details with badges for status (DRAFT/PUBLISHED) and access type (FREE/PREMIUM). Search filter by title/subject.
      Dependencies: adminAPI.listAdminPapers, Card, Button, Badge, Input, Skeleton.
      Verify: Run `npm run dev`, login as admin, navigate to http://localhost:3000/admin/papers, verify papers list renders, "Create New Paper" button exists.

- [ ] 12. Create/enhance admin papers create page.
      Files: c:\examplatform\frontend\src\app\admin\papers\new\page.tsx (read existing, enhance if incomplete)
      Form to create new paper: title (input), description (textarea), instructions (textarea), subject (input), exam (input), year (number input), duration (number, minutes), marks (number), access_type (select FREE/PREMIUM), questions (multi-select or search from approved questions). Submit calls adminAPI.createPaper(data), then optionally adminAPI.addPaperQuestions(paperId, questionIds) if questions selected. After success, redirect to /admin/papers. Uses react-hook-form + zod validation.
      Dependencies: adminAPI.createPaper, adminAPI.addPaperQuestions, adminAPI.listQuestions (to fetch approved questions for selection), react-hook-form, zod, Card, Button, Input, Textarea, Select, Label.
      Verify: Run `npm run dev`, login as admin, navigate to http://localhost:3000/admin/papers/new, fill form, submit, verify new paper appears in /admin/papers list.

- [ ] 13. Create admin questions management page.
      Files: c:\examplatform\frontend\src\app\admin\questions\page.tsx (read existing, enhance if incomplete)
      List approved questions from adminAPI.listQuestions() with filters: subject, topic, difficulty, approval_status. Table shows question_text (truncated), subject, topic, difficulty, approval_status badges. Each row has "Edit" button (opens inline edit or modal), "Approve/Reject" toggle. Pagination for large lists. Search by question text.
      Dependencies: adminAPI.listQuestions, Card, Button, Badge, Input, Select, Skeleton.
      Verify: Run `npm run dev`, login as admin, navigate to http://localhost:3000/admin/questions, verify questions list renders with filters working.

### Phase 4: Integration & Polish

- [ ] 14. Add toast notifications throughout the app.
      Files: Modify existing pages to use toast() hook from use-toast for success/error feedback:
      - c:\examplatform\frontend\src\app\auth\login\page.tsx
      - c:\examplatform\frontend\src\app\auth\register\page.tsx
      - c:\examplatform\frontend\src\app\admin\documents\page.tsx
      - c:\examplatform\frontend\src\app\admin\users\page.tsx
      Replace inline error text with toast notifications for upload success/failure, save success/failure, API errors. Import { useToast } from '@/components/ui/use-toast' and call toast({ title, description, variant }) on actions.
      Also add Toaster component to root layout (c:\examplatform\frontend\src\app\layout.tsx) inside body, after {children}.
      Verify: Run `npm run dev`, perform actions that trigger toasts (login with wrong password, upload document, etc.), verify toast notifications appear in bottom-right corner.

- [ ] 15. Add dropdown menu to navbar for user profile.
      Files: c:\examplatform\frontend\src\components\navbar.tsx (modify existing)
      Replace logout button with Avatar + DropdownMenu. Avatar shows user initials. Dropdown items: user.name (label, non-clickable), Separator, Dashboard link, Profile/Settings link (optional, can be placeholder), Separator, Logout button (calls logout()). Position dropdown to align right.
      Dependencies: Avatar, DropdownMenu components created earlier.
      Verify: Run `npm run dev`, login, verify avatar appears in navbar, click it, dropdown opens with menu items, click logout works.

- [ ] 16. Final verification and fixes.
      Run full build and manual testing. Fix any TypeScript errors, missing imports, or runtime issues discovered during testing. Check all routes load correctly, forms submit properly, API calls succeed, loading states work, error handling displays correctly, responsive design works on mobile/tablet/desktop viewports.
      Files: Any files needing fixes based on testing results.
      Verify: Run `npm run build` with zero errors. Run `npm run dev`, manually test all pages: landing, login, register, dashboard, papers browse, paper detail, start test, take test (answer questions, navigate, mark for review, submit), view results (with all charts), history, pricing, admin pages (documents, users, analytics, papers, questions, document review). All features work without console errors.

---

## Key Dependencies Between Steps

- Steps 1-4 (UI components) must complete before steps 5-16 that use them
- Step 5 (file-upload) needed for step 10 (admin documents review page enhancements)
- Steps 1-4 must complete before step 14 (toast integration)
- Step 2 (dropdown) must complete before step 15 (navbar enhancement)
- Step 6 depends on existing recharts and Card components
- Steps 7-13 can be done in any order after steps 1-5 complete
- Step 16 must be last

## Verification Commands

All verification uses:
- **Build check**: `cd c:\examplatform\frontend && npm run build` (must complete with 0 errors)
- **Dev server**: `cd c:\examplatform\frontend && npm run dev` (runs on http://localhost:3000)
- **Backend** (for full testing): `cd c:\examplatform\backend && uvicorn app.main:app --reload` (runs on http://localhost:8000)
- **Manual testing**: Open browser, test functionality, check console for errors

## Design Specifications

**Colors:**
- Background: bg-[#0F172A] (dark blue-gray) or bg-slate-900
- Cards: bg-slate-800/50 with border-slate-700
- Primary: bg-indigo-600, hover:bg-indigo-700
- Success: text-emerald-400, bg-emerald-600/20, border-emerald-600/30
- Warning: text-yellow-400, bg-yellow-600/20, border-yellow-600/30
- Error: text-red-400, bg-red-600/20, border-red-600/30
- Text: text-white (headings), text-slate-300 (body), text-slate-400 (muted)

**Typography:**
- Headings: font-bold, text-white
- Body: text-slate-300
- Muted: text-slate-400

**Spacing:**
- Page padding: px-6 py-8
- Card padding: p-6
- Component gaps: gap-4, gap-6

**Components:**
- All buttons use Button component with variants
- All cards use Card/CardHeader/CardTitle/CardContent structure
- All forms use react-hook-form + zod validation
- All data fetching shows loading state with Skeleton components
- All empty states show icon + message
