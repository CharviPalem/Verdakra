const express = require('express');
const mongoose = require('mongoose');
const { judgeSubmission } = require('./judge');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Connect to MongoDB (assuming same connection as main backend)
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/verdakra', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected for code execution service'))
.catch(err => console.error('MongoDB connection error:', err));

// Judge submission endpoint
app.post('/judge', async (req, res) => {
  const { submissionId } = req.body;
  
  if (!submissionId) {
    return res.status(400).json({ error: 'Submission ID is required' });
  }
  
  try {
    await judgeSubmission(submissionId);
    res.json({ message: 'Submission queued for judging' });
  } catch (error) {
    console.error('Error processing submission:', error);
    res.status(500).json({ error: 'Failed to process submission' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Code execution service running on port ${PORT}`);
});
