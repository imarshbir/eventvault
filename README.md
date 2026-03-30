# EventVault

A production-ready event media sharing platform. Create folders, upload photos & videos, share a single link — anyone can view and download, only the owner can delete.

---

## Features

- **Folder albums** — create named event folders with public/private visibility
- **Media uploads** — photos (JPEG, PNG, WebP, GIF) and videos (MP4, WebM, MOV, OGG, AVI), max **40 MB per file**
- **Public sharing** — share a folder link; guests can view and download without signing in
- **Contributor access** — signed-in users can upload to any public folder
- **Owner-only delete** — only the folder creator can remove media or delete the folder
- **Content reporting** — any signed-in user can flag media (18+ content, harassment, etc.)
- **Account suspension** — accounts are suspended when reported content is confirmed; detailed in Terms & Conditions
- **Terms & Conditions** — explicit clause covering 18+ content suspension
- **Privacy Policy** — full GDPR-style privacy policy
- **Zero DB credentials on client** — all Supabase service-role calls are server-side only (API routes)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| Storage | Supabase Storage |
| Styling | CSS Modules + CSS Variables |
| Deployment | Vercel (recommended) |

---

## Setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a new project.

### 2. Run the database schema

In your Supabase dashboard → **SQL Editor**, paste and run the entire contents of `supabase-schema.sql`. This creates:
- `profiles`, `folders`, `media`, `reports` tables
- Row-Level Security policies
- Storage bucket (`media`, 40 MB limit)
- Auto-profile trigger on signup
- Folder slug generator function

### 3. Configure environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your values from the Supabase dashboard (**Settings → API**):

```env
# From Settings > API > URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_URL=https://your-project.supabase.co

# From Settings > API > Project API keys > anon (public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# From Settings > API > Project API keys > service_role (secret — NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=eyJ...

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Configure Supabase Auth

In your Supabase dashboard → **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3000` (dev) / `https://yourdomain.com` (prod)
- **Redirect URLs**: Add `http://localhost:3000/api/auth/callback` and `https://yourdomain.com/api/auth/callback`

### 5. Install dependencies

```bash
npm install
```

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment (Vercel)

1. Push to GitHub
2. Import into [Vercel](https://vercel.com)
3. Add all environment variables from `.env.local` in Vercel dashboard
4. Update `NEXT_PUBLIC_APP_URL` to your production domain
5. Update Supabase Auth redirect URLs to include your production domain
6. Deploy

---

## Project Structure

```
src/
├── app/
│   ├── api/                     # Server-side API routes (DB credentials never reach client)
│   │   ├── auth/callback/       # Supabase OAuth callback
│   │   ├── folders/             # CRUD for folders
│   │   │   └── [slug]/
│   │   │       └── media/       # List media in a folder
│   │   ├── media/
│   │   │   ├── [id]/            # Get / delete media
│   │   │   └── upload/          # Handle file upload (40 MB limit enforced here)
│   │   └── reports/             # Submit content reports
│   ├── f/[slug]/                # Public folder view page
│   ├── folders/
│   │   ├── new/                 # Create folder
│   │   └── edit/[slug]/         # Edit folder
│   ├── dashboard/               # Authenticated user's folder list
│   ├── login/
│   ├── signup/                  # Includes Terms agreement checkbox
│   ├── profile/                 # View/edit profile, sign out, delete account
│   ├── terms/                   # Terms & Conditions (incl. 18+ suspension clause)
│   ├── privacy/                 # Privacy Policy
│   └── not-found.tsx
├── components/
│   ├── Navbar.tsx               # Responsive nav with auth state
│   ├── UploadModal.tsx          # Drag-and-drop multi-file uploader
│   ├── MediaViewer.tsx          # Full-screen media viewer with nav, download, report
│   └── Toast.tsx                # Toast notification system
└── lib/
    ├── supabase/
    │   ├── client.ts            # Browser client (anon key only)
    │   └── server.ts            # Server client (used in API routes only)
    └── types.ts                 # TypeScript interfaces
```

---

## Security Notes

- **Service role key** is only used in server-side API routes — never sent to or accessible by the browser
- **Row-Level Security** is enabled on all tables in Supabase
- **File type validation** happens on both client (UX) and server (enforcement)
- **File size limit** (40 MB) is enforced in the API route and Supabase bucket policy
- **Suspended accounts** are blocked from uploading at the API level
- **Owner-only deletion** is enforced at the API level, not just the UI

---

## Content Policy Summary

Per the Terms & Conditions:
- Accounts can be **immediately and permanently suspended** for uploading 18+ / adult content
- CSAM reports are forwarded to law enforcement
- Three reports on the same piece of media automatically flags it for review

---

## License

MIT
