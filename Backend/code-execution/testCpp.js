const { executeCpp } = require('./cppCompiler');

const code = `#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}`;

const input = "5 7";

executeCpp(code, input, 5000)
    .then(output => {
        console.log('Output:', output);
    })
    .catch(error => {
        console.error('Error:', error);
    });
