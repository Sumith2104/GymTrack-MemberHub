
# Member Hub Application: Feature Breakdown

This document provides a comprehensive overview of all features implemented in the Member Hub application.

---

## 1. Core Authentication & Profile Management

### 1.1. Member Authentication
- **Feature:** Secure member lookup to access the app.
- **Details:** Users enter their registered **Email** and unique **Member ID** on the home page. The system verifies these credentials against the database before granting access to the personalized Member Hub. This flow acts as the primary authentication mechanism.

### 1.2. Member Dashboard
- **Feature:** A central landing page that provides an at-a-glance view of the member's profile.
- **Details:** After successful lookup, the user is directed to their personal dashboard. It serves as the main hub for accessing all other features.

### 1.3. Detailed Profile Card
- **Feature:** A comprehensive card displaying all essential member information.
- **Details:** The dashboard prominently features a profile card showing:
    - Member Name & Initials-based Avatar
    - Member ID & Gym ID
    - **Membership Status Badge:** A color-coded badge (e.g., green for 'Active', red for 'Expired') for quick status identification.
    - Email, Phone Number, and Age
    - Join Date & Membership Expiry Date
    - Current Membership Plan & Price

### 1.4. Member ID QR Code
- **Feature:** A digital, scannable version of the member's ID card.
- **Details:** Users can generate a QR code in a dialog window. This code represents their unique Member ID and can be used for quick, contactless check-ins at the gym.

### 1.5. Profile & Settings Management
- **Feature:** Members can update their personal information and manage their account settings.
- **Details:** The "Settings" page contains forms to:
    - **Update Profile:** Change name, phone number, and age.
    - **Change Email Address:** A secure, two-step process involving an OTP (One-Time Password) sent to the user's current email address to authorize the change.

---

## 2. Workout & Fitness Tracking Suite

### 2.1. Workout Logging
- **Feature:** A detailed form for logging new workout sessions.
- **Details:** Accessible via a "Log New Workout" button, this feature opens a dialog where users can record:
    - Workout Date (with a calendar picker)
    - General Notes about the session.
    - **Dynamic Exercise List:** Users can add multiple exercises, specifying the **name, sets, reps, and weight** for each. They can add or remove exercises from the list before saving.

### 2.2. Comprehensive Workout History
- **Feature:** A historical log of all past workouts.
- **Details:** On the "Workout Tracking" page, the "Workout Log" tab displays an accordion list of all previous sessions. Each item can be expanded to show the specific exercises performed, along with notes for that day.

### 2.3. Body Weight Tracking
- **Feature:** A tool to monitor body weight changes over time.
- **Details:** The "Weight" tab features:
    - **Progress Chart:** A line chart that visually represents the member's weight history.
    - **Log Entry Form:** A simple form to submit the current day's weight, which automatically updates the chart.

### 2.4. Personal Records (PR) Calculation
- **Feature:** Automatic calculation and display of personal bests.
- **Details:** The "Personal Records" tab automatically processes all logged workouts to identify and display the user's best performance for each exercise. It calculates an **Estimated 1-Rep Max (1RM)** using the Epley formula to standardize strength measurement.

### 2.5. Workout Overview
- **Feature:** A summary dashboard for a quick glance at workout statistics.
- **Details:** The "Overview" tab on the tracking page displays key metrics in summary cards, including:
    - Total Number of Workouts Logged
    - Most Recently Logged Body Weight
    - Top Lift (the exercise with the highest estimated 1RM)

---

## 3. Generative AI Features

### 3.1. AI Fitness Assistant Chatbot
- **Feature:** A conversational AI assistant powered by Google's Gemini Pro model.
- **Details:** Located on the "Chatbot" page, this feature provides a chat interface where members can ask questions related to fitness, nutrition, workout techniques, and general wellness. The AI maintains conversation context and is instructed to provide safe, encouraging advice.

### 3.2. Pre-Built Workout Planner
- **Feature:** Generates structured, pre-built workout plans based on experience level.
- **Details:** On the "Workout Planner" page, users can select their fitness level (Beginner, Intermediate, or Advanced). The system then presents a detailed, multi-day workout plan complete with exercises, sets, reps, rest times, and helpful notes for each day.

---

## 4. Gym & Member Communication

### 4.1. Gym Announcements
- **Feature:** A central place to view important updates from the gym administration.
- **Details:** The "Announcements" page fetches and displays all announcements posted by the member's gym, sorted with the newest first.

### 4.2. Direct Messaging
- **Feature:** A real-time, one-on-one messaging interface between the member and the gym administration.
- **Details:** The "Messages" page provides a chat interface where members can send and receive messages directly with the gym admin. The interface supports real-time updates for a seamless chat experience.

---

## 5. Membership & Payments

### 5.1. Membership Renewal
- **Feature:** A streamlined process for renewing or purchasing a membership plan.
- **Details:** The "Payments" page allows users to:
    - View available membership plans for their specific gym.
    - Select a plan and see the total price.
    - Proceed to a payment dialog that generates a UPI QR code and provides direct links for popular payment apps (GPay, PhonePe, Paytm). The payment details (amount, recipient) are pre-filled for convenience.

### 5.2. Check-In History
- **Feature:** A log of all gym check-in and check-out times.
- **Details:** The "Check-ins" page displays a detailed history of the member's gym visits, grouped by month. It also includes a bar chart to visualize monthly check-in frequency over the past year.
