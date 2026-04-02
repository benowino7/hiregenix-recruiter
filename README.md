# HireGeniX - Recruiter Portal

React-based recruiter frontend for the HireGeniX platform. Allows recruiters to post jobs, manage applications, use AI-powered candidate ranking, bulk upload jobs, and communicate with job seekers.

## Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **Routing:** react-router-dom v6
- **Charts:** Recharts
- **Icons:** Lucide React + Ant Design Icons
- **Carousel:** react-slick
- **Notifications:** React Toastify
- **Rich Text Editor:** react-quill-new
- **Maps:** Google Maps Places Autocomplete

## Prerequisites

- Node.js >= 18
- npm
- Backend API running (see [backend repo](../../hiregenix_server-api/hiregenix_server-master/))

## Setup

```bash
# Clone the repository
git clone <repo-url>
cd recruitershiregenix-master

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Set VITE_BASE_URL to your backend API URL

# Start development server
npm run dev

# Production build
npm run build
```

## User Manual

### Registration & Approval

- Visit the portal, click "I'm Hiring"
- Fill details: name, email, phone, password, company info
- Account enters PENDING status, admin must approve
- Password strength meter shows quality
- After approval, log in with credentials
- Forgot password flow via email

### Free Trial

- 7-day trial auto-granted on registration
- Trial: can view dashboard but cannot post jobs, use AI features, or access most recruiter tools
- Upgrade to paid plan for full access

### Dashboard

- Total Jobs Posted, Total Applications, Shortlisted, Interviews, Hired, Pending Review
- Hiring Pipeline chart (Applied > Shortlisted > Interviewing > Hired)
- Hiring Trends over time
- Recent activity feed
- Subscription status banner

### Job Management

Navigate to Job Management from sidebar:

- **Post New Job**: Title, description (rich text), employment type, experience level, location (Google Places autocomplete), vacancies, salary range, industry, skills
- **Job Statuses**: DRAFT (amber), PUBLISHED (green), SUSPENDED (orange), CLOSED (gray)
- **Actions**: Edit, Publish, Suspend/Unsuspend, Close, Delete
- **View Details**: Full job details with applicant count, saves count

### AI Job Posting

Navigate to AI Job Posting from sidebar:

- Paste a raw job description text
- AI parses it into structured fields (title, description, requirements, salary, type, etc.)
- Review and edit parsed fields
- Publish directly from the parsed result

### Bulk Job Upload

- Download CSV template
- Fill in job data (one per row)
- Upload CSV file
- Preview and verify parsed jobs
- Click Upload to create all at once
- Fields: Title, Description, Vacancies, Employment Type, Experience Level, Location, Is Remote, Min/Max Salary, Currency

### Job Applications

Navigate to Job Applications from sidebar:

- Two-panel layout: Jobs sidebar (left) + Applications panel (right)
- Each job shows application count badge
- For each application: view profile, preview/download CV, change status, rate candidates
- Application statuses: New (blue), Reviewing (amber), Shortlisted (violet), Interviewed (teal), Hired (green), Rejected (red)
- Bulk status updates

### AI Rankings

Access from any job card (brain icon):

- AI scores all candidates against job requirements
- Match tiers: Excellent (80-100%, green), Strong (60-79%, blue), Moderate (40-59%, amber), Weak (0-39%, red)
- Filter by tier, search candidates
- Shortlist directly from rankings
- Detailed AI analysis per candidate showing skill matches, experience fit, education alignment
- Premium feature (requires Gold or Platinum plan)

### AI Candidate Suggestions

- Per-job suggested job seekers based on skill matching
- View suggested candidates and their match scores
- Directly contact or shortlist suggested candidates

### CV Builder

Navigate to CV Builder from sidebar:

- 8-step wizard: Personal Info > Summary > Experience > Education > Certifications > Skills > Links > Preferences
- Rich text editor for summary and descriptions
- Profile photo upload with zoom/crop
- Export as PDF
- Templates available

### Messaging

Navigate to Messages from sidebar:

- Start conversations with job seekers (recruiters can initiate)
- Real-time messaging via WebSocket (Socket.io)
- Typing indicators and read receipts
- Unread message badges
- Contact info filtering: emails and phone numbers auto-stripped from messages for privacy
- Contact sharing only when both parties have Platinum subscriptions
- Job seekers need Platinum to reply

### Profile & Company

Navigate to My Profile:

- Personal info: name, email, phone, location
- Company details: name, website, country, industry, logo
- Add company industry associations
- Profile completion tracking

### Subscriptions & Billing

**Standard Plans:**

| Feature | Free Trial | Silver ($15/mo) | Gold ($30/mo) | Platinum ($50/mo) |
|---------|-----------|-----------------|---------------|-------------------|
| Job Posting | No | Yes | Yes | Yes |
| Active Jobs | 0 | 5 | 20 | Unlimited |
| View Applications | Limited | Yes | Yes | Yes |
| AI Rankings | No | No | Yes | Yes |
| AI Screening | No | No | No | Yes |
| Bulk Upload | No | No | No | Yes |
| Candidate Suggestions | No | Basic | AI-Powered | AI + Priority |
| CV PDF Export | No | Yes | Yes | Yes |

**Diamond Plans (Enterprise):**

| Plan | Price | Key Features |
|------|-------|-------------|
| Diamond | $99/mo | Dedicated services, custom candidate search |
| Diamond Compact | $240/mo | 3 recruiter seats |
| Diamond Compact Plus | $350/mo | 5 recruiter seats |
| Diamond Unlimited | $9,900/yr | Unlimited seats |

- View invoices with line items and payment attempts
- Summary cards: Total Invoiced, Paid, Outstanding
- Filter by status: All, Open, Paid, Void

### Testimonials

- Submit testimonials from My Testimonial page
- Testimonials go through admin approval
- Approved testimonials appear on public site
- Requires paid subscription

### Pricing

- Public pricing page accessible without login
- Compare all plans side by side
- Direct link to checkout

### Security Settings

- Change password (requires current password)
- Two-Factor Authentication (TOTP)
- Scan QR with authenticator app
- 6-digit code verification

### Notification Badge

- Bell icon shows unread message count
- Click to navigate to Messages
- Auto-refreshes every 15 seconds

### Theme

- Toggle Light/Dark mode from navbar
- Preference persists across sessions

## Deployment

**Docker:**
```bash
docker-compose up -d
```

**Vercel:**
```bash
vercel --prod
```

**Manual:**
```bash
npm run build
# Serve the dist/ directory with any static file server
```

## Project Structure

```
├── public/
├── src/
│   ├── assets/
│   ├── auth/            # Login, Register, ProtectedRoute
│   ├── components/
│   │   ├── DashboardOverview.jsx
│   │   ├── Profile.jsx
│   │   ├── MyPostedJobs.jsx
│   │   ├── JobPostingModal.jsx
│   │   ├── PublishJob.jsx
│   │   ├── SuspendJob.jsx
│   │   ├── UnSuspendJob.jsx
│   │   ├── JobApplications.jsx
│   │   ├── AIRankings.jsx
│   │   ├── Aisuggestedjobseekers.jsx
│   │   ├── AIJobPosting.jsx
│   │   ├── BulkJobUpload.jsx
│   │   ├── CvBuilder.jsx
│   │   ├── CvPreviewModal.jsx
│   │   ├── Messaging.jsx
│   │   ├── Subscriptions.jsx
│   │   ├── SubscriptionInvoices.jsx
│   │   ├── Checkout.jsx
│   │   ├── UpgradeModal.jsx
│   │   ├── SecuritySettings.jsx
│   │   ├── MyTestimonial.jsx
│   │   ├── Testimonials.jsx
│   │   ├── Pricing.jsx
│   │   ├── JobListings.jsx
│   │   ├── JobDetails.jsx
│   │   ├── MyJobDetails.jsx
│   │   ├── SavedJobs.jsx
│   │   ├── AllCompanies.jsx
│   │   ├── CompanyDetails.jsx
│   │   ├── AddCompanyModal.jsx
│   │   ├── AddIndustryModal.jsx
│   │   ├── LocationPicker.jsx
│   │   ├── GoogleMapsLoader.jsx
│   │   ├── ProfileProgressSection.jsx
│   │   ├── ScheduledInterviews.jsx
│   │   ├── ContactPage.jsx
│   │   ├── About.jsx
│   │   ├── Heros.jsx
│   │   ├── Ourtargets.jsx
│   │   ├── Sidebar.jsx
│   │   ├── NavBar.jsx
│   │   ├── Modal.jsx
│   │   ├── Pagination.jsx
│   │   ├── Pagination2.jsx
│   │   ├── CookieConsent.jsx
│   │   ├── PolicyModal.jsx
│   │   └── ...
│   ├── layouts/
│   ├── pages/
│   ├── themes/
│   ├── utilities/
│   ├── App.jsx
│   ├── BaseUrl.jsx
│   └── main.jsx
├── dist/
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
└── vercel.json
```
