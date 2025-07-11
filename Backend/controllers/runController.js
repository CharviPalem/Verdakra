const Problem = require('../models/Problem');
const { executePython } = require('../code-execution/pythonCompiler');
const { executeCpp } = require('../code-execution/cppCompiler');
const { executeJava } = require('../code-execution/javaCompiler');

// Run code against sample test cases
exports.runCode = async (req, res) => {
  console.log('Run code request received.');
  try {
    const { problemId, language, code, customInput } = req.body;

    if (!problemId || !language || !code) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Always fetch problem first
    const problem = await Problem.findById(problemId);

    // Handle custom input run
    if (typeof customInput === 'string') {
      console.log(`Starting custom run for language: ${language}`);
      try {
        let output, tle = false;
        try {
          switch (language.toLowerCase()) {
            case 'python':
              output = await executePython(code, customInput, (problem && problem.timeLimit ? problem.timeLimit * 1000 : 5000));
              break;
            case 'cpp':
              output = await executeCpp(code, customInput, (problem && problem.timeLimit ? problem.timeLimit * 1000 : 5000));
              break;
            case 'java':
              output = await executeJava(code, customInput, (problem && problem.timeLimit ? problem.timeLimit * 1000 : 10000));
              break;
            default:
              return res.status(400).json({ success: false, message: `${language} is not supported yet.` });
          }
          console.log('Custom run successful, sending output.');
          return res.status(200).json({ success: true, output, tle: false });
        } catch (error) {
          tle = error.stderr && error.stderr.includes('Time Limit Exceeded');
          return res.status(200).json({ success: true, output: error.stderr || 'Execution Error', tle });
        }
      } catch (error) {
        console.error('Error during custom run:', error);
        // Send error back to be displayed in the terminal
        return res.status(200).json({ success: true, output: error.stderr || 'Execution Error' });
      }
    }

    console.log(`Starting standard test case run for problem: ${problemId}`);
    // Handle standard test case run
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    const results = [];
    // Only use first 2 sample test cases for run
    const publicTestCases = problem.sampleTestCases.slice(0, 2);
    for (const testCase of publicTestCases) {
      try {
        let output;
        let tle = false;
        switch (language.toLowerCase()) {
          case 'python':
            output = await executePython(code, testCase.input, (problem && problem.timeLimit ? problem.timeLimit * 1000 : 5000));
            break;
          case 'cpp':
            output = await executeCpp(code, testCase.input, (problem && problem.timeLimit ? problem.timeLimit * 1000 : 5000));
            break;
          case 'java':
            output = await executeJava(code, testCase.input, (problem && problem.timeLimit ? problem.timeLimit * 1000 : 10000));
            break;
          default:
            results.push({
              input: testCase.input,
              expected: testCase.output,
              actual: `${language} is not supported yet.`,
              passed: false,
              error: true,
              status: 'Error',
            });
            continue;
        }
        const passed = output.trim() === testCase.output.trim();
        results.push({
          input: testCase.input,
          expected: testCase.output,
          actual: output,
          passed,
          error: false,
          status: 'OK',
        });
      } catch (error) {
        const tle = error.stderr && error.stderr.includes('Time Limit Exceeded');
        results.push({
          input: testCase.input,
          expected: testCase.output,
          actual: error.stderr || 'Execution Error',
          passed: false,
          error: true,
          status: tle ? 'TLE' : 'Error',
        });
      }
    }

    return res.status(200).json({ success: true, results });
  } catch (err) {
    console.error('Run error', err);
    res.status(500).json({ success: false, message: 'Server error during code execution.', error: err.message });
  }
};
