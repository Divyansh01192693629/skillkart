const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

mongoose.set('strictQuery', true);
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://skillkart:5QHBfMgX2tCoHfiH@cluster0.fl2boyi.mongodb.net/skillkart?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
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

// Resource Schema
const resourceSchema = new mongoose.Schema({
  topicId: String,
  type: String,
  title: String,
  url: String,
  uploadedBy: String,
  ratings: [{ userEmail: String, rating: Number }],
});
const Resource = mongoose.model('Resource', resourceSchema);

// Discussion Schema
const discussionSchema = new mongoose.Schema({
  roadmap: String,
  userEmail: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});
const Discussion = mongoose.model('Discussion', discussionSchema);

// Default Roadmap Schema
const roadmapSchema = new mongoose.Schema({
  skill: String,
  weeks: [
    {
      weekNum: Number,
      name: String,
      topics: [{ id: String, name: String, status: String }]
    }
  ]
});
const Roadmap = mongoose.model('Roadmap', roadmapSchema);

// User-Specific Roadmap Schema
const userRoadmapSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  skill: { type: String, required: true },
  weeks: [
    {
      weekNum: Number,
      name: String,
      topics: [{ id: String, name: String, status: String }],
    },
  ],
});
const UserRoadmap = mongoose.model('UserRoadmap', userRoadmapSchema);

// Template Schema
const templateSchema = new mongoose.Schema({
  name: String,
  skill: String,
  weeks: [
    {
      weekNum: Number,
      name: String,
      topics: [{ id: String, name: String, status: String }],
    },
  ],
});
const Template = mongoose.model('Template', templateSchema);

// Progress Schema
const progressSchema = new mongoose.Schema({
  userEmail: String,
  skill: String,
  date: { type: Date, default: Date.now },
  completionPercentage: Number,
  topicsCompleted: Number,
});
const Progress = mongoose.model('Progress', progressSchema);

// Register Route
app.post('/api/auth/register', async (req, res) => {
  const { email, password, role } = req.body;
  console.log('Register attempt:', { email, password, role });
  try {
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const user = new User({ email, password, role });
    await user.save();
    console.log('User registered:', { email, role });
    res.json({ success: true });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email, password });
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

// Fetch User Route
app.get('/api/user', async (req, res) => {
  const { email } = req.query;
  console.log('Fetch user:', { email });
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

// Update Profile Route
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

// Upload Resource Route
app.post('/api/resources', async (req, res) => {
  const { topicId, type, title, url, uploadedBy } = req.body;
  try {
    const resource = new Resource({ topicId, type, title, url, uploadedBy });
    await resource.save();
    res.json({ success: true, resource });
  } catch (error) {
    console.error('Resource error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch Resources Route
app.get('/api/resources/:topicId', async (req, res) => {
  try {
    const resources = await Resource.find({ topicId: req.params.topicId });
    res.json(resources);
  } catch (error) {
    console.error('Resources error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Rate Resource Route
app.post('/api/resources/rate', async (req, res) => {
  const { resourceId, userEmail, rating } = req.body;
  try {
    const resource = await Resource.findById(resourceId);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    if (!resource.ratings) resource.ratings = [];
    const existingRating = resource.ratings.find(r => r.userEmail === userEmail);
    if (existingRating) {
      existingRating.rating = rating;
    } else {
      resource.ratings.push({ userEmail, rating });
    }
    await resource.save();
    res.json({ success: true, resource });
  } catch (error) {
    console.error('Resource rating error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Post Discussion Route
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

// Fetch Discussions Route
app.get('/api/discussions/:roadmap', async (req, res) => {
  try {
    const discussions = await Discussion.find({ roadmap: req.params.roadmap }).sort({ createdAt: -1 });
    res.json(discussions);
  } catch (error) {
    console.error('Discussions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch Default Roadmap Route
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
            name: 'Week 1',
            topics: [
              { id: 't1', name: 'Introduction to ' + req.params.skill, status: 'In Progress' },
              { id: 't2', name: 'Fundamentals', status: 'Not Started' }
            ]
          },
          {
            weekNum: 2,
            name: 'Week 2',
            topics: [
              { id: 't3', name: 'Intermediate Concepts', status: 'Not Started' },
              { id: 't4', name: 'Tools and Techniques', status: 'Not Started' }
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

// Fetch or Create User-Specific Roadmap
app.get('/api/user-roadmaps/:skill', async (req, res) => {
  const { skill } = req.params;
  const { email } = req.query;
  try {
    let userRoadmap = await UserRoadmap.findOne({ userEmail: email, skill });
    if (!userRoadmap) {
      const defaultRoadmap = await Roadmap.findOne({ skill });
      userRoadmap = new UserRoadmap({
        userEmail: email,
        skill,
        weeks: defaultRoadmap ? defaultRoadmap.weeks : [
          { weekNum: 1, name: 'Week 1', topics: [{ id: 't1', name: 'Introduction', status: 'Not Started' }] },
        ],
      });
      await userRoadmap.save();
    }
    res.json(userRoadmap);
  } catch (error) {
    console.error('User roadmap fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update User-Specific Roadmap
app.put('/api/user-roadmaps/:skill', async (req, res) => {
  const { skill } = req.params;
  const { email, weeks } = req.body;
  try {
    const userRoadmap = await UserRoadmap.findOneAndUpdate(
      { userEmail: email, skill },
      { weeks },
      { new: true, upsert: true }
    );
    res.json(userRoadmap);
  } catch (error) {
    console.error('User roadmap update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch Templates
app.get('/api/templates', async (req, res) => {
  try {
    const templates = await Template.find();
    res.json(templates);
  } catch (error) {
    console.error('Template fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save Template
app.post('/api/templates', async (req, res) => {
  const { name, skill, weeks } = req.body;
  try {
    const template = new Template({ name, skill, weeks });
    await template.save();
    res.json({ success: true, template });
  } catch (error) {
    console.error('Template save error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save Progress
app.post('/api/progress', async (req, res) => {
  const { userEmail, skill, completionPercentage, topicsCompleted } = req.body;
  try {
    const progress = new Progress({ userEmail, skill, completionPercentage, topicsCompleted });
    await progress.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Progress save error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch Progress
app.get('/api/progress/:skill', async (req, res) => {
  const { skill } = req.params;
  const { email } = req.query;
  try {
    const progressData = await Progress.find({ userEmail: email, skill }).sort({ date: 1 });
    res.json(progressData);
  } catch (error) {
    console.error('Progress fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Gamification Route
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