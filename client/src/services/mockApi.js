// Mock API for development and demo purposes
const mockData = {
  tasks: [
    {
      id: 1,
      title: 'Welcome to TaskFlow!',
      description: 'This is a demo task to get you started.',
      status: 'todo',
      priority: 'medium',
      project_id: 1,
      assignee_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Set up your first project',
      description: 'Create a new project and invite team members.',
      status: 'in_progress',
      priority: 'high',
      project_id: 1,
      assignee_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      title: 'Explore the dashboard',
      description: 'Take a look at the analytics and project overview.',
      status: 'done',
      priority: 'low',
      project_id: 1,
      assignee_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  projects: [
    {
      id: 1,
      name: 'Demo Project',
      description: 'A sample project to demonstrate TaskFlow features',
      color: '#3B82F6',
      created_by: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  users: [
    {
      id: 1,
      name: 'Demo User',
      email: 'demo@example.com',
      avatar: null
    }
  ]
};

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  // Auth endpoints
  async login(credentials) {
    await delay(500);
    if (credentials.email === 'demo@example.com' && credentials.password === 'demo123') {
      return {
        success: true,
        token: 'mock-jwt-token-' + Date.now(),
        user: mockData.users[0]
      };
    }
    throw new Error('Invalid credentials');
  },

  async register(userData) {
    await delay(500);
    return {
      success: true,
      token: 'mock-jwt-token-' + Date.now(),
      user: { ...userData, id: Date.now() }
    };
  },

  // Task endpoints
  async getTasks() {
    await delay(300);
    return { success: true, data: mockData.tasks };
  },

  async createTask(taskData) {
    await delay(300);
    const newTask = {
      id: Date.now(),
      ...taskData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockData.tasks.push(newTask);
    return { success: true, data: newTask };
  },

  async updateTask(id, updates) {
    await delay(300);
    const taskIndex = mockData.tasks.findIndex(task => task.id === id);
    if (taskIndex !== -1) {
      mockData.tasks[taskIndex] = { ...mockData.tasks[taskIndex], ...updates, updated_at: new Date().toISOString() };
      return { success: true, data: mockData.tasks[taskIndex] };
    }
    throw new Error('Task not found');
  },

  async deleteTask(id) {
    await delay(300);
    const taskIndex = mockData.tasks.findIndex(task => task.id === id);
    if (taskIndex !== -1) {
      mockData.tasks.splice(taskIndex, 1);
      return { success: true };
    }
    throw new Error('Task not found');
  },

  // Project endpoints
  async getProjects() {
    await delay(300);
    return { success: true, data: mockData.projects };
  },

  async createProject(projectData) {
    await delay(300);
    const newProject = {
      id: Date.now(),
      ...projectData,
      created_by: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockData.projects.push(newProject);
    return { success: true, data: newProject };
  },

  // User endpoints
  async getUsers() {
    await delay(300);
    return { success: true, data: mockData.users };
  }
};
