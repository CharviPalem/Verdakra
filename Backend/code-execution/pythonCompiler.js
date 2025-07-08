const { exec } = require("child_process");
const fs = require("fs");
const { generateFile } = require("./generateFile");
const { generateInputFile } = require("./generateInputFile");

const executePython = (code, input, timeoutMs = 5000) => {
  console.log('[PythonCompiler] Starting execution.');
  return new Promise(async (resolve, reject) => {
    let filePath, inputPath;
    let settled = false;
    function safeResolve(val) { if (!settled) { settled = true; resolve(val); } }
    function safeReject(val) { if (!settled) { settled = true; reject(val); } }
    try {
      const fileData = await generateFile('py', code);
      filePath = fileData.filePath;
      console.log(`[PythonCompiler] Generated code file: ${filePath}`);

      const inputData = await generateInputFile(fileData.uniqueName, input);
      inputPath = inputData.inputPath;
      console.log(`[PythonCompiler] Generated input file: ${inputPath}`);

      const command = `python3 ${filePath} < ${inputPath}`;
      console.log(`[PythonCompiler] Executing command: ${command}`);

      const childProcess = exec(command, (error, stdout, stderr) => {
        console.log('[PythonCompiler] Execution finished.');
        // Cleanup files
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

        if (error) {
          console.error('[PythonCompiler] Execution error:', error);
          return safeReject({ error, stderr: stderr || error.message });
        }
        if (stderr) {
          console.warn('[PythonCompiler] Execution produced stderr:', stderr);
          return safeReject({ stderr });
        }
        console.log('[PythonCompiler] Execution successful. stdout:', stdout);
        safeResolve(stdout);
      });

      const timeout = setTimeout(() => {
        console.log('[PythonCompiler] Execution timed out. Killing process.');
        childProcess.kill();
        safeReject({ stderr: 'Time Limit Exceeded' });
      }, timeoutMs); // Use per-problem timeout

      childProcess.on('exit', (code) => {
        clearTimeout(timeout);
        console.log(`[PythonCompiler] Process exited with code ${code}`);
      });

    } catch (e) {
      console.error('[PythonCompiler] Setup error:', e);
      // Cleanup any files that might have been created before the error
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      reject({ stderr: 'Internal compiler setup error.' });
    }
  });
};

module.exports = {
  executePython,
};
