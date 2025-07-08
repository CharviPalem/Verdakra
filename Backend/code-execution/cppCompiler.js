const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { generateFile } = require("./generateFile");
const { generateInputFile } = require("./generateInputFile");

const executeCpp = (code, input, timeoutMs = 5000) => {
  console.log('[CppCompiler] Starting execution.');
  return new Promise(async (resolve, reject) => {
    let filePath, inputPath, outputPath;
    let settled = false;
    function safeResolve(val) { if (!settled) { settled = true; resolve(val); } }
    function safeReject(val) { if (!settled) { settled = true; reject(val); } }
    try {
      const fileData = await generateFile('cpp', code);
      filePath = fileData.filePath;
      const dirPath = path.dirname(filePath);
      outputPath = path.join(dirPath, `${fileData.uniqueName}.out`);
      console.log(`[CppCompiler] Generated code file: ${filePath}`);

      const inputData = await generateInputFile(fileData.uniqueName, input);
      inputPath = inputData.inputPath;
      console.log(`[CppCompiler] Generated input file: ${inputPath}`);

      const command = `g++ "${filePath}" -o "${outputPath}" && "${outputPath}" < "${inputPath}"`;
      console.log(`[CppCompiler] Executing command: ${command}`);

      const childProcess = exec(command, (error, stdout, stderr) => {
        console.log('[CppCompiler] Execution finished.');
        // Cleanup all generated files
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (outputPath && fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

        if (error) {
          console.error('[CppCompiler] Execution error:', error);
          return safeReject({ error, stderr: stderr || error.message });
        }
        if (stderr) {
          console.error('[CppCompiler] Execution produced stderr:', stderr);
          return safeReject({ stderr });
        }
        console.log('[CppCompiler] Execution successful. stdout:', stdout);
        safeResolve(stdout);
      });

      const timeout = setTimeout(() => {
        console.log('[CppCompiler] Execution timed out. Killing process.');
        childProcess.kill();
        safeReject({ stderr: 'Time Limit Exceeded' });
      }, timeoutMs); // Use per-problem timeout

      childProcess.on('exit', (code) => {
        clearTimeout(timeout);
        console.log(`[CppCompiler] Process exited with code ${code}`);
      });

    } catch (e) {
      console.error('[CppCompiler] Setup error:', e);
      // Cleanup any files that might have been created
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (outputPath && fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      reject({ stderr: 'Internal compiler setup error.' });
    }
  });
};

module.exports = {
  executeCpp,
};
