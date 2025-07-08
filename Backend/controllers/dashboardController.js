const Submission = require('../models/Submission');
const Problem = require('../models/Problem');

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get stats: problems solved, total submissions
    const solvedProblemIds = await Submission.distinct('problem', { user: userId, status: 'accepted' });
    const problemsSolved = solvedProblemIds.length;
    const totalSubmissions = await Submission.countDocuments({ user: userId });

    // 2. Get progress by difficulty (use solvedProblemIds for accurate solved counts)
    const allProblemsList = await Problem.find({});
    const progress = {
      easy: { solved: 0, total: 0 },
      medium: { solved: 0, total: 0 },
      hard: { solved: 0, total: 0 },
    };
    allProblemsList.forEach(p => {
      if (p.difficulty in progress) {
        progress[p.difficulty].total++;
        if (solvedProblemIds.map(id => id.toString()).includes(p._id.toString())) {
          progress[p.difficulty].solved++;
        }
      }
    });

    // 3. Get the most recently solved unique problems (LeetCode-style, top 3)
    const recentSolvedAgg = await Submission.aggregate([
      { $match: { user: req.user._id, status: 'accepted' } },
      { $sort: { createdAt: -1 } },
      { $group: {
          _id: "$problem",
          submissionId: { $first: "$_id" },
          createdAt: { $first: "$createdAt" }
        }
      },
      { $sort: { createdAt: -1 } },
      { $limit: 3 }
    ]);

    // Fetch problem details for the 3 problems
    const problemIds = recentSolvedAgg.map(item => item._id);
    const problems = await Problem.find({ _id: { $in: problemIds } });
    // Map for quick lookup
    const problemMap = {};
    problems.forEach(p => { problemMap[p._id.toString()] = p; });

    // Compose the recentProblems array in the correct order
    const recentProblems = recentSolvedAgg.map(item => {
      const p = problemMap[item._id.toString()];
      if (!p) return null; // skip if missing
      return {
        id: p._id,
        title: p.title,
        slug: p.slug,
        difficulty: p.difficulty,
        lastAttempted: item.createdAt,
        status: 'Solved'
      };
    }).filter(Boolean);

    // 4. Calculate Rank
    const usersWithMoreSolvedProblems = await Submission.aggregate([
        { $match: { status: 'accepted' } },
        { $group: { _id: "$user", solvedProblems: { $addToSet: "$problem" } } },
        { $project: { solvedCount: { $size: "$solvedProblems" } } },
        { $match: { solvedCount: { $gt: problemsSolved } } },
        { $count: 'rank' }
    ]);
    const rank = usersWithMoreSolvedProblems.length > 0 ? usersWithMoreSolvedProblems[0].rank + 1 : 1;

    // 5. Calculate Current Streak
    const submissions = await Submission.find({ user: userId, status: 'accepted' }).sort({ createdAt: -1 });
    let streak = 0;
    if (submissions.length > 0) {
        const submissionDates = [...new Set(submissions.map(s => s.createdAt.toISOString().split('T')[0]))];
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (submissionDates[0] === today.toISOString().split('T')[0] || submissionDates[0] === yesterday.toISOString().split('T')[0]) {
            streak = 1;
            let lastDate = new Date(submissionDates[0]);
            for (let i = 1; i < submissionDates.length; i++) {
                const currentDate = new Date(submissionDates[i]);
                const diffTime = lastDate - currentDate;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    streak++;
                    lastDate = currentDate;
                } else {
                    break;
                }
            }
        }
    }

    // 6. Get all problems with solved status for the user
    const allProblems = await Problem.find({});
    // Set of solved problem IDs for quick lookup
    const solvedProblemIdSet = new Set(solvedProblemIds.map(id => id.toString()));
    const allProblemsWithStatus = allProblems.map(p => ({
      id: p._id,
      title: p.title,
      slug: p.slug,
      difficulty: p.difficulty,
      status: solvedProblemIdSet.has(p._id.toString()) ? 'Solved' : 'Unsolved'
    }));

    res.status(200).json({
      success: true,
      data: {
        stats: {
          problemsSolved,
          submissions: totalSubmissions,
          rank,
          streak,
        },
        progress,
        recentProblems,
        allProblemsWithStatus,
      },
    });

  } catch (error) {
    res.status(500).json({ success: false, message: `Server Error: ${error.message}` });
  }
};

module.exports = { getDashboardStats };
