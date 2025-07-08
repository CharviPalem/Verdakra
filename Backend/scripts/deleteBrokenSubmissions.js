const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const Submission = require('../models/Submission');
const Problem = require('../models/Problem');

const MONGODB_URI = process.env.MONGODB_URI;

const deleteBrokenSubmissions = async () => {
  if (!MONGODB_URI) {
    console.error(`Error: MONGODB_URI not found in .env file at ${envPath}.`);
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully.');

    const submissions = await Submission.find({});
    let deletedCount = 0;

    console.log(`Found ${submissions.length} total submissions. Checking for broken references...`);

    // Create a set of all valid problem IDs for efficient lookup
    const validProblemIds = new Set(
      (await Problem.find({}).select('_id')).map(p => p._id.toString())
    );

    for (const sub of submissions) {
      // Check if submission has a problem field and if it's a valid ID that exists in the problems collection
      if (!sub.problem || !validProblemIds.has(sub.problem.toString())) {
        console.log(`Found submission ${sub._id} with broken or missing problem reference: ${sub.problem}. Deleting...`);
        await Submission.findByIdAndDelete(sub._id);
        deletedCount++;
        console.log(`  -> Successfully deleted submission ${sub._id}.`);
      } else {
         console.log(`Submission ${sub._id} has a valid problem reference. Skipping.`);
      }
    }

    console.log(`\nCleanup finished.`);
    console.log(`Deleted ${deletedCount} broken submissions.`);

  } catch (error) {
    console.error('An error occurred during the cleanup process:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

deleteBrokenSubmissions();
