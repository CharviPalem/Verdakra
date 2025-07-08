const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const { executePython } = require('./pythonCompiler');
const { executeCpp } = require('./cppCompiler');
const { executeJava } = require('./javaCompiler');

const judgeSubmission = async (submissionId) => {
    try {
        const submission = await Submission.findById(submissionId).populate('problem');
        if (!submission) {
            console.error(`Submission ${submissionId} not found.`);
            return;
        }

        const { code, language, problem } = submission;
        const allTestCases = [...problem.sampleTestCases, ...problem.testCases];

        let overallStatus = 'accepted';
        const results = [];

        const startSubmission = Date.now();
for (let i = 0; i < allTestCases.length; i++) {
    const testCase = allTestCases[i];
    const start = Date.now();
    try {
        let output;
        let timeoutMs = (problem && problem.timeLimit ? problem.timeLimit * 1000 : (language.toLowerCase() === 'java' ? 10000 : 5000));
        switch (language.toLowerCase()) {
            case 'python':
                output = await executePython(code, testCase.input, timeoutMs);
                break;
            case 'cpp':
                output = await executeCpp(code, testCase.input, timeoutMs);
                break;
            case 'java':
                output = await executeJava(code, testCase.input, timeoutMs);
                break;
            default:
                throw new Error(`Unsupported language: ${language}`);
        }
        const execTime = Date.now() - start;
        const passed = output.trim() === testCase.output.trim();
        if (!passed && overallStatus === 'accepted') {
            overallStatus = 'wrong_answer';
        }
        results.push({
            testCaseNumber: i + 1,
            passed,
            executionTime: execTime,
            input: testCase.input,
            expected: testCase.output,
            actual: output,
            errorMessage: null
        });
    } catch (error) {
        const execTime = Date.now() - start;
        let isTLE = error.stderr && error.stderr.includes('Time Limit Exceeded');
        if (isTLE) {
            overallStatus = 'time_limit_exceeded';
        } else {
            overallStatus = 'runtime_error';
        }
        results.push({
            testCaseNumber: i + 1,
            passed: false,
            executionTime: execTime,
            input: testCase.input,
            expected: testCase.output,
            actual: error.stderr || 'Execution Error',
            errorMessage: error.stderr || 'Execution Error'
        });
        break; // Stop on first error or TLE
    }
}
const totalExecTime = Date.now() - startSubmission;

        submission.status = overallStatus;
submission.testCaseResults = results;
submission.executionTime = totalExecTime;
await submission.save();

// Update problem stats
if (overallStatus === 'accepted') {
    await Problem.findByIdAndUpdate(problem._id, { $inc: { acceptedCount: 1 } });
}

    } catch (error) {
        console.error(`Failed to judge submission ${submissionId}:`, error);
        try {
            // Mark submission as failed
            await Submission.findByIdAndUpdate(submissionId, { status: 'internal-error' });
        } catch (updateError) {
            console.error(`Failed to update submission ${submissionId} status to internal-error:`, updateError);
        }
    }
};

module.exports = {
    judgeSubmission,
};
