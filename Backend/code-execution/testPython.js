// testPython.js
const { executePython } = require('./pythonCompiler');

const code = `
a = int(input())
b = int(input())
print(a + b)
`;

const input = "3\n4";

executePython(code, input, 5000)
  .then(output => {
    console.log('Output:', output);
  })
  .catch(error => {
    console.error('Error:', error);
  });
