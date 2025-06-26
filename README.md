# Firebase Studio Member Hub

This is a Next.js starter application for a member hub, created in Firebase Studio.

## Getting Started

To get started, take a look at `src/app/page.tsx`.

To run the application locally, you will need to:
1.  Install dependencies: `npm install`
2.  Create a `.env.local` file in the root of the project and add your Supabase credentials:
    ```
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
3.  Run the development server: `npm run dev`

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Deploying to Vercel

This application is ready to be deployed on Vercel. Follow these steps for a seamless deployment:

### 1. Push to a Git Repository
Push your project code to a Git repository provider like GitHub, GitLab, or Bitbucket.

### 2. Sign Up and Import Project on Vercel
1.  Sign up for a free account at [vercel.com](https://vercel.com).
2.  From your Vercel dashboard, click "Add New..." -> "Project".
3.  Import the Git repository you created in the previous step.

### 3. Configure Environment Variables
Vercel will automatically detect that this is a Next.js project. The final step is to add your Supabase environment variables:
1.  In the project configuration screen, navigate to the "Environment Variables" section.
2.  Add the following two variables:
    - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase project's `anon` key.

### 4. Deploy
Click the "Deploy" button. Vercel will build and deploy your application. Once finished, you will be provided with a live URL.
