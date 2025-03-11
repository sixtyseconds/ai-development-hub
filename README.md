# AI Project Hub

A centralized project management application to manage AI projects, client feature requests, project requirements, and support tickets.

## Features

- Dashboard with overview of all projects, tickets, and feature requests
- Project management with roadmaps and timelines
- Client management with branded installations
- Feature request management
- Support ticketing system
- Customizable client-side widgets
- User authentication with email verification
- Profile management

## Authentication Features

- User registration with email verification
- Login with email and password
- Handling of expired verification links
- Ability to resend verification emails
- Profile creation upon registration
- Session management

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Supabase
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account for backend services

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sixtyseconds/ai-development-hub.git
   cd ai-development-hub
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `/app` - Next.js app directory containing pages and layouts
- `/components` - Reusable UI components
- `/contexts` - React context providers (e.g., AuthContext)
- `/utils` - Utility functions and configurations
- `/scripts` - Database setup scripts
- `/public` - Static assets

## Database Setup

The application automatically checks for the required database tables on startup. If they don't exist, it attempts to create them. You can also manually run the SQL script in the `/scripts` directory to set up the database schema in Supabase.

## Authentication Flow

1. **Registration**: Users register with email, password, and full name
2. **Email Verification**: A verification email is sent to the user
3. **Verification**: User clicks the verification link to verify their email
4. **Login**: After verification, users can log in to access the dashboard

If a verification link expires, users can request a new one from the verification error page or the login page.

## Development

This project uses the following development workflow:

1. `main` branch contains production-ready code
2. `development` branch is used for active development
3. Feature branches are created from `development` for specific features

To contribute:

1. Create a feature branch from `development`
2. Make your changes
3. Submit a pull request to merge back into `development`

## Deployment

This application can be deployed to Vercel with minimal configuration:

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy!

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Design inspiration from modern SaaS applications
- Tailwind CSS for the UI framework 