/*
  Seed script to insert four classic LeetCode problems into the Problems collection:
  - Two Sum
  - Add Two Numbers
  - Longest Substring Without Repeating Characters
  - Median of Two Sorted Arrays

  Usage:
  1. Ensure MONGODB_URI is set in your environment (or .env). Defaults to local instance.
  2. Run:  npm run seed:leetcode  (script added to package.json)
*/

require('dotenv').config();
const mongoose = require('mongoose');
const slugify = require('slugify');
const Problem = require('../models/Problem');
const User = require('../models/User');

(async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/onlinejudge';
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Ensure there is an admin user to associate as creator
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'password',
        role: 'admin',
      });
      console.log('Created default admin user with email admin@example.com / password "password"');
    }

    // Clear existing problems
    await Problem.deleteMany({});
    console.log('Cleared existing problems.');

    // Problem templates
    const problems = [
      {
        title: 'Two Sum',
        description:
          'Given an array of integers nums and an integer target, return the indices of the first two numbers such that they add up to the target.\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\nReturn the indices of the first valid pair found.',
        difficulty: 'easy',
        constraints:
          '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.',
        inputFormat: 'First line: n (size of array)\nSecond line: n space-separated integers (array elements)\nThird line: target integer',
        outputFormat: 'Two indices (0-based) of the elements whose sum is target, space-separated.',
        sampleTestCases: [
          {
            input: '4\n2 7 11 15\n9',
            output: '0 1',
            explanation: 'nums[0] + nums[1] == 9',
          },
        ],
        testCases: [
          {
            input: '3\n3 2 4\n6',
            output: '1 2',
          },
          {
            input: '2\n3 3\n6',
            output: '0 1',
          },
          {
            input: '4\n-1 -5 2 10\n1',
            output: '0 2',
          },
          {
            input: '4\n0 4 3 0\n0',
            output: '0 3',
          },
          {
            input: '4\n1000000000 2 7 1000000000\n2000000000',
            output: '0 3',
          },
          // TLE test case: large array, sum at ends
          {
            input: '10000\n' + Array(9999).fill('1').join(' ') + ' 9999\n10000',
            output: '0 9999',
            isHidden: true,
          },
        ],
        tags: ['array', 'hash-table'],
      },
      {
        title: 'Add Two Numbers',
        description:
          'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.\nYou may assume the two numbers do not contain any leading zero, except the number 0 itself.',
        difficulty: 'medium',
        constraints: 'The number of nodes in each linked list is in the range [1, 100].\n0 <= Node.val <= 9\nIt is guaranteed that the list represents a number that does not have leading zeros.',
        inputFormat: 'First line: m (nodes in first list)\nSecond line: m space-separated digits\nThird line: n (nodes in second list)\nFourth line: n space-separated digits',
        outputFormat: 'Space-separated digits of the resulting linked list (reverse order).',
        sampleTestCases: [
          {
            input: '3\n2 4 3\n3\n5 6 4',
            output: '7 0 8',
          },
        ],
        testCases: [
          {
            input: '1\n0\n1\n0',
            output: '0',
          },
          {
            input: '7\n9 9 9 9 9 9 9\n4\n9 9 9 9',
            output: '8 9 9 9 0 0 0 1',
          },
          {
            input: '2\n1 8\n1\n0',
            output: '1 8',
          },
          {
            input: '1\n5\n1\n5',
            output: '0 1',
          },
        ],
        tags: ['linked-list', 'math'],
      },
      {
        title: 'Longest Substring Without Repeating Characters',
        description:
          'Given a string s, find the length of the longest substring without repeating characters.',
        difficulty: 'medium',
        constraints: '0 <= |s| <= 5 * 10^4',
        inputFormat: 'A single string s',
        outputFormat: 'Length of the longest substring without repeating characters',
        sampleTestCases: [
          {
            input: 'abcabcbb',
            output: '3',
            explanation: 'The answer is "abc", with length 3.',
          },
        ],
        testCases: [
          {
            input: 'bbbbb',
            output: '1',
          },
          {
            input: 'pwwkew',
            output: '3',
          },
          {
            input: ' ',
            output: '1',
          },
          {
            input: 'au',
            output: '2',
          },
          {
            input: 'dvdf',
            output: '3',
          },
          // TLE test case: string of length 50000, all 'a'
          {
            input: Array(50000).fill('a').join(''),
            output: '1',
            isHidden: true,
          },
        ],
        tags: ['hash-table', 'string', 'sliding-window'],
      },
      {
        title: 'Median of Two Sorted Arrays',
        description:
          'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.\nThe overall run time complexity should be O(log (m+n)).',
        difficulty: 'hard',
        constraints: 'nums1.length == m\nnums2.length == n\n0 <= m <= 1000\n0 <= n <= 1000\n1 <= m + n <= 2000\n-10^6 <= nums1[i], nums2[i] <= 10^6',
        inputFormat: 'First line: m (size of first array)\nSecond line: m space-separated integers (nums1)\nThird line: n (size of second array)\nFourth line: n space-separated integers (nums2)',
        outputFormat: 'Median (as floating point if necessary)',
        sampleTestCases: [
          {
            input: '2\n1 3\n1\n2',
            output: '2.0',
          },
        ],
        testCases: [
          {
            input: '2\n1 2\n2\n3 4',
            output: '2.5',
          },
          {
            input: '2\n0 0\n2\n0 0',
            output: '0.0',
          },
          {
            input: '0\n\n1\n1',
            output: '1.0',
          },
          {
            input: '1\n2\n0\n',
            output: '2.0',
          },
          {
            input: '2\n1 3\n2\n2 7',
            output: '2.5',
          },
          // TLE test case: two arrays of length 1000, all 1s
          {
            input: '1000\n' + Array(1000).fill('1').join(' ') + '\n1000\n' + Array(1000).fill('1').join(' '),
            output: '1.0',
            isHidden: true,
          },
        ],
        tags: ['array', 'binary-search', 'divide-and-conquer'],
      },
    ];

    let inserted = 0;
    for (const p of problems) {
      const slug = slugify(p.title, { lower: true });
      const exists = await Problem.findOne({ slug });
      if (exists) {
        console.log(`Skipping "${p.title}" – already exists.`);
        continue;
      }

      await Problem.create({
        ...p,
        slug,
        createdBy: adminUser._id,
        isPublic: true,
        timeLimit: 1000,
        memoryLimit: 256,
        // testCases are now included in the problem definitions above
        testCases: p.testCases || [],
      });
      console.log(`Inserted "${p.title}"`);
      inserted++;
    }

    console.log(`Seed finished – ${inserted} new problems inserted.`);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
})();
