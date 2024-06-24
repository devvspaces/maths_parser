import readline from "node:readline/promises";
import { exit, stdin as input, stdout as output } from "node:process";
import { AbstractSyntaxNode, Token, TokenType } from "./types";

const PRECEDENCE = {
  "+": 10,
  "-": 10,
  "*": 20,
  "/": 20,
  "^": 30,
};
type OPT = keyof typeof PRECEDENCE;

class InputStream {
  input: string;
  cursor = -1;
  ch: string;

  constructor(input: string) {
    this.input = input;
  }

  peek() {
    return this.input[this.cursor + 1];
  }

  next() {
    this.cursor++;
    this.ch = this.input[this.cursor];
    return this.ch;
  }

  eof() {
    if (this.peek() === undefined) return true;
    return false;
  }

  croak(err: string) {
    return new Error(`Error: ${err}`);
  }
}

class TokenStream {
  input: InputStream;

  constructor(input: InputStream) {
    this.input = input;
  }

  isOp(ch: string) {
    return Object.keys(PRECEDENCE).indexOf(ch) >= 0;
  }

  isDigit(ch: string) {
    return /[0-9]/i.test(ch);
  }

  isWhiteSpace(ch: string) {
    return ch === " ";
  }

  readNumber(): number {
    let num = this.input.ch;
    let hasDot = false;
    while (!this.input.eof()) {
      const nextChar = this.input.peek();
      if (this.isDigit(nextChar)) {
        num += this.input.next();
      } else if (nextChar === ".") {
        if (hasDot) {
          throw this.input.croak(
            `Expected a number or operator, got a '.' on pos: ${this.input.cursor}`
          );
        }
        num += this.input.next();
        hasDot = true;
      } else {
        break;
      }
    }
    return parseFloat(num);
  }

  next(): Token {
    if (this.input.eof()) {
      return null;
    }
    this.input.next();
    if (this.isOp(this.input.ch)) {
      return {
        type: TokenType.OP,
        value: this.input.ch,
      };
    }
    if (this.isDigit(this.input.ch)) {
      return {
        type: TokenType.NUM,
        value: this.readNumber(),
      };
    }
    if (this.isWhiteSpace(this.input.ch)) return this.next();
    throw this.input.croak(
      `Unexpected character '${this.input.ch}' on pos: ${this.input.cursor}`
    );
  }
}

class Parser {
  constructor(public tokenStream: TokenStream) {}

  parse(): AbstractSyntaxNode {
    let tree: AbstractSyntaxNode = this.tokenStream.next();
    while (!this.tokenStream.input.eof()) {
      const node: AbstractSyntaxNode = this.tokenStream.next();
      if (node) {
        if (node.type === TokenType.OP) {
          if (tree.type === TokenType.OP) {
            if (!tree.right) {
              throw this.tokenStream.input.croak(
                `Invalid format on pos ${this.tokenStream.input.cursor}`
              );
            }
            if (PRECEDENCE[node.value as OPT] > PRECEDENCE[tree.value as OPT]) {
              node.left = tree.right;
              tree.right = node;
            } else {
              node.left = tree;
              tree = node;
            }
          } else {
            node.left = tree;
            tree = node;
          }
        } else {
          if (!tree.right) {
            tree.right = node;
          } else if (!tree.right.right) {
            tree.right.right = node;
          } else {
            throw this.tokenStream.input.croak(
              `Invalid format on pos ${this.tokenStream.input.cursor}`
            );
          }
        }
      }
    }
    return tree;
  }

  printTree(tree: AbstractSyntaxNode) {
    console.log(JSON.stringify(tree, undefined, 4))
  }
}

const OPERATORS = {
  ADD: (a: number, b: number) => a + b,
  SUB: (a: number, b: number) => a - b,
  MUL: (a: number, b: number) => a * b,
  DIV: (a: number, b: number) => a / b,
  POW: Math.pow,
};

class AstProcessor {
  getFn(op: string) {
    switch (op) {
      case "+":
        return OPERATORS.ADD;
      case "-":
        return OPERATORS.SUB;
      case "*":
        return OPERATORS.MUL;
      case "/":
        return OPERATORS.DIV;
      case "^":
        return OPERATORS.POW;
      default:
        throw new Error("Invalid operator");
    }
  }

  calculate(tree: AbstractSyntaxNode): number {
    if (tree.type === TokenType.NUM) return tree.value as number;
    return this.getFn(tree.value as string)(
      this.calculate(tree.left),
      this.calculate(tree.right)
    );
  }
}

async function main() {
  const prompt = readline.createInterface(input, output);
  const answer = await prompt.question("Enter a valid maths expression? ");
  if (answer) {
    const parser = new Parser(new TokenStream(new InputStream(answer)));
    const tree = parser.parse();
    parser.printTree(tree);
    const processor = new AstProcessor();
    return processor.calculate(tree);
  }
  throw new Error("No expression inputted!");
}

main().then((result) => {
  console.log("Result: ", result);
  exit();
});
