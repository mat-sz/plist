import { Value } from '@plist/common';

const UNQUOTED_STRING_CHAR_REGEX = /[A-Za-z0-9_$+\/:.-]/;
const HEX_DIGIT_REGEX = /[A-Fa-f0-9]/;
const WHITESPACE = [' ', '\t', '\n', '\r'];

const unescapeString = (string: string): string => {
  return JSON.parse(`"${string}"`);
};

const consumeToken = (
  input: string,
  token: string,
  optional = false
): [string | null, string] => {
  [, input] = consumeWhitespaceAndComments(input);

  if (!input.startsWith(token)) {
    if (optional) {
      return [null, input];
    }

    throw new Error(`Expected '${token}'`);
  }

  input = input.substr(token.length);
  [, input] = consumeWhitespaceAndComments(input);
  return [token, input];
};

const consumeWhitespaceAndComments = (input: string): [null, string] => {
  let skipUntil: string | undefined = undefined;

  while (input.length > 0) {
    if (skipUntil) {
      if (!input.startsWith(skipUntil)) {
        input = input.substr(1);
        continue;
      } else {
        input = input.substr(skipUntil.length);
        skipUntil = undefined;
      }
    }

    const char = input.substr(0, 1);
    input = input.substr(1);

    if (WHITESPACE.includes(char)) {
      continue;
    }

    switch (char) {
      case '/':
        const next = input.charAt(0);
        switch (next) {
          case '*':
            skipUntil = '*/';
            break;
          case '/':
            skipUntil = '\n';
            break;
          default:
            throw new Error("Unexpected '/'");
        }
        break;
      default:
        return [null, char + input];
    }
  }

  return [null, input];
};

const consumeValue = (input: string): [Value, string] => {
  [, input] = consumeWhitespaceAndComments(input);

  if (input.length === 0) {
    return [null, ''];
  }

  let result: Value = null;

  const char = input.substr(0, 1);
  input = input.substr(1);

  switch (char) {
    case '{':
      result = {};

      [, input] = consumeWhitespaceAndComments(input);
      if (input.charAt(0) === '}') {
        [, input] = consumeToken(input, '}');
        break;
      }

      while (input.charAt(0) !== '}') {
        let key: Value, value: Value;
        [key, input] = consumeValue(input);
        if (typeof key !== 'string') {
          throw new Error('Expected string key');
        }

        if (key === '__proto__') {
          throw new Error('Attempted prototype pollution');
        }

        [, input] = consumeToken(input, '=');
        [value, input] = consumeValue(input);
        result[key] = value;
        [, input] = consumeToken(input, ';');

        if (input.length === 0) {
          throw new Error("No matching '}' found");
        }
      }

      [, input] = consumeToken(input, '}');
      break;
    case '(':
      result = [];

      [, input] = consumeWhitespaceAndComments(input);
      if (input.charAt(0) === ')') {
        [, input] = consumeToken(input, ')');
        break;
      }

      while (input.charAt(0) !== ')') {
        let value: Value, token: string | null;
        [value, input] = consumeValue(input);
        result.push(value);

        [token, input] = consumeToken(input, ',', true);
        if (!token) {
          break;
        }

        if (input.length === 0) {
          throw new Error("No matching ')' found");
        }
      }

      [, input] = consumeToken(input, ')');
      break;
    case '<':
      let hexString = '';

      [, input] = consumeWhitespaceAndComments(input);
      if (input.charAt(0) === '>') {
        [, input] = consumeToken(input, '>');
        break;
      }

      while (input.charAt(0) !== '>') {
        const digit = input.charAt(0);
        input = input.substr(1);

        if (HEX_DIGIT_REGEX.test(digit)) {
          hexString += digit;
        } else if (WHITESPACE.includes(digit)) {
          continue;
        } else {
          throw new Error(`Unexpected '${digit}'`);
        }

        if (input.length === 0) {
          throw new Error("No matching '>' found");
        }
      }

      if (hexString.length > 0) {
        if (hexString.length % 2 === 1) {
          throw new Error('Data must contain hex digits grouped in pairs');
        }

        const hexBytes = hexString.match(/../g);
        if (hexBytes !== null) {
          result = new Uint8Array(hexBytes.map(h => parseInt(h, 16))).buffer;
        }
      }

      [, input] = consumeToken(input, '>');
      break;
    case '"':
      result = '';

      while (input.charAt(0) !== '"') {
        result += input.charAt(0);
        if (input.charAt(0) === '\\') {
          result += input.charAt(1);
          input = input.substr(2);
        } else {
          input = input.substr(1);
        }

        if (input.length === 0) {
          throw new Error("No matching '\"' found");
        }
      }

      result = unescapeString(result);

      [, input] = consumeToken(input, '"');
      break;
    default:
      if (!UNQUOTED_STRING_CHAR_REGEX.test(char)) {
        throw new Error(`Unexpected '${char}'`);
      }

      result = char;
      while (UNQUOTED_STRING_CHAR_REGEX.test(input.charAt(0))) {
        result += input.charAt(0);
        input = input.substr(1);

        if (input.length === 0) {
          break;
        }
      }
  }

  [, input] = consumeWhitespaceAndComments(input);
  return [result, input];
};

export const parse = (input: string): Value => {
  const [value, left] = consumeValue(input);

  if (left.length > 0) {
    throw new Error('Unexpected content at the end of file');
  }

  if (typeof value === 'undefined') {
    throw new Error('Parsing failed');
  }

  return value;
};
