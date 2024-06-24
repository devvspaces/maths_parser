# Maths Parser

A simple maths parser that can parse and evaluate mathematical expressions. It uses a recursive descent parser to parse the expression and then evaluates the expression using a simple recursive algorithm. The parser can handle the following operators: `+`, `-`, `*`, `/`, `^`.

It handles operator precedence and associativity. The precedence of the operators is as follows:

1. `^`
2. `*`, `/`
3. `+`, `-`

## Grammar

```txt
expression = term { ( "+" | "-" ) term }
term = factor { ( "*" | "/" ) factor }
factor = number | "(" expression ")"
number = [0-9]+
```

## Lexical analysis

### Token types

- `NUMBER` - A number
- `OPERATOR` - An operator

### Token structure

#### `NUMBER`

- `type` - `NUMBER`
- `value` - The number

#### `OPERATOR`

- `type` - `OPERATOR`
- `value` - The operator
- `left` - The left operand
- `right` - The right operand

## Usage

```bash
npm run build
npm run start
```

You can a cli where you can enter a mathematical expression and it will be parsed and evaluated.

## Example

```bash
> 3 + 3 ^ 2

{
    "type": "operator",
    "value": "+",
    "left": {
        "type": "number",
        "value": 3
    },
    "right": {
        "type": "operator",
        "value": "^",
        "left": {
            "type": "number",
            "value": 3
        },
        "right": {
            "type": "number",
            "value": 2
        }
    }
}

12
```
