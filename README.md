# TaskFlow - Collaborative Task Management

A modern, full-stack task management application built with Vue.js, Express.js, Socket.io, and MySQL. Features real-time collaboration, project management, and team productivity tools.

## 🚀 Features

### Core Features
- **User Authentication** - JWT-based auth with social login (Google/GitHub)
- **Project Management** - Create, organize, and manage projects with team members
- **Task Management** - Full CRUD operations with priorities, deadlines, and subtasks
- **Real-time Collaboration** - Live updates with Socket.io
- **Role-based Access** - Admin, Member, and Viewer roles

### Advanced Features
- **Kanban Board** - Drag-and-drop task management
- **Calendar View** - Timeline and deadline visualization
- **Analytics Dashboard** - Project progress and team performance metrics
- **Activity Feed** - Real-time notifications and updates
- **Dark Mode** - Modern UI with theme switching
- **Responsive Design** - Mobile and desktop optimized

### Developer Features
- **RESTful API** - Well-documented Express.js backend
- **Real-time Updates** - Socket.io for live collaboration
- **Database Seeding** - Demo data for easy testing
- **Error Handling** - Comprehensive error management
- **Security** - Rate limiting, CORS, and input validation

## 🛠 Tech Stack

### Frontend
- **Vue.js 3** - Progressive JavaScript framework
- **Vuex** - State management
- **Vue Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.io Client** - Real-time communication
- **Lucide Vue** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Socket.io** - Real-time bidirectional communication
- **MySQL** - Relational database
- **JWT** - JSON Web Tokens for authentication
- **Passport.js** - Authentication middleware
- **Bcrypt** - Password hashing
- **Multer 2.x** - File upload handling

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database setup**
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE task_management;
   exit
   
   # Import schema
   mysql -u root -p task_management < server/schema.sql
   ```

4. **Environment configuration**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials and other settings
   ```

5. **Seed demo data**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   npm run server
   ```

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   ```bash
   cp env.example .env
   # Edit .env with your API URL
   ```

4. **Start the development server**
   ```bash
   npm run serve
   ```

5. **Access the application**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3000/api
   - Health Check: http://localhost:3000/api/health

## 🎯 Demo Accounts

Use these credentials to explore the application:

| Email | Password | Role |
|-------|----------|------|
| admin@demo.com | password123 | Admin |
| john@demo.com | password123 | Member |
| jane@demo.com | password123 | Member |
| mike@demo.com | password123 | Member |
| sarah@demo.com | password123 | Member |

## 📱 Usage

### Getting Started
1. **Sign Up/Login** - Create an account or use demo credentials
2. **Create Project** - Set up your first project
3. **Add Team Members** - Invite collaborators
4. **Create Tasks** - Add tasks with priorities and deadlines
5. **Collaborate** - Use real-time features for team coordination

### Key Workflows
- **Project Management** - Organize tasks by projects
- **Task Assignment** - Assign tasks to team members
- **Progress Tracking** - Monitor completion status
- **Team Communication** - Use comments and activity feeds
- **Analytics** - View performance metrics and insights

## 🔧 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/github` - GitHub OAuth

### Project Endpoints
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Task Endpoints
- `GET /api/tasks/project/:id` - List project tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## 🚀 Deployment

### Vercel Deployment

1. **Prepare for deployment**
   ```bash
   # Build the frontend
   cd client
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

3. **Environment variables**
   - Set up environment variables in Vercel dashboard
   - Configure database connection
   - Set up OAuth credentials

### Database Setup
- Use a cloud MySQL service (PlanetScale, AWS RDS, etc.)
- Update connection string in environment variables
- Run database migrations

## 🧪 Testing

```bash
# Run backend tests
npm test

# Run frontend tests
cd client
npm test

# Run e2e tests
npm run test:e2e
```

## 📊 Performance

- **Real-time Updates** - Sub-100ms latency
- **Database Queries** - Optimized with proper indexing
- **Frontend Bundle** - Code splitting and lazy loading
- **Caching** - Redis for session management
- **CDN** - Static asset optimization

## 🔒 Security

- **Authentication** - JWT tokens with expiration
- **Authorization** - Role-based access control
- **Input Validation** - Comprehensive data validation
- **Rate Limiting** - API request throttling
- **CORS** - Cross-origin resource sharing
- **HTTPS** - SSL/TLS encryption

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Vue.js team for the amazing framework
- Express.js community for the robust backend
- Socket.io for real-time capabilities
- Tailwind CSS for the utility-first approach
- All contributors and testers

## 📞 Support

For support, email support@taskflow.com or create an issue in the repository.

---

**Built with ❤️ for job interviews and portfolio demonstrations**
