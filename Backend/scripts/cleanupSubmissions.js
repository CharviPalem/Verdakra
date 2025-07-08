const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Define the path to the .env file
const envPath = path.resolve(__dirname, '../.env');
console.log(`Attempting to load .env file from: ${envPath}`);

// Load environment variables
dotenv.config({ path: envPath });

const Submission = require('../models/Submission');
const Problem = require('../models/Problem');

const MONGODB_URI = process.env.MONGODB_URI;

const cleanupSubmissions = async () => {
  console.log('Starting submission cleanup script...');

  if (!MONGODB_URI) {
    console.error('\nError: MONGODB_URI is not defined.');
    console.error(`Please ensure a .env file exists at '${envPath}' and contains the MONGODB_URI variable.`);
    process.exit(1);
  }

  let connection;
  try {
    console.log('Connecting to MongoDB...');
    connection = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully.');

    const submissions = await Submission.find({});
    let repairedCount = 0;

    console.log(`Found ${submissions.length} total submissions. Starting cleanup...`);

    for (const sub of submissions) {
      // Check if the problem field is NOT a valid ObjectId, meaning it's likely a slug
      if (sub.problem && !mongoose.Types.ObjectId.isValid(sub.problem)) {
        const problemSlug = sub.problem.toString(); // The field currently holds the slug
        console.log(`Found submission ${sub._id} with invalid problem reference: ${problemSlug}`);

        const problem = await Problem.findOne({ slug: problemSlug });

        if (problem) {
          console.log(`  -> Found matching problem: ${problem.title} (${problem._id})`);
          sub.problem = problem._id; // Update with the correct ObjectId
          await sub.save();
          repairedCount++;
          console.log(`  -> Successfully repaired submission ${sub._id}.`);
        } else {
          console.warn(`  -> WARNING: Could not find a problem with slug: ${problemSlug}. Skipping submission ${sub._id}.`);
        }
      } else {
         console.log(`Submission ${sub._id} has a valid problem reference. Skipping.`);
      }
    }

    console.log(`
Cleanup finished.`);
    console.log(`Repaired ${repairedCount} submissions.`);

  } catch (error) {
    console.error('An error occurred during the cleanup process:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

cleanupSubmissions();
