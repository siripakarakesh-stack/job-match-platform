# CareerAI Development Guide

## Getting Started with Development

### Initial Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Setup Supabase**

- Create a new Supabase project at https://supabase.com
- Copy your project URL and API keys
- Create the required tables (see schema below)
- Enable RLS policies
- Create `cvs` storage bucket

3. **Setup n8n**

- Deploy n8n (locally or cloud)
- Create a webhook workflow
- Get the webhook URL

4. **Configure Environment**

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials.

### Database Setup

Run these SQL commands in Supabase SQL editor:

```sql
-- Create profiles table
create table profiles (
  id uuid primary key references auth.users(id),
  full_name text not null,
  email text not null,
  job_preference text,
  location text,
  cv_url text,
  profile_summary text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create jobs table
create table jobs (
  job_id text primary key,
  company text not null,
  role text not null,
  apply_link text,
  location text,
  tags text[],
  description text,
  created_at timestamp default now()
);

-- Create matched_jobs table
create table matched_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  job_id text not null references jobs(job_id),
  match_score integer,
  matched_at timestamp default now()
);

-- Enable RLS
alter table profiles enable row level security;
alter table matched_jobs enable row level security;

-- Create RLS policies
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can view own matched jobs" on matched_jobs
  for select using (auth.uid() = user_id);
```

### Running the App

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Linting
npm run lint
```

## Project Structure

```
src/
├── app/
│   ├── api/                  # API routes
│   ├── auth/                 # Auth pages and layout
│   ├── dashboard/            # Dashboard pages
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page (redirect)
├── components/
│   ├── auth/                # Auth forms
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── dashboard/           # Dashboard components
│   │   ├── CVUploader.tsx
│   │   ├── JobCard.tsx
│   │   ├── JobsList.tsx
│   │   ├── ProfileSummary.tsx
│   │   └── Sidebar.tsx
│   └── ui/                  # Reusable UI components
│       ├── Badge.tsx
│       ├── Spinner.tsx
│       └── Toast.tsx
├── lib/
│   ├── supabase/            # Supabase utilities
│   │   ├── client.ts        # Browser client
│   │   ├── middleware.ts    # Auth middleware
│   │   └── server.ts        # Server client
│   ├── n8n.ts              # n8n integration
│   └── utils.ts            # Utility functions
├── types/
│   └── index.ts            # TypeScript types
├── middleware.ts           # Next.js middleware
└── tailwind.config.ts      # Tailwind config
```

## Component Hierarchy

```
RootLayout
└── DashboardLayout (protected)
    ├── Sidebar
    │   └── ProfileSummary
    ├── Dashboard/Upload Page
    │   └── CVUploader
    └── Jobs Page
        └── JobsList
            └── JobCard[]
                ├── Badge
                └── Toast

AuthLayout
└── AuthPage
    ├── RegisterForm
    └── LoginForm
```

## Key Workflows

### 1. User Registration
1. User fills registration form
2. Form validates input
3. User created in Supabase Auth
4. Profile created in `profiles` table
5. User redirected to login

### 2. CV Upload & Matching
1. User uploads PDF from dashboard
2. File uploaded to Supabase Storage
3. Profile updated with CV URL
4. n8n webhook triggered with CV data
5. n8n processes CV and finds matches
6. Matches stored in `matched_jobs` table
7. User sees matched jobs

### 3. CV Download
1. User clicks "Download CV" on job card
2. API generates tailored PDF
3. PDF includes user info + job details
4. Browser downloads PDF

## API Routes

### POST /api/upload-cv
- Upload and store CV file
- Update user profile
- Trigger n8n workflow

### POST /api/generate-cv
- Generate tailored PDF for job
- Include user profile + job details

### GET /api/matched-jobs
- Fetch all matched jobs for user
- Return with match scores

## Authentication Flow

The app uses Supabase Auth with middleware:

1. User logs in → `supabase.auth.signInWithPassword()`
2. Session stored in cookies
3. Middleware refreshes session on each request
4. Protected routes check for session
5. Unauthorized users redirected to `/auth`

## Styling

The project uses **Tailwind CSS** with a custom color scheme:

```css
/* Color Variables */
--background: #0A0F1E      /* Dark navy */
--surface: #111827         /* Slightly lighter */
--primary: #6366F1         /* Indigo */
--secondary: #22D3EE       /* Cyan */
--success: #10B981         /* Green */
--error: #EF4444           /* Red */
```

Custom classes:
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.card` - Card component
- `.shimmer-text` - Shimmer animation

## Common Tasks

### Add a new page
1. Create folder in `src/app/`
2. Add `page.tsx` with default export
3. Wrap with layout if needed
4. Add to navigation if applicable

### Add a new component
1. Create `.tsx` file in `src/components/`
2. Use `'use client'` directive if interactive
3. Export as default
4. Use TypeScript interfaces for props

### Add environment variable
1. Add to `.env.local`
2. Add to `.env.local.example` (without value)
3. Access with `process.env.VAR_NAME`
4. Use `NEXT_PUBLIC_` prefix for client-side

### Debug API route
1. Add console.log statements
2. Check browser Network tab
3. Check server terminal output
4. Verify environment variables

## Testing

### Manual Testing Checklist

- [ ] Registration form validation
- [ ] Login with wrong credentials
- [ ] Successful login
- [ ] CV upload (valid PDF)
- [ ] CV upload (invalid file)
- [ ] View matched jobs
- [ ] Job card interactions
- [ ] Download CV
- [ ] Mobile responsiveness
- [ ] Sign out

### Common Issues

**"Unauthorized" on API routes**
- Check Supabase session
- Verify cookies are set
- Check middleware is running

**"File not found" in storage**
- Verify bucket exists: `cvs`
- Check RLS policies
- Check file path format

**n8n webhook not triggering**
- Verify webhook URL in .env
- Check n8n workflow is active
- Monitor n8n execution history

**Slow CV upload**
- Check file size
- Monitor network in DevTools
- Check Supabase performance

## Performance Tips

1. **Image Optimization** - Use Next.js `<Image />`
2. **Code Splitting** - Dynamic imports for large components
3. **Database Queries** - Use specific selects, not `*`
4. **Caching** - Leverage browser caching
5. **API Response** - Minimize payload size

## Deployment Checklist

- [ ] All environment variables set
- [ ] Database schema created and seeded
- [ ] n8n workflow deployed
- [ ] Storage bucket created
- [ ] RLS policies configured
- [ ] Build successful (`npm run build`)
- [ ] No console errors
- [ ] Tested auth flow
- [ ] Tested CV upload
- [ ] Tested file download
- [ ] Mobile tested
- [ ] Performance optimized

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [n8n Documentation](https://docs.n8n.io)
- [React Documentation](https://react.dev)

## Need Help?

1. Check the README
2. Review example code
3. Check browser console
4. Check server logs
5. Search existing issues

---

**Happy coding! 🚀**
