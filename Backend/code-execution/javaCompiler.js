const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { generateFile } = require("./generateFile");
const { generateInputFile } = require("./generateInputFile");

const executeJava = (code, input, timeoutMs = 10000) => {
  console.log('[JavaCompiler] Starting execution.');
  return new Promise(async (resolve, reject) => {
    let filePath, inputPath, dirPath, classFilePath;
    let settled = false;
    function safeResolve(val) { if (!settled) { settled = true; resolve(val); } }
    function safeReject(val) { if (!settled) { settled = true; reject(val); } }
    try {
      // Generate file with fixed name Main.java
      const uniqueName = 'Main';
      const fileName = `${uniqueName}.java`;
      const filePath = path.join(__dirname, 'codes', fileName);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
      }
      
      // Write code to file
      fs.writeFileSync(filePath, code);
      
      dirPath = path.dirname(filePath);
      classFilePath = path.join(dirPath, 'Main.class');
      console.log(`[JavaCompiler] Generated code file: ${filePath}`);

      const inputData = await generateInputFile(uniqueName, input);
      inputPath = inputData.inputPath;
      console.log(`[JavaCompiler] Generated input file: ${inputPath}`);

      const command = `javac "${filePath}" && java -cp "${dirPath}" Main < "${inputPath}"`;
      console.log(`[JavaCompiler] Executing command: ${command}`);

      const childProcess = exec(command, (error, stdout, stderr) => {
        console.log('[JavaCompiler] Execution finished.');
        // Cleanup all generated files
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (classFilePath && fs.existsSync(classFilePath)) fs.unlinkSync(classFilePath);

        if (error) {
          console.error('[JavaCompiler] Execution error:', error);
          return safeReject({ error, stderr: stderr || error.message });
        }
        // javac warnings can go to stderr. We only reject if there's no stdout.
        if (stderr && !stdout) {
            console.error('[JavaCompiler] Execution produced stderr without stdout:', stderr);
            return safeReject({ stderr });
        }
        console.log('[JavaCompiler] Execution successful. stdout:', stdout);
        safeResolve(stdout);
      });

      const timeout = setTimeout(() => {
        console.log('[JavaCompiler] Execution timed out. Killing process.');
        childProcess.kill();
      }, timeoutMs);

      childProcess.on('exit', (code) => {
        clearTimeout(timeout);
        console.log(`[JavaCompiler] Process exited with code ${code}`);
      });
    } catch (e) {
      console.error('[JavaCompiler] Setup error:', e);
      // Cleanup any files that might have been created
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (classFilePath && fs.existsSync(classFilePath)) fs.unlinkSync(classFilePath);
      reject({ stderr: 'Internal compiler setup error.' });
    }
  });
};

module.exports = {
  executeJava,
};
