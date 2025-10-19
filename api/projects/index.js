module.exports = (req, res) => {
  // Mock projects data
  const mockProjects = [
    {
      id: 1,
      name: 'Demo Project',
      description: 'A sample project to demonstrate TaskFlow features',
      color: '#3B82F6',
      created_by: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  res.json({
    success: true,
    data: mockProjects
  });
};
