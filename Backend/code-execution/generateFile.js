const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const dirCodes = path.join(__dirname, "codes");

if (!fs.existsSync(dirCodes)) {
  fs.mkdirSync(dirCodes, { recursive: true });
}

const sanitizeJobId = (jobId) => {
  // Replace non-alphanumeric characters with underscores and prepend with "Class" to ensure a valid class name
  return `Class_${jobId.replace(/[^a-zA-Z0-9]/g, "_")}`;
};

const generateFile = async (format, content) => {
  const jobID = uuid();
  let filename;
  // Sanitize HTML entities from the code
  const sanitizedContent = content.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

  if (format === "java") {
    const sanitizedJobId = sanitizeJobId(jobID);
    filename = `${sanitizedJobId}.${format}`;
  } else {
    filename = `${jobID}.${format}`;
  }
  
  const filePath = path.join(dirCodes, filename);
  await fs.promises.writeFile(filePath, sanitizedContent);
  return { filePath, uniqueName: jobID };
};

module.exports = {
  generateFile,
};
