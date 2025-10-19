module.exports = (req, res) => {
  // Mock tasks data
  const mockTasks = [
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
    }
  ];

  res.json({
    success: true,
    data: mockTasks
  });
};
