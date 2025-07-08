const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const dirInputs = path.join(__dirname, "inputs");

if (!fs.existsSync(dirInputs)) {
  fs.mkdirSync(dirInputs, { recursive: true });
}

const generateInputFile = async (uniqueName, input) => {
  const input_filename = `${uniqueName}.txt`;
  const inputPath = path.join(dirInputs, input_filename);
  await fs.promises.writeFile(inputPath, input || "");
  return { inputPath };
};

module.exports = {
  generateInputFile,
};
