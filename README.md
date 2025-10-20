API documentation: https://data-rooms-production-d8ba.up.railway.app/docs

## Installation

### Prerequisites
- Docker and Docker Compose installed

### Setup Instructions

1. **Configure environment variables**
   ```bash
   mv .env.example .env
   ```

2. **Run the application**
   ```bash
   docker-compose up
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

---

## Key Design Decisions

### 1. Tech Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Shadcn/Radix UI
- **Backend**: FastAPI (Python) + PostgreSQL + SQLAlchemy + Redis
- **Local Development**: Docker Compose
- **Deployment**: Frontend on Netlify, Backend on Railway

### 2. Scalability & Performance
- **Component Architecture**: Atomic, reusable components for maintainability
- **Reduced bundle size**: Lazy loaded components are reducing bundle size
- **React Arborist**: Specialized tree library with drag-and-drop, list virtualization, and optimization for large file/folder structures
- **Virtual Scrolling**: Efficiently handles large file trees without performance degradation
- **Async Operations**: FastAPI async/await enables concurrent request handling
- **Redis Caching**: Reduces database load and improves response times
- **Rate Limiting**: FastAPI rate limiter prevents spam requests

### 3. User Experience
- **Clean UI**: Sidebar navigation with main content area layout
- **Mobile Responsive**: Collapsible sidebar with overlay for small screens
- **URL-based Navigation**: Shareable links with `?folderId=` parameter
- **Real-time Feedback**: Toast notifications for success/error actions
- **File Management**: File preview and download functionality

### 4. CI/CD & Deployment
- **Frontend**: Automatic deployment to Netlify on GitHub repository updates
- **Backend**: Automatic deployment to Railway on GitHub repository updates
- **Zero-downtime**: Continuous deployment pipeline ensures seamless updates
