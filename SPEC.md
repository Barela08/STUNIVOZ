# STUNIVOZ - Full Student Platform System Specification

## Project Overview
- **Project Name**: STUNIVOZ
- **Type**: Full-Stack Web Application (Student Career Development Platform)
- **Core Functionality**: Comprehensive platform for students to build profiles, create resumes, find internships, track career progress, and connect with opportunities
- **Target Users**: University/College students seeking internships, jobs, and career growth

## Technology Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage, Real-time)
- **State Management**: React Context + Custom Hooks
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form
- **Routing**: React Router v6

## Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://jicqswdntqilvipqmzrd.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xVEt9iPn2j2f64wjAPZ74g_g2tJFD64
```

---

## MODULE SPECIFICATIONS

### 1. AUTHENTICATION SYSTEM
- **Signup**: Full name, email, password (hashed via Supabase Auth)
- **Login**: Email/password authentication
- **Social Login**: Google OAuth (via Supabase)
- **Security**: Forgot password flow, JWT sessions
- **Session**: Supabase Auth managed, logout functionality

### 2. USER PROFILE
- **Personal Info**: Full name, profile photo (stored in Supabase Storage), email, phone, location, headline
- **Education**: College name, university, degree, branch, year of study, CGPA
- **Skills**: Skill name, proficiency level
- **Bio**: Free text bio
- **Social Links**: LinkedIn, GitHub, Portfolio URL, Twitter
- **Preferences**: Career interest, preferred locations, job type preference

### 3. RESUME SYSTEM
- **Resume Upload**: PDF/DOC/DOCX file upload to Supabase Storage
- **Resume Builder**: Form-based builder with:
  - Personal details (linked from profile)
  - Education section
  - Skills section
  - Projects (title, description, tech stack, GitHub link)
  - Experience (company, role, duration, description)
  - Certifications
  - Achievements
- **AI Resume Generator**: Generate from profile data using AI
- **Live Preview**: Real-time preview while building
- **Auto Save**: Save draft to local storage
- **Download**: PDF export
- **ATS Analyzer**: Parse resume and provide:
  - Overall score (0-100)
  - Keyword matching
  - Formatting analysis
  - Improvement suggestions
- **Resume Versioning**: Store multiple versions

### 4. SKILL ANALYSIS SYSTEM
- **Skill Input**: Manual entry or auto-detect from resume
- **Skill Levels**: Beginner, Intermediate, Advanced
- **Skill Progress**: Track completion percentage over time

### 5. CAREER GUIDANCE SYSTEM
- **Career Paths**: Web Development, Data Science, UI/UX, Product Management, Marketing, Cybersecurity
- **Roadmap**: Step-by-step career guides with estimated time
- **AI Career Advisor**: Chatbot for career questions
- **Progress Tracking**: Track completed/pending steps

### 6. OPPORTUNITY GUIDANCE
- **Level Detection**: Analyze student level
- **Job Type Suggestions**: Internship, Freelance, Junior, Full-time
- **Recommended Roles**: AI-suggested roles based on profile
- **Where to Apply**: Links to LinkedIn, Internshala, Naukri, Company websites
- **Application Strategy**: Tips and outreach templates

### 7. INTERNSHIP MODULE
- **Browse Internships**: List view with search
- **Filters**: Skill, location, stipend, remote/on-site, duration
- **Internship Details**: Company, role, requirements, apply link
- **Save Internship**: Bookmark functionality
- **Apply Action**: External link redirect or internal quick apply
- **Application Tracking**: Track status (applied, pending, shortlisted, rejected)

### 8. EVENTS MODULE
- **Browse Events**: List of events
- **Event Details**: Title, date, description, registration
- **Register Event**: Add to registered events
- **Event Calendar**: Calendar view
- **Event Types**: Hackathons, webinars, workshops, competitions
- **Certificate Download**: Download participation certificates

### 9. COURSES MODULE
- **Courses List**: Free and paid courses
- **Course Details**: Title, platform, duration, rating, difficulty
- **Save Course**: Bookmark courses
- **Learning Paths**: Structured course collections
- **Course Progress**: Track completion

### 10. SMART RECOMMENDATION ENGINE
- **Recommendations**: Internships, courses, skills, events based on:
  - Profile data
  - Browsing behavior
  - Resume content
- **Personalized Dashboard**: Custom feed

### 11. PRACTICE & TEST SYSTEM
- **Coding Questions**: Easy/Medium/Hard categories
- **MCQ Tests**: Topic-wise quizzes
- **Aptitude Tests**: Numerical reasoning
- **Mock Interviews**: Practice questions
- **Score Tracking**: Historical scores
- **Performance Analytics**: Charts and insights

### 12. PLANNER SYSTEM
- **Daily Tasks**: Task management
- **Weekly Goals**: Goal setting
- **Monthly Targets**: Monthly objectives
- **Deadline Tracker**: Important dates
- **Reminders**: Push notifications
- **Streak Tracking**: Daily activity streaks

### 13. COMMUNITY SYSTEM
- **Posts**: Create and view posts
- **Comments**: Comment on posts
- **Likes**: Like posts
- **Q&A Section**: Question posting
- **Groups**: Group creation and joining
- **Mentorship Requests**: Request mentor guidance

### 14. REVIEWS SYSTEM
- **Internship Reviews**: Company reviews
- **Course Reviews**: Course ratings and reviews
- **Company Reviews**: Employee reviews

### 15. NOTIFICATION SYSTEM
- **Notification Types**: Internship alerts, event reminders, deadlines
- **Channels**: In-app notifications, email (via Supabase)
- **Smart Notifications**: Personalized alerts

### 16. DASHBOARD
- **Overview Cards**: Applied internships, saved items, recommendations
- **Resume Score**: Display ATS score
- **Analytics Charts**: Weekly growth, skill progress
- **Quick Actions**: Apply, save, track

### 17. GAMIFICATION
- **Points**: Activity points
- **Badges**: Achievement badges
- **Leaderboard**: Top students
- **Rewards**: Certificates, unlocks

### 18. CONTENT HUB
- **Blogs**: Career articles
- **Videos**: Tutorial videos
- **Career Tips**: Guidance articles
- **Interview Questions**: Common questions by company

### 19. SETTINGS
- **Edit Profile**: Update profile information
- **Change Password**: Password update
- **Notification Settings**: Toggle notifications
- **Privacy Settings**: Profile visibility
- **Delete Account**: Account deletion

### 20. ADMIN PANEL
- **User Management**: View/manage users
- **Content Management**: Manage posts/events
- **Internship Posting**: Post internships
- **Course Management**: Add courses
- **Analytics Dashboard**: Platform statistics
- **Report Handling**: Handle user reports

### 21. COMPANY/RECRUITER PANEL
- **Company Profile**: Company registration
- **Post Jobs/Internships**: Create listings
- **Applicant Tracking**: View applicants
- **Shortlist Candidates**: Mark as shortlisted
- **Schedule Interviews**: Set interview times

### 22. AI FEATURES
- **AI Resume Builder**: Auto-generate resumes
- **AI Career Chatbot**: Career guidance chatbot
- **AI Mock Interview**: Practice interviews
- **AI Skill Gap Analysis**: Compare skills to job requirements
- **AI Cover Letter Generator**: Generate cover letters

### 23. EXTRA FEATURES
- **Referral System**: Invite friends
- **Dark Mode**: Dark/Light theme toggle
- **Multilingual**: Language support
- **Mobile App**: PWA support
- **Offline Mode**: Service worker caching
- **API Integrations**: LinkedIn, GitHub OAuth

---

## DATABASE SCHEMA (Supabase PostgreSQL)

### Tables to Create:
1. `profiles` - User profile data
2. `skills` - User skills
3. `resumes` - Resume versions
4. `resume_builds` - Resume builder data
5. `internships` - Internship listings
6. `internship_applications` - Applications
7. `events` - Event listings
8. `event_registrations` - Event signups
9. `courses` - Course listings
10. `saved_items` - Bookmarks
11. `posts` - Community posts
12. `comments` - Post comments
13. `notifications` - User notifications
14. `reviews` - Company/course reviews
15. `tasks` - Planner tasks
16. `badges` - Achievement badges
17. `user_badges` - User earned badges
18. `points` - User points history
19. `career_paths` - Career path data
20. `roadmaps` - Career roadmaps
21. `roadmap_progress` - User roadmap progress

---

## FILE STRUCTURE
```
STUNIVOZ/
├── public/
│   └── assets/
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── resume/
│   │   ├── internships/
│   │   ├── events/
│   │   ├── courses/
│   │   ├── community/
│   │   └── admin/
│   ├── pages/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── profile/
│   │   ├── resume/
│   │   ├── internships/
│   │   ├── events/
│   │   ├── courses/
│   │   ├── community/
│   │   ├── practice/
│   │   ├── planner/
│   │   ├── settings/
│   │   └── admin/
│   ├── hooks/
│   ├── contexts/
│   ├── services/
│   │   └── supabase.ts
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── index.html
└── SPEC.md
```

---

## MVP PRIORITY ORDER

### Phase 1 - Core (Must Have)
1. Authentication System
2. User Profile
3. Resume System (Builder + Upload)
4. Dashboard
5. Settings

### Phase 2 - Opportunities
6. Internship Module
7. Events Module
8. Courses Module
9. Opportunity Guidance
10. Smart Recommendations

### Phase 3 - Growth
11. Career Guidance
12. Skill Analysis
13. Practice & Tests
14. Planner System

### Phase 4 - Community
15. Community System
16. Reviews
17. Content Hub
18. Notifications
19. Gamification

### Phase 5 - Advanced
20. Admin Panel
21. Company Panel
22. AI Features
23. Extra Features

---

## IMPLEMENTATION NOTES

- Use Supabase Auth for all authentication
- Use Supabase Storage for resume files and profile photos
- Use Supabase Database for all data
- Use Supabase Realtime for notifications
- Implement Row Level Security (RLS) for data protection
- Create appropriate indexes for performance
- Implement pagination for lists
- Use lazy loading for images
- Implement proper error boundaries

---

*Document Version: 1.0*
*Created: STUNIVOZ Specification*
