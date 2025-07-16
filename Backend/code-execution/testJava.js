// testJava.js
const { executeJava } = require('./javaCompiler');

const code = `
import java.util.Scanner;

public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int a = sc.nextInt();
    int b = sc.nextInt();
    System.out.println(a + b);
  }
}
`;

const input = "8 9";

executeJava(code, input, 5000)
  .then(output => {
    console.log('Output:', output);
  })
  .catch(error => {
    console.error('Error:', error);
  });
