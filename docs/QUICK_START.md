# Quick Start Guide - Modern Note App

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **MongoDB** (v6 or higher) or MongoDB Atlas account
- **Git**
- **npm** or **yarn**

## Quick Setup (5 minutes)

### 1. Clone and Setup

```bash
# Clone the project
git clone <repository-url>
cd modern-note-app

# Install dependencies for both frontend and backend
cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment Configuration

Create `.env` files in both backend and frontend directories:

**Backend (.env)**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/noteapp
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Modern Note App
```

### 3. Start Development Servers

Open two terminal windows:

**Terminal 1 - Backend**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
```

### 4. Verify Setup

- Backend should be running on `http://localhost:5000`
- Frontend should be running on `http://localhost:3000`
- Visit `http://localhost:3000` in your browser
- You should see the application homepage

## Development Workflow

### Starting a New Feature

1. **Pick a ticket** from the backlog
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Implement the feature** following the code standards
4. **Write tests** for your feature
5. **Submit a pull request** for review

### Code Standards

- Use TypeScript for type safety
- Follow ESLint and Prettier rules
- Write meaningful commit messages
- Include tests for new functionality
- Update documentation when needed

### Testing

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test

# Run all tests
npm run test:all
```

## Common Tasks

### Adding a New API Endpoint

1. Create route in `backend/src/routes/`
2. Add controller in `backend/src/controllers/`
3. Update validation in `backend/src/validation/`
4. Add tests in `backend/src/tests/`
5. Update API documentation

### Adding a New React Component

1. Create component in `frontend/src/components/`
2. Add TypeScript interfaces
3. Include Storybook stories
4. Add tests
5. Update component documentation

### Database Changes

1. Update Mongoose schema
2. Create migration script if needed
3. Update seed data
4. Test with existing data

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
- Ask in team channels
- Create an issue if you find a bug

## Next Steps

After completing the quick setup:

1. **Explore the codebase** - Familiarize yourself with the project structure
2. **Review the backlog** - Understand the current priorities
3. **Pick a starter ticket** - Begin with a well-defined, smaller task
4. **Set up your development environment** - Configure your IDE and tools
5. **Join the team communication** - Connect with other developers

## Useful Commands

```bash
# Backend commands
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Run linter

# Frontend commands
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Run linter
npm run storybook    # Start Storybook

# Database commands
npm run db:seed      # Seed database with test data
npm run db:migrate   # Run database migrations
```

Happy coding! 🚀