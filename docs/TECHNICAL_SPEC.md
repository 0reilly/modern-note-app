# Technical Specification - Modern Note App

## Architecture Overview

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │◄──►│   Express API   │◄──►│   MongoDB       │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Socket.io     │    │   Redis Cache   │    │   File Storage  │
│   (Real-time)   │    │   (Session)     │    │   (AWS S3)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  name: String,
  avatar: String (URL),
  preferences: {
    theme: String ("light" | "dark"),
    language: String,
    editorMode: String ("rich" | "markdown")
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Note Collection
```javascript
{
  _id: ObjectId,
  title: String,
  content: String,
  author: ObjectId (ref: User),
  collaborators: [ObjectId] (ref: User),
  tags: [String],
  category: String,
  isPublic: Boolean,
  isArchived: Boolean,
  lastEditedBy: ObjectId (ref: User),
  version: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Session Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  token: String,
  expiresAt: Date,
  createdAt: Date
}
```

## API Endpoints

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### User Routes
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/search` - Search users for collaboration

### Note Routes
- `GET /api/notes` - Get user's notes (with pagination and filtering)
- `POST /api/notes` - Create new note
- `GET /api/notes/:id` - Get specific note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `POST /api/notes/:id/share` - Share note with other users
- `POST /api/notes/:id/collaborate` - Add collaborator
- `GET /api/notes/search` - Search notes
- `GET /api/notes/categories` - Get note categories
- `GET /api/notes/tags` - Get all tags

### File Routes
- `POST /api/files/upload` - Upload file
- `GET /api/files/:id` - Get file
- `DELETE /api/files/:id` - Delete file

## Frontend Architecture

### Component Structure
```
src/
├── components/
│   ├── common/
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── Modal/
│   │   └── Button/
│   ├── auth/
│   │   ├── LoginForm/
│   │   ├── RegisterForm/
│   │   └── AuthGuard/
│   ├── notes/
│   │   ├── NoteList/
│   │   ├── NoteEditor/
│   │   ├── NoteCard/
│   │   └── RichTextEditor/
│   └── layout/
│       ├── MainLayout/
│       └── DashboardLayout/
├── pages/
│   ├── Home/
│   ├── Dashboard/
│   ├── Notes/
│   ├── Editor/
│   └── Settings/
├── hooks/
│   ├── useAuth/
│   ├── useNotes/
│   └── useSocket/
├── store/
│   ├── authSlice/
│   ├── notesSlice/
│   └── uiSlice/
├── services/
│   ├── api/
│   ├── auth/
│   └── socket/
└── utils/
    ├── constants/
    ├── helpers/
    └── validation/
```

### State Management
- **Redux Toolkit** for global state
- **React Query** for server state
- **Local Storage** for user preferences

## Security Measures

### Authentication & Authorization
- JWT tokens with refresh token rotation
- Password hashing with bcrypt (salt rounds: 12)
- Rate limiting on authentication endpoints
- Session management with Redis

### Data Validation
- Input validation with Joi/Express-validator
- XSS protection with DOMPurify
- CSRF protection
- SQL injection prevention (MongoDB built-in)

### File Upload Security
- File type validation
- Size limits (10MB max)
- Virus scanning integration
- Secure S3 bucket policies

## Performance Optimizations

### Frontend
- Code splitting with React.lazy()
- Image optimization with WebP format
- Bundle analysis and tree shaking
- Service Worker for caching

### Backend
- Database indexing on frequently queried fields
- Redis caching for session and frequent queries
- Connection pooling for MongoDB
- Compression middleware

### Database
- Compound indexes for search queries
- TTL indexes for session cleanup
- Read preference configuration

## Real-time Features

### WebSocket Events
```javascript
// Note collaboration events
{
  'note:join': { noteId: string },
  'note:leave': { noteId: string },
  'note:update': { noteId: string, content: string, userId: string },
  'note:cursor': { noteId: string, position: number, userId: string },
  'note:user-joined': { noteId: string, user: User },
  'note:user-left': { noteId: string, userId: string }
}
```

## Testing Strategy

### Frontend Testing
- **Unit Tests**: Jest + React Testing Library
- **Component Tests**: Storybook for UI components
- **Integration Tests**: Cypress for user flows
- **Performance Tests**: Lighthouse CI

### Backend Testing
- **Unit Tests**: Jest for business logic
- **Integration Tests**: Supertest for API endpoints
- **Database Tests**: MongoDB Memory Server
- **Security Tests**: OWASP ZAP integration

## Deployment Strategy

### Development Environment
- Local MongoDB instance
- Hot reloading for frontend and backend
- Environment variables for configuration

### Staging Environment
- Docker containers
- MongoDB Atlas
- Vercel for frontend
- Heroku/Railway for backend

### Production Environment
- Load balancer configuration
- CDN for static assets
- Database replication
- Monitoring and alerting

## Monitoring & Observability

### Application Metrics
- Response time tracking
- Error rate monitoring
- User activity analytics
- Database performance metrics

### Infrastructure Monitoring
- Server resource utilization
- Database connection pools
- Cache hit ratios
- Network latency

### Error Tracking
- Sentry for frontend errors
- Winston for backend logging
- Centralized log aggregation
- Performance tracing

## Development Guidelines

### Code Standards
- ESLint + Prettier configuration
- TypeScript strict mode
- Git hooks with Husky
- Conventional commits

### Documentation
- API documentation with Swagger
- Component documentation with Storybook
- Architecture decision records (ADRs)
- Deployment runbooks