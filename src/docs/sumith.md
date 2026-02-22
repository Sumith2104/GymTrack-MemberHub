# Member Hub Application: Design & Architecture

This document provides a comprehensive overview of the application's features, technical architecture, and database design. For more project-specific plans, please see `product-plan.md` and `data_collection_plan.txt`.

---

## 1. Feature Breakdown

### 1.1. Core Authentication & Profile Management
- **Member Authentication:** Secure member lookup using Email and Member ID, which initiates a persistent, anonymous Firebase session.
- **Member Dashboard:** A central landing page showing the member's profile at a glance.
- **Detailed Profile Card:** Displays name, ID, membership status, contact details, join/expiry dates, and current plan.
- **Member ID QR Code:** A scannable QR code for quick check-ins.
- **Profile & Settings Management:**
    - **Update Profile:** Forms to change name, phone number, and age.
    - **Change Email Address:** A secure, OTP-based process to update the user's email.
    - **Profile Picture Upload:** Allows members to upload and update their profile photo.

### 1.2. Workout & Fitness Tracking Suite
- **Workout Logging:** A dialog form to log workout date, notes, and a dynamic list of exercises (name, sets, reps, weight).
- **Comprehensive Workout History:** An accordion list showing all past workout sessions with detailed exercise breakdowns.
- **Body Weight Tracking:** A line chart visualizing weight history and a simple form to log new entries.
- **Personal Records (PR) Calculation:** Automatically calculates and displays best lifts (estimated 1-Rep Max) for each exercise.
- **Workout Overview:** A summary dashboard of key metrics like total workouts, latest weight, and top lift.

### 1.3. Generative AI Features
- **AI Fitness Assistant Chatbot:** A conversational AI assistant (powered by Google's Gemini API via Genkit) for fitness, nutrition, and wellness advice.
- **Pre-Built Workout Planner:** Generates structured workout plans based on the user's selected experience level (Beginner, Intermediate, Advanced).

### 1.4. Gym & Member Communication
- **Gym Announcements:** A dedicated page to display all official announcements from the gym.
- **Direct Messaging:** A real-time, one-on-one messaging interface between the member and the gym administration, powered by Supabase Realtime.

### 1.5. Membership & Payments
- **Membership Renewal:** A streamlined flow to select a new membership plan and proceed to payment.
- **UPI Payment Integration:** Generates a UPI QR code and provides direct links for popular payment apps (GPay, PhonePe, Paytm).
- **Check-In History:** A detailed log of all gym visits, grouped by month, with a bar chart to visualize monthly frequency.

---

## 2. Technical Architecture

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **UI Components:** ShadCN UI
- **Styling:** Tailwind CSS
- **Generative AI:** Genkit with Google's Gemini API
- **Backend Services:**
    - **Authentication:** Firebase Anonymous Authentication (for session persistence).
    - **Database:**
        - **Firestore:** Primary database for member profiles, check-ins, announcements, workouts, and AI chat history.
        - **Supabase (Postgres):** Used for relational data and real-time messaging capabilities.
    - **File Storage:** Supabase Storage (for profile pictures).
    - **Email (Transactional):** Nodemailer (for sending OTPs).

---

## 3. Database Design

The database is primarily managed in Firestore, with some relational aspects and real-time features handled by Supabase. The structure is defined in `docs/backend.json`.

### Firestore Collections:

- **/members/{memberId}:** Stores individual member profiles, including personal details, membership status, and links to their gym and plan.
- **/announcements/{announcementId}:** Contains global announcements posted by a gym.
- **/users/{userId}/checkIns/{checkInId}:** A sub-collection for each user to store their individual check-in records. `userId` corresponds to the Firebase Auth UID.
- **/users/{userId}/notifications/{notificationId}:** A sub-collection for user-specific notifications.

### Supabase Tables:

- **members:** The primary source of truth for member data, linked to gyms and plans.
- **gyms:** Stores information about each gym, including their name and payment details.
- **plans:** Contains the various membership plans available for each gym.
- **check_ins:** Logs member check-in and check-out times.
- **announcements:** Stores gym-wide announcements.
- **messages:** Powers the real-time direct messaging feature.
- **workouts & workout_exercises:** Stores detailed workout logs.
- **body_weight_logs:** Tracks member weight over time.

---

## 4. Wireframes (Conceptual)

While visual wireframes cannot be generated here, the component structure implies the following layout:

- **Home Page (`/`):** A centered card for member lookup (Email + Member ID).
- **Member Hub (`/me/...`):**
    - **Layout:** A persistent header with the app logo and navigation, and a main content area.
    - **Navigation:** A main navigation bar (or a burger menu on mobile) with links to Dashboard, Check-ins, Announcements, Messages, Workout Planner, Workout Tracking, Chatbot, Payments, and Settings.
    - **Dashboard:** Features the main `MemberProfileCard` and other key summary components.
    - **Other Pages:** Typically consist of one or more full-width `Card` components that contain the page's primary feature (e.g., the announcement list, the chat interface, settings forms).
- **Dialogs/Modals:** Used for actions that don't require a full page navigation, such as logging a new workout or viewing the Member ID QR code.
