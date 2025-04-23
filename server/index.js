const express = require('express');
  const mongoose = require('mongoose');
  const cors = require('cors');
  const app = express();

  mongoose.set('strictQuery', true);
  app.use(cors());
  app.use(express.json());

  mongoose.connect('mongodb+srv://skillkart:5QHBfMgX2tCoHfiH@cluster0.fl2boyi.mongodb.net/skillkart?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log('MongoDB connected')).catch(err => console.error('MongoDB connection error:', err));

  const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    role: { type: String, default: 'learner' },
    profile: {
      interests: [String],
      goals: String,
      weeklyTime: Number
    },
    xp: { type: Number, default: 0 },
    badges: [String]
  });
  const User = mongoose.model('User', userSchema);

  const resourceSchema = new mongoose.Schema({
    topicId: String,
    type: String,
    title: String,
    url: String,
    uploadedBy: String
  });
  const Resource = mongoose.model('Resource', resourceSchema);

  const discussionSchema = new mongoose.Schema({
    roadmap: String,
    userEmail: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
  });
  const Discussion = mongoose.model('Discussion', discussionSchema);

  const roadmapSchema = new mongoose.Schema({
    skill: String,
    weeks: [
      {
        weekNum: Number,
        topics: [{ id: String, name: String, status: String }]
      }
    ]
  });
  const Roadmap = mongoose.model('Roadmap', roadmapSchema);

  app.post('/api/auth/register', async (req, res) => {
    const { email, password, role } = req.body;
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      const user = new User({ email, password, role });
      await user.save();
      res.json({ success: true });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password }); // Debug log
    try {
      const user = await User.findOne({ email, password });
      if (user) {
        res.json({ user: { email, role: user.role, profile: user.profile, xp: user.xp, badges: user.badges } });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/api/user', async (req, res) => {
    const { email } = req.query;
    console.log('Fetch user:', { email }); // Debug log
    try {
      const user = await User.findOne({ email });
      if (user) {
        res.json({ user: { email, role: user.role, profile: user.profile, xp: user.xp, badges: user.badges } });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('User fetch error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/profile', async (req, res) => {
    const { email, interests, goals, weeklyTime } = req.body;
    try {
      const user = await User.findOneAndUpdate(
        { email },
        { profile: { interests, goals, weeklyTime } },
        { new: true }
      );
      res.json(user.profile);
    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/resources', async (req, res) => {
    const { topicId, type, title, url, uploadedBy } = req.body;
    try {
      const resource = new Resource({ topicId, type, title, url, uploadedBy });
      await resource.save();
      res.json({ success: true });
    } catch (error) {
      console.error('Resource error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/api/resources/:topicId', async (req, res) => {
    try {
      const resources = await Resource.find({ topicId: req.params.topicId });
      res.json(resources);
    } catch (error) {
      console.error('Resources error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/discussions', async (req, res) => {
    const { roadmap, userEmail, message } = req.body;
    try {
      const discussion = new Discussion({ roadmap, userEmail, message });
      await discussion.save();
      res.json({ success: true });
    } catch (error) {
      console.error('Discussion error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/api/discussions/:roadmap', async (req, res) => {
    try {
      const discussions = await Discussion.find({ roadmap: req.params.roadmap }).sort({ createdAt: -1 });
      res.json(discussions);
    } catch (error) {
      console.error('Discussions error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/api/roadmaps/:skill', async (req, res) => {
    try {
      const roadmap = await Roadmap.findOne({ skill: req.params.skill });
      if (roadmap) {
        res.json(roadmap);
      } else {
        res.json({
          skill: req.params.skill,
          weeks: [
            {
              weekNum: 1,
              topics: [
                { id: 't1', name: 'Introduction to UI/UX Design', status: 'In Progress' },
                { id: 't2', name: 'Design Principles', status: 'Completed' }
              ]
            },
            {
              weekNum: 2,
              topics: [
                { id: 't3', name: 'Wireframing and Prototyping', status: 'Not Started' },
                { id: 't4', name: 'Figma Basics', status: 'Not Started' }
              ]
            },
            {
              weekNum: 3,
              topics: [
                { id: 't5', name: 'User Research and Testing', status: 'Not Started' },
                { id: 't6', name: 'Information Architecture', status: 'Not Started' }
              ]
            },
            {
              weekNum: 4,
              topics: [
                { id: 't7', name: 'Visual Design and Branding', status: 'Not Started' },
                { id: 't8', name: 'Responsive Design', status: 'Not Started' }
              ]
            }
          ]
        });
      }
    } catch (error) {
      console.error('Roadmap error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/gamification', async (req, res) => {
    const { email, topicId, status } = req.body;
    try {
      const user = await User.findOne({ email });
      if (status === 'Completed') {
        user.xp += 50;
        if (user.xp >= 200 && !user.badges.includes('Beginner')) {
          user.badges.push('Beginner');
        }
      }
      await user.save();
      res.json({ xp: user.xp, badges: user.badges });
    } catch (error) {
      console.error('Gamification error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  const port = process.env.PORT || 5001;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});