export enum TokenType {
  NUM = "number",
  OP = "operator",
}

export interface Token {
  type: TokenType;
  value: string | number;
}

export interface AbstractSyntaxNode {
  type: TokenType;
  value: string | number;
  left?: AbstractSyntaxNode;
  right?: AbstractSyntaxNode;
}