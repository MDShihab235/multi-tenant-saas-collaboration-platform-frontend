# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Development Server**
- `npm run dev` - Start development server at http://localhost:3000
- Uses Bun as runtime: `bun --bun next dev`

**Building**
- `npm run build` - Create production build
- `npm run start` - Start production server

**Linting**
- `npm run lint` - Run ESLint on the entire codebase
- Individual file linting: `npx eslint src/path/to/file.tsx`

**Testing**
- No testing framework configured in package.json
- To add tests: Install testing framework (Jest/Vitest) and configure

## Code Architecture & Structure

### App Router Structure (Next.js 16)
This project uses Next.js App Router with route groups for organization:

- `(commonLayout)` - Public routes accessible without authentication
  - `(authRouteGroup)` - Authentication routes (login, register, verify email, etc.)
  - Root page (`page.tsx`) - Landing page

- `(dashboardLayout)` - Protected routes requiring organization context
  - `[orgslug]` - Organization-scoped routes
    - `dashboard/` - Dashboard overview and organization management
    - `projects/[projectId]` - Project-specific routes
    - `settings/` - Organization and project settings
    - `members/` - Team member management
    - `activity/` - Activity feeds
    - `files/` - File management
    - `billing/` - Billing and invoices
    - `notifications/` - Notification center
  - `admin/` - Admin-only routes (super admin functions)
  - `settings/` - User profile settings
  - `notifications/` - Global notifications

### Key Directories

```
/src
  /app - Next.js app router pages and layouts
  /components
    /module - Feature-specific components organized by domain
      /admin - Super admin functionality
      /authentication - Auth flows
      /dashboard - Dashboard widgets and layout
      /members - Team management
      /organization - Org creation and overview
      /projects - Project management (Kanban, tasks, labels)
      /roles - Role and permission management
      /apiKeys - API key management
      /activity - Activity tracking
      /notification - Notification systems
      /plan - Subscription and pricing
      /files - File management
    /shared - Components used across multiple modules
    /ui - Reusable UI primitives (shadcn-based)
  /hooks - Custom React hooks (use-auth, use-logout, etc.)
  /lib - Utility functions and helpers
  /provider - React providers (QueryProviders, ThemeProvider)
  /services - API service layers (axios wrappers)
  /types - TypeScript type definitions (if present)

### State Management
- **React Query** (`@tanstack/react-query`) for server state and caching
- **Zustand** (`zustand`) for client state management
- **React Form** (`@tanstack/react-form`) for form handling

### Styling
- **Tailwind CSS v4** for utility-first styling
- **Class Variance Authority** for component variants
- **Tailwind Merge** for conditional class joining
- **Next Themes** for dark/light theme support

### Authentication
- **Better Auth** (`better-auth`) for authentication handling
- JWT tokens stored in cookies
- Protected routes check authentication via middleware or custom hooks

### Database/API Layer
- Axios-based service layer in `/services`
- RESTful API endpoints following resource-based naming
- Query providers wrap React Query for consistent configuration

### Key Features Implemented
- Multi-tenancy with organization scoping
- Role-based access control (RBAC)
- Project management with Kanban boards
- Team member invitation system
- Billing and subscription management
- File storage and management
- Activity tracking and audit logs
- API key management
- Admin dashboard for platform oversight

## Common Development Patterns

### Adding New Pages
1. Create route under appropriate App Router path
2. Use layout.tsx files for route group layouts when needed
3. Import shared components from `/components/shared` or `/components/ui`
4. Use React Query hooks for data fetching
5. Implement form validation with React Form if needed

### Creating Components
1. Place feature-specific components in `/components/module/[feature]`
2. Place reusable components in `/components/shared` or `/components/ui`
3. Follow shadcn/ui patterns for consistent design
4. Use class-variance-authority for component variants
5. Extract reusable logic to custom hooks in `/hooks`

### API Integration
1. Create service functions in `/services/[resource].service.ts`
2. Use axios instance with proper error handling
3. React Query hooks in components call service functions
4. Handle loading, error, and success states appropriately

### State Updates
1. Use React Query mutations for server state updates
2. Use Zustand stores for client-only state
3. Optimistic updates where appropriate for better UX
4. Invalidate queries on mutation success

## Environment Variables
- Check `.env` file for required variables
- Typical variables: API URLs, auth secrets, Stripe keys, etc.

## Important Notes
- Next.js 16 has breaking changes from earlier versions - consult docs when unsure
- The platform follows a multi-tenant SaaS architecture with organization scoping
- Authentication is required for all dashboard routes
- Role-based permissions control access to features and data
- File organization follows domain-driven design principles