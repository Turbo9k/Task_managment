# TaskFlow - Collaborative Task Management Platform

A modern, vibrant task management application built with Vue.js 3, Express.js, and real-time collaboration features.

## ✨ Features

### 🎨 **Vibrant UI/UX**
- **Dark Mode Support**: Seamless light/dark theme switching
- **Animated Components**: Smooth transitions and engaging animations
- **Gradient Design**: Beautiful gradient backgrounds and effects
- **Responsive Layout**: Mobile-first design that works on all devices

### 👥 **Role-Based Access**
- **Admin**: Full system control with red theme and crown indicator 👑
- **Manager**: Project oversight with green theme and chart indicator 📊
- **Developer**: Task execution with blue theme and code indicator 💻

### 💬 **Real-Time Collaboration**
- **Task Chat**: Individual chat for each task
- **Project Chat**: Team collaboration on project level
- **Global Chat**: Organization-wide communication
- **Live Features**: Typing indicators, online status, message timestamps

### 📋 **Task Management**
- Create, edit, and delete tasks
- Priority levels (Low, Medium, High, Urgent)
- Status tracking (To Do, In Progress, Review, Done)
- Due date management
- Task assignment and filtering

### 📁 **Project Organization**
- Project creation and management
- Progress tracking with visual indicators
- Team member management
- Project-specific chat and collaboration

## 🚀 **Quick Start**

### Prerequisites
- Node.js 16+ 
- npm or yarn
- MySQL database (or use provided setup scripts)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/taskflow.git
   cd taskflow
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp env.example .env
   cp client/env.example client/.env
   
   # Edit .env files with your configuration
   ```

4. **Database Setup**
   ```bash
   # Run database setup script
   node setup-database.bat  # Windows
   # or
   chmod +x setup-database.sh && ./setup-database.sh  # Linux/Mac
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3000

## 🛠 **Tech Stack**

### Frontend
- **Vue.js 3** - Progressive JavaScript framework
- **Vue Router** - Client-side routing
- **Vuex** - State management
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide Vue** - Beautiful icons
- **Socket.io Client** - Real-time communication

### Backend
- **Express.js** - Web application framework
- **Socket.io** - Real-time bidirectional communication
- **MySQL** - Relational database
- **JWT** - Authentication
- **Passport.js** - Authentication middleware
- **Bcrypt** - Password hashing

## 📦 **Deployment**

### Vercel Deployment

1. **Connect to GitHub**
   - Push your code to GitHub
   - Connect your repository to Vercel

2. **Environment Variables**
   Set these in Vercel dashboard:
   ```
   NODE_ENV=production
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=your_database_name
   JWT_SECRET=your_jwt_secret
   ```

3. **Build Settings**
   - Build Command: `cd client && npm run build`
   - Output Directory: `client/dist`
   - Install Command: `npm install && cd client && npm install`

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 🎯 **Usage**

### Getting Started
1. **Register/Login**: Create an account or use demo credentials
2. **Choose Role**: Select your role (Admin, Manager, Developer)
3. **Create Projects**: Set up your first project
4. **Add Tasks**: Create and assign tasks to team members
5. **Collaborate**: Use chat features for real-time communication

### Key Features
- **Dashboard**: Overview of tasks, projects, and team activity
- **Task Management**: Create, edit, and track task progress
- **Project Organization**: Manage projects with team collaboration
- **Real-time Chat**: Communicate with team members instantly
- **Role-based Access**: Different permissions based on user role

## 🔧 **Configuration**

### Environment Variables

**Server (.env)**
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=taskflow
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

**Client (client/.env)**
```env
VUE_APP_API_URL=http://localhost:3000
VUE_APP_SOCKET_URL=http://localhost:3000
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- Vue.js team for the amazing framework
- Tailwind CSS for the utility-first CSS approach
- Lucide for the beautiful icon set
- Socket.io for real-time communication capabilities

## 📞 **Support**

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Contact the development team

---

**Made with ❤️ by the TaskFlow Team**