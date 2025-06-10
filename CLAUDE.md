# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack web application called "roulette" with:
- **Backend**: Go REST API using Gin framework (port 8080)
- **Frontend**: SolidJS SPA with TypeScript and Vite (port 3000)

## Essential Commands

### Development
```bash
# Start both frontend and backend servers
./run.sh

# Or start individually:
cd backend && go run main.go     # Backend on :8080
cd frontend && npm run dev       # Frontend on :3000
```

### Frontend Commands
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Backend Commands
```bash
cd backend
go run main.go       # Run server
go build -o server   # Build binary
go mod download      # Download dependencies
go mod tidy          # Clean up dependencies
```

## Architecture

The application follows a client-server architecture:
- Backend exposes REST API endpoints under `/api/*` path
- Frontend makes HTTP requests to `http://localhost:8080/api/*`
- CORS is configured to allow requests from `http://localhost:3000`

### Key Backend Structure
- `main.go`: Sets up Gin router with CORS middleware and defines API endpoints
- Current endpoints:
  - `GET /api/health` - Health check endpoint
  - `GET /api/hello?name=X` - Example greeting endpoint

### Key Frontend Structure
- `src/index.tsx`: Application entry point
- `src/App.tsx`: Main application component
- `src/components/`: Reusable components (e.g., `ApiExample.tsx` demonstrates API integration)
- Uses SolidJS reactive primitives (createSignal, createEffect) for state management

## Development Guidelines

1. **API Changes**: When adding new backend endpoints, ensure CORS headers are properly set
2. **Frontend API Calls**: Use the existing pattern in `ApiExample.tsx` as a reference for making API calls
3. **TypeScript**: All frontend code should be properly typed
4. **Component Structure**: Follow SolidJS patterns using signals and effects for reactivity