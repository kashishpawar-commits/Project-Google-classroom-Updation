# ClassFlow — Full-Stack Google Classroom-Style Platform

ClassFlow is a modern LMS (Learning Management System) application built with React 19, TypeScript, Tailwind CSS, Express, and Firebase.

## Key Features

- **Multi-Role System**: Student, Teacher, and Admin user management.
- **Assignment Seen Tracking (Core Feature)**: Realtime tracking of when students first and last view an assignment, complete with WhatsApp-style double-check mark status badges (`Not Seen`, `Seen`, `Submitted`, `Graded`, `Late`).
- **Classroom Management**: Teachers can create classes with unique join codes (`CF-XXXXX`). Students can join classes using codes.
- **Assignment & Work Submissions**: Support for attachments, rubric criteria, points, due dates, text responses, and returned feedback with grades.
- **Student Engagement Dashboard**: Teacher engagement panel showing real-time statistics on total students, opened count, pending submissions, and average turnaround time.
- **Gradebook & Calendar**: Unified academic calendar for tracking due dates and interactive gradebook.
- **Realtime Alerts**: Instant notification center for new posts, assignment submissions, and returned grades.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion
- **Backend & Persistence**: Local reactive storage with fallback, Modular Firebase Client SDK (Firestore & Auth), Express server support
- **State Management**: Context API (`AuthContext`, `DataContext`) with real-time subscription listeners

## Quick Start (Development)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

3. **Build for Production**:
   ```bash
   npm run build
   ```

4. **Lint and Type Check**:
   ```bash
   npm run lint
   ```

## Firebase Setup (Optional)

ClassFlow works out-of-the-box with local state persistence and seed data. To connect your live Firebase instance:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in your Firebase Web App credentials:
   ```env
   VITE_FIREBASE_API_KEY="your-api-key"
   VITE_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   VITE_FIREBASE_APP_ID="your-app-id"
   ```
3. Deploy Firestore rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## License

Apache-2.0
