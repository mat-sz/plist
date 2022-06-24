import { Value } from '@plist/common';

const UNQUOTED_STRING_REGEX = /^[A-Za-z0-9_$+\/:.-]+$/;

const escapeString = (string: string) =>
  JSON.stringify(string)
    .slice(1, -1)
    .replace(
      /[^\x20-\x7F]/g,
      x => '\\u' + x.codePointAt(0)!.toString(16).padStart(4, '0')
    );

const pad = (n: number) => {
  return n < 10 ? '0' + n : n;
};

const ISODateString = (d: Date): string => {
  return (
    d.getUTCFullYear() +
    '-' +
    pad(d.getUTCMonth() + 1) +
    '-' +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    ':' +
    pad(d.getUTCMinutes()) +
    ':' +
    pad(d.getUTCSeconds()) +
    'Z'
  );
};

export const serialize = (value: Value): string => {
  if (value === null) {
    throw new Error('Unsupported null value');
  }

  switch (typeof value) {
    case 'string':
      if (UNQUOTED_STRING_REGEX.test(value)) {
        return value;
      } else {
        return `"${escapeString(value)}"`;
      }
    case 'bigint':
    case 'number':
      return value.toString();
    case 'boolean':
      return value ? '1' : '0';
    case 'object':
      if (Array.isArray(value)) {
        return `(${value.map(serialize).join(',')})`;
      } else if (value instanceof Date) {
        return ISODateString(value);
      } else if (value instanceof ArrayBuffer) {
        return `<${new Uint8Array(value).reduce((str, byte) => {
          return str + byte.toString(16).padStart(2, '0');
        }, '')}>`;
      } else {
        if (Object.keys(value).length === 0) {
          return '{}';
        }

        return `{${Object.keys(value)
          .map(key => `${serialize(key)}=${serialize(value[key])}`)
          .join(';')};}`;
      }
  }

  throw new Error(`Unsupported value type ${typeof value}`);
};
