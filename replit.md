# ReelCutter AI - YouTube to Social Media Converter

## Overview

ReelCutter AI is a web application that allows users to convert YouTube videos into social media-ready clips. Users can paste a YouTube URL, select specific time segments, choose aspect ratios optimized for different platforms (TikTok, Instagram Reels, YouTube Shorts, Facebook), and download the processed video clips. The application emphasizes speed, simplicity, and a polished user experience with no signup required.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool and development server.

**UI Component System**: Shadcn UI components built on Radix UI primitives, providing accessible and customizable components with consistent styling through Tailwind CSS.

**Styling Approach**: Tailwind CSS with custom design tokens defined in CSS variables. The design system uses a "New York" style variant from Shadcn with custom color schemes, border radius values, and elevation effects. Typography uses Inter for UI elements and Archivo Black for headings.

**State Management**: TanStack Query (React Query) for server state management, providing caching, background refetching, and optimistic updates for API interactions.

**Routing**: Wouter for lightweight client-side routing with minimal overhead.

**Theme System**: Custom theme provider supporting light/dark modes with localStorage persistence.

**Design Philosophy**: The application follows a conversion-focused landing page pattern inspired by modern SaaS platforms (CapCut, Descript, Linear, Vercel). Key principles include instant clarity, speed perception through micro-feedback, creator-centric aesthetics, and building trust through polish.

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript.

**Video Processing**: Integration with `yt-dlp` command-line tool for YouTube video information extraction and segment downloading. The server spawns child processes to execute yt-dlp commands safely.

**Security Measures**: URL validation to prevent SSRF attacks by restricting allowed YouTube domains (youtube.com, youtu.be, m.youtube.com, music.youtube.com).

**API Structure**:
- `/api/video-info` - GET endpoint for fetching YouTube video metadata (title, thumbnail, duration, channel)
- `/api/download-segment` - POST endpoint for processing and downloading video segments with specified time ranges and aspect ratios

**Request/Response Flow**: Express middleware for JSON parsing with raw body preservation, request logging with timing information, and structured error handling.

**Development Tools**: Custom Vite integration for HMR (Hot Module Reload) in development mode, with middleware mode for seamless frontend-backend integration.

### Data Storage

**Current Implementation**: In-memory storage using a Map-based storage class (`MemStorage`) for user data. This is a lightweight solution suitable for the current scope where no persistent user data is required.

**Schema Definition**: Drizzle ORM configured for PostgreSQL with schema definitions in TypeScript, though not actively used in the current implementation. The database configuration is present for future expansion.

**Storage Interface**: Generic `IStorage` interface allowing for future database implementations without changing consuming code.

### External Dependencies

**Third-Party Services**:
- **yt-dlp**: Core dependency for YouTube video downloading and processing. Executes as a system command with argument-based control.
- **Google Fonts**: Inter and Archivo Black fonts loaded from Google Fonts CDN for typography.

**UI Component Libraries**:
- **Radix UI**: Comprehensive collection of unstyled, accessible UI primitives (dialogs, dropdowns, accordions, tooltips, etc.)
- **Embla Carousel**: Carousel/slider component for potential content presentation
- **React Icons**: Icon library providing social media icons (YouTube, TikTok, Instagram)
- **Lucide React**: Icon set for UI elements (scissors, download, upload, etc.)

**Form Handling**:
- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation for API requests and responses
- **@hookform/resolvers**: Integration between React Hook Form and Zod

**Development Dependencies**:
- **Replit Plugins**: Runtime error modal, cartographer, and dev banner for Replit-specific development features
- **ESBuild**: Fast bundling for production server code
- **TSX**: TypeScript execution for development server

**Database Tooling** (configured but not actively used):
- **Drizzle Kit**: Database migration tool
- **@neondatabase/serverless**: Neon serverless PostgreSQL driver
- **connect-pg-simple**: PostgreSQL session store (configured for future session management)

**Video Processing Pipeline**: 
1. User submits YouTube URL
2. Server validates URL against whitelist
3. yt-dlp fetches video metadata
4. User selects time range and aspect ratio
5. Server executes yt-dlp with segment and conversion parameters
6. Processed video segment returned to client for download

**Aspect Ratio Handling**: Four supported formats (9:16, 1:1, 16:9, 4:5) with FFmpeg-based cropping/scaling applied during download process.