# CareerAI - AI-Powered Job Matching Platform

## Overview

CareerAI is an intelligent job matching platform that analyzes your CV and matches you with the most relevant job opportunities. Using AI and n8n automation, we provide personalized job recommendations with match scores.

## Features

✨ **Smart CV Analysis** - Upload your CV and let our AI extract your skills and experience

🎯 **Intelligent Matching** - Get matched with jobs based on your profile, skills, and preferences

📊 **Match Scores** - See how well each job aligns with your profile (0-100%)

📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

🔐 **Secure Authentication** - User authentication powered by Supabase

⚡ **Automated Workflow** - n8n integration for automated job matching

📄 **CV Generation** - Download tailored CVs for specific job positions

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **React Dropzone** - Drag-and-drop file uploads

### Backend
- **Next.js API Routes** - Serverless backend
- **Supabase** - PostgreSQL database and authentication
- **n8n** - Workflow automation for job matching
- **React PDF** - PDF generation and download

### Database Schema

```sql
-- Users (managed by Supabase Auth)
-- Profiles
create table profiles (
  id uuid primary key,
  full_name text,
  email text,
  job_preference text,
  location text,
  cv_url text,
  profile_summary text,
  created_at timestamp,
  updated_at timestamp
);

-- Jobs
create table jobs (
  job_id text primary key,
  company text,
  role text,
  apply_link text,
  location text,
  tags text[],
  description text,
  created_at timestamp
);

-- Matched Jobs
create table matched_jobs (
  id uuid primary key,
  user_id uuid,
  job_id text,
  match_score integer,
  matched_at timestamp,
  foreign key (user_id) references profiles(id),
  foreign key (job_id) references jobs(job_id)
);
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- n8n instance (local or cloud)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd job-match-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.local.example .env.local
```

Fill in your Supabase and n8n credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/job-matching
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Set up Supabase**
- Create a new Supabase project
- Run the SQL migrations to create tables (see Database Schema above)
- Create storage bucket `cvs` for CV uploads
- Enable Row Level Security (RLS) policies

5. **Set up n8n Workflow**
- Create a new workflow in n8n
- Configure webhook trigger for `/job-matching`
- Set up the CV analysis and job matching logic
- Configure the workflow to store results in Supabase

6. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/               # API routes
│   │   ├── upload-cv/     # CV upload endpoint
│   │   ├── generate-cv/   # CV generation endpoint
│   │   └── matched-jobs/  # Fetch matched jobs
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── layout.tsx         # Root layout
├── components/
│   ├── auth/              # Auth components
│   ├── dashboard/         # Dashboard components
│   └── ui/                # Reusable UI components
├── lib/
│   ├── supabase/          # Supabase clients and middleware
│   ├── n8n.ts             # n8n integration
│   └── utils.ts           # Utility functions
├── types/
│   └── index.ts           # TypeScript type definitions
└── app/
    └── globals.css        # Global styles
```

## Key Features Explained

### 1. CV Upload & Analysis
- Users upload their CV in PDF format
- File is stored in Supabase Storage
- Webhook triggers n8n workflow for analysis
- n8n extracts skills, experience, and generates a profile summary

### 2. Job Matching
- n8n workflow processes the CV
- Matches against job database using AI
- Calculates match scores (0-100%)
- Stores matches in `matched_jobs` table

### 3. Match Display
- Dashboard shows all matched jobs
- Jobs are sorted by match score
- Each job card displays:
  - Company name and role
  - Match percentage (circular indicator)
  - Location and tags
  - Apply and download CV buttons

### 4. CV Customization
- Users can download tailored CVs for specific jobs
- Generated PDFs include:
  - User profile information
  - Targeted job details
  - Relevant skills
  - Professional summary

## API Endpoints

### Upload CV
```
POST /api/upload-cv
Content-Type: multipart/form-data

Body:
- file: File (PDF)

Response:
{
  "success": true,
  "cv_url": "https://..."
}
```

### Generate Tailored CV
```
POST /api/generate-cv
Content-Type: application/json

Body:
{
  "job_id": "job_12345"
}

Response:
- PDF file (attachment)
```

### Fetch Matched Jobs
```
GET /api/matched-jobs

Response:
{
  "success": true,
  "jobs": [
    {
      "job_id": "job_12345",
      "company": "Company Name",
      "role": "Job Title",
      "location": "City, Country",
      "match_score": 95,
      "apply_link": "https://...",
      "tags": ["React", "Node.js"],
      "matched_at": "2024-06-19T10:00:00Z"
    }
  ]
}
```

## n8n Workflow Setup

The n8n workflow should handle:

1. **Webhook Trigger** - Receive CV upload data
2. **PDF Processing** - Extract text from CV
3. **AI Analysis** - Use GPT/Claude to analyze skills
4. **Job Matching** - Match against job database
5. **Score Calculation** - Calculate match scores
6. **Database Storage** - Save matches to Supabase

Example n8n workflow structure:
```
Webhook Input
  ↓
PDF Extraction
  ↓
AI Analysis (e.g., OpenAI)
  ↓
Database Query (Get Jobs)
  ↓
Match Calculation
  ↓
Store in Supabase
  ↓
Response Output
```

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# n8n
N8N_WEBHOOK_URL=your_n8n_webhook_url

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

```bash
# Or deploy directly
vercel --prod
```

### Deploy to Other Platforms

The app can be deployed to any platform that supports Node.js:
- Netlify
- Railway
- Render
- DigitalOcean
- AWS

## Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For questions or issues:
- Open an issue on GitHub
- Check existing documentation
- Review n8n workflow logs

## Future Enhancements

- [ ] Advanced filtering and search
- [ ] Save favorite jobs
- [ ] Email notifications for new matches
- [ ] Job application tracking
- [ ] Resume optimization tips
- [ ] Salary insights
- [ ] Company reviews integration
- [ ] Mobile app

---

**Built with ❤️ for job seekers everywhere**
