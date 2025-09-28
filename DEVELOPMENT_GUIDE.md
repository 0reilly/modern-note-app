# Development Guide - Modern Note App

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Git

### Local Development Setup

1. **Clone and Setup**
   ```bash
   git clone https://github.com/0reilly/modern-note-app.git
   cd modern-note-app
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

4. **Using Docker (Alternative)**
   ```bash
   docker-compose up -d
   ```

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/modern-note-app
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
```

## Project Structure

```
modern-note-app/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── config/         # Database, Socket.IO config
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, error handling
│   │   ├── utils/          # Logger, helpers
│   │   └── test/           # Test setup
│   ├── package.json
│   └── Dockerfile
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Route components
│   │   ├── store/          # Redux store
│   │   ├── services/       # API service
│   │   ├── types/          # TypeScript types
│   │   └── hooks/          # Custom hooks
│   ├── package.json
│   └── Dockerfile
├── docs/                   # Documentation
├── deployment/             # Deployment configs
└── docker-compose.yml      # Docker setup
```

## Development Workflow

### Feature Development

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Implement Feature**
   - Follow TypeScript best practices
   - Write tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   # Backend tests
   cd backend && npm test
   
   # Frontend tests
   cd frontend && npm test
   
   # Linting
   npm run lint
   ```

4. **Create Pull Request**
   - PR title follows conventional commits
   - Description includes changes and testing
   - Link related issues

### Code Standards

**TypeScript**
- Use strict mode
- Define interfaces for all data structures
- Avoid `any` type
- Use proper error handling

**React**
- Use functional components with hooks
- Follow React best practices
- Use TypeScript for props and state
- Implement proper loading and error states

**Backend**
- Use async/await for database operations
- Implement proper error handling
- Follow REST API conventions
- Use middleware for cross-cutting concerns

## Testing

### Backend Testing
```bash
cd backend
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Frontend Testing
```bash
cd frontend
npm test              # Run tests
npm run test:watch    # Watch mode
```

### End-to-End Testing
```bash
# Coming soon - Cypress setup
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Note Endpoints
- `GET /api/notes` - Get user's notes
- `POST /api/notes` - Create new note
- `GET /api/notes/:id` - Get specific note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `POST /api/notes/:id/collaborate` - Add collaborator

### User Endpoints
- `GET /api/users/search` - Search users for collaboration

## Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   # Set production environment variables
   export NODE_ENV=production
   ```

2. **Build and Deploy**
   ```bash
   # Backend
   cd backend && npm run build
   
   # Frontend
   cd frontend && npm run build
   ```

3. **Docker Deployment**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### CI/CD Pipeline

The GitHub Actions pipeline automatically:
- Runs tests on push/PR
- Builds Docker images
- Performs security scans
- (Future) Deploys to staging/production

## Troubleshooting

### Common Issues

**Backend won't start:**
- Check MongoDB connection
- Verify environment variables
- Check port availability

**Frontend build fails:**
- Clear node_modules and reinstall
- Check TypeScript errors
- Verify environment variables

**Database connection issues:**
- Ensure MongoDB is running
- Check connection string
- Verify network connectivity

### Getting Help

- Check the project documentation
- Review existing code examples
- Create an issue if you find a bug
- Ask in team communication channels

## Next Phase Development

### Phase 2 Priorities
1. Complete remaining API endpoints
2. Implement rich text editor
3. Add real-time collaboration
4. Enhance security measures
5. Add comprehensive testing

### Feature Backlog
See GitHub Issues for the complete feature backlog and current priorities.